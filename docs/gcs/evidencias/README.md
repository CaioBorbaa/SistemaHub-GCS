# Evidências de GCS

| # | Item avaliado | Evidência | Arquivo |
|---|---|---|---|
| 1 | Estrutura do repositório + plano de GCS publicado | Plano versionado | [`../PLANO_GCS.md`](../PLANO_GCS.md) |
| 2 | Repositório acessível | Repositório **público**: https://github.com/CaioBorbaa/SistemaHub-GCS | link do repositório |
| 3 | Push direto na `main` recusado | Saída do `git push` com `GH006: Protected branch update failed` | [`push-direto-recusado.txt`](push-direto-recusado.txt) / [`.png`](push-direto-recusado.png) |
| 4 | Revisão antes do merge | Projeto individual: PR #1 com CI aprovado (2 checks) e mergeado por PR — a `main` não aceita push direto | [`pr-revisado.png`](pr-revisado.png) |
| 5 | Environments staging e production | *Settings → Environments* (production com 2 regras, staging com 1) e deploy de production aguardando aprovação → aprovado | [`environments.png`](environments.png), [`production-aguardando-aprovacao.png`](production-aguardando-aprovacao.png), [`production-aprovado.png`](production-aprovado.png) |
| — | Proteção da `main` | *Settings → Branches* | [`protecao-main.png`](protecao-main.png) |

Configuração aplicada com `bash scripts/github/configurar-repositorio.sh CaioBorbaa SistemaHub-GCS`:
`main: PR obrigatório | enforce_admins=true | force push=false`; `production: required_reviewers, branch_policy`; `staging: branch_policy`.

O item 3 foi gerado com: `bash scripts/github/testar-push-direto.sh`
