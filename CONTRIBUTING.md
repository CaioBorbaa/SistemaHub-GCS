# Como contribuir

O processo completo está no [Plano de GCS](docs/gcs/PLANO_GCS.md). Resumo:

1. **Nunca** faça push direto na `main` — ele é recusado pelo GitHub.
2. Crie uma branch: `git switch -c feature/nome-curto` (ou `fix/`, `hotfix/`, `docs/`, `chore/`).
3. Commits no padrão *Conventional Commits*: `feat(admin): adiciona tela de avisos`.
4. `git push -u origin feature/nome-curto` e abra um **Pull Request** para a `main`.
5. Aguarde o **CI** passar e revise o PR pelo checklist do modelo (responsáveis no CODEOWNERS).
6. Merge por *squash*. O deploy vai sozinho para **staging**; **production** só após aprovação do responsável.
7. Nunca versione `.env`, senhas ou chaves — use os *Secrets* dos environments.
