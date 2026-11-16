# Passo a passo da entrega N2-P2 (apague este arquivo depois, se quiser)

Tudo roda no **Git Bash**, dentro desta pasta (`C:\Users\Tintomax\SistemaHub-GCS`).

## 0. Antes de começar
- Instale o GitHub CLI: `winget install GitHub.cli` (feche e reabra o terminal) e faça `gh auth login`.
- Projeto **individual**: não há par de revisão. A `main` exige PR + CI (0 aprovações, pois o GitHub não deixa aprovar o próprio PR) e a aprovação manual fica no environment `production`.

## 1. Criar o repositório reserva (público) e subir
```bash
cd /c/Users/Tintomax/SistemaHub-GCS
git init -b main
git add .
git commit -m "chore: estrutura do repositório e plano de GCS"
gh repo create SistemaHub-GCS --public --source=. --remote=origin --push
```
> Público = acessível para o professor (item 2) e libera proteção de branch e environments
> com revisor no plano gratuito do GitHub (em repositório privado gratuito eles não funcionam).

## 2. Aplicar as regras (itens 3, 4 e 5)
```bash
bash scripts/github/configurar-repositorio.sh CaioBorbaa SistemaHub-GCS
```

## 3. Evidência do push direto recusado (item 3)
```bash
bash scripts/github/testar-push-direto.sh
```
Tire print do terminal mostrando `GH006: Protected branch update failed` → salve em `docs/gcs/evidencias/push-direto-recusado.png`.

## 4. Demonstrar o fluxo (PR + revisão + environments)
```bash
git switch -c docs/evidencias
git add docs/gcs/evidencias
git commit -m "docs(gcs): evidência de push direto recusado"
git push -u origin docs/evidencias
gh pr create --fill --base main
```
1. Confira o checklist do PR e espere o CI ficar verde.
2. Faça o merge (*Squash and merge*).
3. Em **Actions → Deploy**: staging publica sozinho e **production fica “Waiting”** → print → *Review deployments → Approve and deploy*.

## 5. Prints para `docs/gcs/evidencias/` (ver README lá dentro)
- Settings → Branches (regra da `main`)
- Settings → Environments (staging e production com *Required reviewers: você*)
- Deploy de production aguardando aprovação
- PR com checklist preenchido e CI verde (`pr-revisado.png`)

Suba os prints por outro PR (a `main` não aceita push direto — e isso já é mais evidência).

## 6. Entregar
Cole no Teams o link: `https://github.com/CaioBorbaa/SistemaHub-GCS`
