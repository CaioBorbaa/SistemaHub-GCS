# SistemaHub

Hub de Sistemas da Tintomax: página interna onde os colaboradores entram com o CPF e acessam
todos os sistemas da empresa, com painel administrativo para gerenciar o conteúdo.

## Estrutura

| Pasta | O que é |
|---|---|
| [`hub_react/`](hub_react/) | **Versão atual** — React + Tailwind (front-end) e Node/Express (API), com painel `/admin`, temas comemorativos, banners e saco de presentes. Veja o [README](hub_react/README.md) para instalar e rodar. |
| [`sistema_hub/`](sistema_hub/) | Versão anterior em Python/Flask (mesmo banco MySQL). Em `sistema_hub/.BKP/` fica o backup do sistema legado em PHP. |
| [`banners_hub/`](banners_hub/) | Artes de banner no tamanho ideal do carrossel (1920×160, algumas em 2x). |
| [`docs/gcs/`](docs/gcs/) | **[Plano de Gestão de Configuração](docs/gcs/PLANO_GCS.md)** e evidências. |
| [`.github/`](.github/) | CODEOWNERS, modelos de PR/Issue, workflows de CI e deploy (staging → production). |
| [`scripts/github/`](scripts/github/) | Scripts que aplicam as regras do repositório (proteção da `main`, revisor, environments). |

## Gestão de configuração

- A `main` é **protegida**: push direto é recusado; toda mudança entra por Pull Request com 1 aprovação e CI verde.
- Deploy automático em **staging** a cada merge; **production** exige aprovação do responsável.
- Processo completo: [docs/gcs/PLANO_GCS.md](docs/gcs/PLANO_GCS.md) · Como contribuir: [CONTRIBUTING.md](CONTRIBUTING.md) · Versões: [CHANGELOG.md](CHANGELOG.md)

## O que não está no repositório (de propósito)

- **Arquivos `.env`** com as senhas do banco e chaves de API. Use `hub_react/backend/.env.example` como modelo.
- **`conexao.php`** do PHP legado (tinha usuário e senha do banco no código).
- `node_modules/`, `venv/`, `dist/` — recriados com `npm install` / `npm run build`.
- Imagens enviadas pelo painel (`hub_react/backend/uploads/`) — ficam no servidor.
- Backups `.zip` e `error_log` do servidor antigo.
