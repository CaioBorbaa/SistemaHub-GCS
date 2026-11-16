# Evidências de GCS

| # | Item avaliado | Evidência | Arquivo |
|---|---|---|---|
| 1 | Estrutura do repositório + plano de GCS publicado | Plano versionado | [`../PLANO_GCS.md`](../PLANO_GCS.md) |
| 2 | Repositório acessível | Repositório **público** (Settings → General → Danger Zone → Change visibility) | link do repositório |
| 3 | Push direto na `main` recusado | Saída do `git push` + print | `push-direto-recusado.txt` / `.png` |
| 4 | Revisão antes do merge | Projeto individual: print do PR com o checklist preenchido e o CI aprovado, mergeado por PR (a `main` não aceita push direto) | `pr-revisado.png` |
| 5 | Environments staging e production | Print de *Settings → Environments* e do deploy aguardando sua aprovação | `environments.png`, `production-aguardando-aprovacao.png` |
| — | Proteção da `main` | Print de *Settings → Branches* | `protecao-main.png` |

Gere o item 3 com: `bash scripts/github/testar-push-direto.sh`
