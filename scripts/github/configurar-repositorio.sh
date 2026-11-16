#!/usr/bin/env bash
# Aplica no GitHub as regras de GCS descritas em docs/gcs/PLANO_GCS.md:
#   1) adiciona o par de revisão com permissão WRITE (opcional — só se informado)
#   2) protege a main (PR obrigatório + CI + vale para admins, sem force push)
#      com revisor: exige 1 aprovação | sem revisor (projeto individual): 0 aprovações,
#      pois o GitHub não permite aprovar o próprio PR
#   3) cria os environments staging e production (production com você como revisor obrigatório)
#
# Requisitos: GitHub CLI instalado e logado  ->  winget install GitHub.cli  &&  gh auth login
# Uso (Git Bash):  bash scripts/github/configurar-repositorio.sh DONO REPOSITORIO [REVISOR]
# Exemplos:        bash scripts/github/configurar-repositorio.sh CaioBorbaa SistemaHub-GCS
#                  bash scripts/github/configurar-repositorio.sh CaioBorbaa SistemaHub-GCS fulano123
set -euo pipefail

DONO="${1:?Informe o dono do repositório (ex.: CaioBorbaa)}"
REPO="${2:?Informe o nome do repositório (ex.: SistemaHub-GCS)}"
REVISOR="${3:-}"
APROVACOES=0; [ -n "$REVISOR" ] && APROVACOES=1
ALVO="repos/$DONO/$REPO"

echo "==> Conferindo acesso a $DONO/$REPO"
gh api "$ALVO" --jq '"Repositório: \(.full_name) | visibilidade: \(.visibility)"'

if [ -n "$REVISOR" ]; then
  echo "==> 1/3 Convidando @$REVISOR como colaborador com permissão WRITE (push)"
  gh api -X PUT "$ALVO/collaborators/$REVISOR" -f permission=push >/dev/null
  echo "    Convite enviado (o revisor precisa aceitar em github.com/notifications)."
else
  echo "==> 1/3 Sem par de revisão (projeto individual) — nenhum colaborador convidado"
fi

echo "==> 2/3 Protegendo a branch main"
gh api -X PUT "$ALVO/branches/main/protection" --input - <<JSON >/dev/null
{
  "required_status_checks": { "strict": true, "contexts": ["CI - Backend", "CI - Frontend"] },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": $APROVACOES,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false
  },
  "restrictions": null,
  "required_conversation_resolution": true,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON
echo "    main protegida (inclusive para administradores)."

echo "==> 3/3 Criando environments"
MEU_ID=$(gh api "users/$DONO" --jq .id)

gh api -X PUT "$ALVO/environments/staging" --input - <<JSON >/dev/null
{ "deployment_branch_policy": { "protected_branches": true, "custom_branch_policies": false } }
JSON
echo "    staging criado (somente a branch main pode publicar)."

gh api -X PUT "$ALVO/environments/production" --input - <<JSON >/dev/null
{
  "reviewers": [ { "type": "User", "id": $MEU_ID } ],
  "deployment_branch_policy": { "protected_branches": true, "custom_branch_policies": false }
}
JSON
echo "    production criado com @$DONO como REVISOR OBRIGATÓRIO."

echo
echo "==> Conferência"
gh api "$ALVO/branches/main/protection" --jq '"main: PR obrigatório=\(.required_pull_request_reviews.required_approving_review_count) aprovação(ões) | enforce_admins=\(.enforce_admins.enabled) | force push=\(.allow_force_pushes.enabled)"'
gh api "$ALVO/environments" --jq '.environments[] | "environment: \(.name) | regras: \([.protection_rules[].type] | join(", "))"'
[ -n "$REVISOR" ] && { gh api "$ALVO/collaborators/$REVISOR/permission" --jq '"colaborador @\(.user.login // "'"$REVISOR"'"): \(.permission) (se ainda não aceitou o convite, aparece como pendente)"' 2>/dev/null || \
  echo "colaborador @$REVISOR: convite pendente de aceite"; }
echo
echo "Pronto."
[ -n "$REVISOR" ] && echo "Acrescente @$REVISOR em .github/CODEOWNERS e no PLANO_GCS.md (via Pull Request!)."
true
