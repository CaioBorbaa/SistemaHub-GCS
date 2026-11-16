#!/usr/bin/env bash
# Gera a EVIDÊNCIA de que o push direto na main é recusado.
# Cria um commit de teste, tenta "git push origin main", salva a saída em
# docs/gcs/evidencias/push-direto-recusado.txt e desfaz o commit de teste.
#
# Uso (na raiz do repositório, já com a proteção aplicada):
#   bash scripts/github/testar-push-direto.sh
set -uo pipefail

ARQ="docs/gcs/evidencias/push-direto-recusado.txt"
git switch main >/dev/null 2>&1 && git pull --ff-only >/dev/null 2>&1

echo "teste de push direto $(date -Iseconds)" > .teste-push-direto
git add .teste-push-direto
git commit -m "test: tentativa de push direto na main (deve ser recusado)" >/dev/null

{
  echo "# Evidência: push direto na main recusado"
  echo "# Data: $(date '+%d/%m/%Y %H:%M:%S')"
  echo "# Repositório: $(git remote get-url origin)"
  echo "# Usuário git: $(git config user.name)"
  echo "# Comando: git push origin main"
  echo
  git push origin main 2>&1; CODIGO=$?
  echo
  echo "# Código de saída do git push: $CODIGO (diferente de 0 = recusado)"
} | tee "$ARQ.tmp"

# desfaz o commit de teste (nada foi enviado)
git reset --hard HEAD~1 >/dev/null
mv "$ARQ.tmp" "$ARQ"

if grep -q "GH006\|protected branch\|Protected branch" "$ARQ"; then
  echo
  echo "OK: o GitHub RECUSOU o push. Evidência salva em $ARQ"
  echo "Agora tire um print desta tela e salve em docs/gcs/evidencias/push-direto-recusado.png"
  echo "Depois envie a evidência por Pull Request:"
  echo "  git switch -c docs/evidencia-push && git add docs/gcs/evidencias && git commit -m 'docs(gcs): evidência de push direto recusado' && git push -u origin docs/evidencia-push"
else
  echo
  echo "ATENÇÃO: o push NÃO foi recusado. Verifique se a proteção da main foi aplicada."
  echo "Se o commit de teste subiu, remova-o abrindo um PR que apague .teste-push-direto."
fi
