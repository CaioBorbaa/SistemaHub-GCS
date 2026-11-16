# Plano de Gestão de Configuração de Software (GCS)

**Projeto:** SistemaHub — Hub de Sistemas da Tintomax
**Disciplina:** Gestão de Configuração de Software — Avaliação N2-P2
**Responsável (Gerente de Configuração):** Caio Borba (`@CaioBorbaa`)
**Versão do documento:** 1.0.0
**Data:** 16/11/2026

> Este plano é, ele próprio, um **item de configuração** (IC-DOC-01). Ele fica versionado em
> `docs/gcs/PLANO_GCS.md` e só pode ser alterado por Pull Request revisado, como qualquer código.

---

## Histórico de revisões

| Versão | Data       | Autor        | Descrição                         |
|--------|------------|--------------|-----------------------------------|
| 1.0.0  | 16/11/2026 | Caio Borba   | Criação do plano e da estrutura de GCS do repositório |

---

## 1. Introdução

### 1.1 Objetivo
Definir **como** os artefatos do SistemaHub são identificados, versionados, alterados, revisados,
liberados e auditados, garantindo que:

- toda mudança na `main` passe por **Pull Request revisado** (push direto é recusado);
- toda versão em produção seja **rastreável** até o commit, o PR e o revisor que a aprovou;
- a publicação em **produção** dependa de aprovação explícita do responsável.

### 1.2 Escopo
Aplica-se a todo o conteúdo do repositório `SistemaHub`:

| Componente | Tecnologia | Pasta |
|---|---|---|
| Hub (front-end) | React 19 + Vite + Tailwind CSS 4 | `hub_react/frontend/` |
| API (back-end) | Node.js 20+ / Express 5 + MySQL | `hub_react/backend/` |
| Versão anterior (legado) | Python / Flask | `sistema_hub/` |
| Artes de banner | PNG | `banners_hub/` |
| Documentação e GCS | Markdown / YAML | `docs/`, `.github/` |

Fora do escopo (não versionado de propósito): arquivos `.env` com segredos, `node_modules/`,
`dist/`, uploads do painel e backups `.zip` — ver `.gitignore`.

### 1.3 Referências
- IEEE Std 828-2012 — *Configuration Management in Systems and Software Engineering*
- Aula 1 — Plano de GCS do projeto Ongconecta (GitHub da disciplina)
- Semantic Versioning 2.0.0 — <https://semver.org/lang/pt-BR/>
- Conventional Commits 1.0.0 — <https://www.conventionalcommits.org/pt-br/>
- Documentação do GitHub: *Protected branches*, *CODEOWNERS*, *Environments*

### 1.4 Termos
| Termo | Significado |
|---|---|
| IC | Item de Configuração — artefato controlado pela GCS |
| Baseline | Conjunto de ICs aprovados em um ponto no tempo (aqui: uma *tag* `vX.Y.Z`) |
| PR | Pull Request |
| CI | Integração Contínua (GitHub Actions) |
| Staging | Ambiente de homologação |
| Production | Ambiente de produção |

---

## 2. Organização e papéis

| Papel | Quem | Responsabilidades |
|---|---|---|
| **Gerente de Configuração / Dono do repositório** | Caio Borba (`@CaioBorbaa`) | Mantém este plano, configura as proteções da `main`, cria *tags* de release, **revisor obrigatório do environment `production`** |
| **Revisor** | Caio Borba (`@CaioBorbaa`) — projeto individual | Revisa os próprios Pull Requests usando o checklist do modelo de PR antes do merge; listado no `CODEOWNERS` |
| **Desenvolvedor** | Qualquer colaborador | Trabalha em *branches*, abre PRs, corrige apontamentos da revisão |
| **CI (GitHub Actions)** | Automático | Valida o build a cada PR; publica em staging e (após aprovação) em produção |

Permissões no GitHub:

| Pessoa | Permissão no repositório |
|---|---|
| `@CaioBorbaa` | Admin (dono) |

> Mesmo o administrador **não** consegue fazer push direto na `main`: a regra
> *“Do not allow bypassing the above settings”* (`enforce_admins`) está ativa.

---

## 3. Identificação da configuração

### 3.1 Itens de configuração

| ID | Item | Local | Tipo |
|---|---|---|---|
| IC-DOC-01 | Plano de GCS (este documento) | `docs/gcs/PLANO_GCS.md` | Documento |
| IC-DOC-02 | README geral | `README.md` | Documento |
| IC-DOC-03 | Guia de contribuição | `CONTRIBUTING.md` | Documento |
| IC-DOC-04 | Registro de mudanças | `CHANGELOG.md` | Documento |
| IC-DOC-05 | Evidências de GCS | `docs/gcs/evidencias/` | Documento |
| IC-SRC-01 | Front-end (código-fonte) | `hub_react/frontend/src/` | Código |
| IC-SRC-02 | API (código-fonte) | `hub_react/backend/src/` | Código |
| IC-SRC-03 | Scripts de migração/admin | `hub_react/backend/scripts/` | Código |
| IC-DB-01  | Esquema do banco | `hub_react/backend/database/schema.sql` | Banco de dados |
| IC-CFG-01 | Dependências do front-end | `hub_react/frontend/package.json` + `package-lock.json` | Configuração |
| IC-CFG-02 | Dependências da API | `hub_react/backend/package.json` + `package-lock.json` | Configuração |
| IC-CFG-03 | Modelo de variáveis de ambiente | `hub_react/backend/.env.example` | Configuração |
| IC-CFG-04 | Regras de exclusão do Git | `.gitignore` | Configuração |
| IC-CFG-05 | Donos do código | `.github/CODEOWNERS` | Configuração |
| IC-CFG-06 | Pipeline de CI | `.github/workflows/ci.yml` | Configuração |
| IC-CFG-07 | Pipeline de deploy | `.github/workflows/deploy.yml` | Configuração |
| IC-CFG-08 | Modelo de Pull Request | `.github/pull_request_template.md` | Configuração |
| IC-CFG-09 | Script de configuração do GitHub | `scripts/github/` | Configuração |
| IC-LEG-01 | Sistema legado Flask | `sistema_hub/` | Código (somente manutenção) |
| IC-ART-01 | Banners | `banners_hub/` | Mídia |

**Não são ICs** (gerados ou sigilosos): `.env`, `node_modules/`, `dist/`, `uploads/`, logs, `.zip`.
Segredos de produção ficam em **GitHub Secrets** do environment correspondente, nunca no código.

### 3.2 Estrutura do repositório

```
SistemaHub/
├── .github/
│   ├── CODEOWNERS                 # responsáveis pelos itens de configuração
│   ├── pull_request_template.md   # checklist de PR
│   ├── ISSUE_TEMPLATE/            # modelos de solicitação de mudança
│   └── workflows/
│       ├── ci.yml                 # build/validação em todo PR
│       └── deploy.yml             # staging -> production (com aprovação)
├── docs/
│   └── gcs/
│       ├── PLANO_GCS.md           # este plano
│       └── evidencias/            # prints e logs (push recusado, aprovações...)
├── scripts/
│   └── github/                    # automação das regras do repositório (gh CLI)
├── hub_react/
│   ├── backend/                   # API Node/Express
│   └── frontend/                  # React + Vite
├── sistema_hub/                   # legado Flask
├── banners_hub/                   # artes
├── CHANGELOG.md
├── CONTRIBUTING.md
├── README.md
└── .gitignore
```

### 3.3 Convenção de nomes

**Branches**

| Prefixo | Uso | Exemplo |
|---|---|---|
| `main` | Linha principal, sempre implantável. **Protegida.** | — |
| `feature/` | Nova funcionalidade | `feature/painel-rh-ferias` |
| `fix/` | Correção de defeito | `fix/login-cpf-com-pontos` |
| `hotfix/` | Correção urgente em produção | `hotfix/banner-nao-carrega` |
| `docs/` | Somente documentação | `docs/plano-gcs` |
| `chore/` | Manutenção, dependências, CI | `chore/atualiza-vite` |

**Commits** — *Conventional Commits*: `tipo(escopo): descrição no imperativo`

```
feat(admin): adiciona tela de avisos
fix(api): corrige cache do clima
docs(gcs): cria plano de gestão de configuração
chore(ci): adiciona workflow de deploy
```

**Versões e baselines** — *SemVer* `vMAJOR.MINOR.PATCH`, criadas como **tag anotada** na `main`:
- `MAJOR`: quebra de compatibilidade (ex.: mudança no banco que exige migração manual);
- `MINOR`: funcionalidade nova compatível (ex.: novo tema, nova tela no painel);
- `PATCH`: correção.

---

## 4. Controle de configuração (controle de mudanças)

### 4.1 Proteção da `main`
Configurada em *Settings → Branches* (ou pelo script `scripts/github/configurar-repositorio.sh`):

| Regra | Valor |
|---|---|
| Exigir Pull Request antes do merge | ✅ |
| Aprovações necessárias | **1** |
| Descartar aprovações quando houver novo commit | ✅ |
| Exigir checks de status aprovados (CI) | ✅ `CI - Backend`, `CI - Frontend` |
| Exigir branch atualizada antes do merge | ✅ |
| Exigir resolução das conversas | ✅ |
| Incluir administradores (`enforce_admins`) | ✅ |
| Permitir *force push* | ❌ |
| Permitir exclusão da branch | ❌ |

Resultado: `git push origin main` é **recusado** pelo GitHub
(`GH006: Protected branch update failed`). Evidência em `docs/gcs/evidencias/`.

### 4.2 Fluxo de mudança

```
 Issue / solicitação
        │
        ▼
 git switch -c feature/xxx  ──►  commits  ──►  git push origin feature/xxx
        │
        ▼
 Pull Request para main ──► CI (ci.yml) ──► revisão (checklist do PR, CODEOWNERS)
        │                                         │
        │◄──────────── ajustes solicitados ◄───────┘
        ▼
 Merge (squash) na main
        │
        ▼
 deploy.yml ──► environment STAGING (automático)
        │
        ▼
 environment PRODUCTION ──► aguarda aprovação de @CaioBorbaa ──► publicado
```

1. **Solicitação**: abrir *Issue* usando o modelo “Solicitação de mudança” (descreve motivo, impacto e ICs afetados).
2. **Implementação**: em branch própria seguindo a convenção de nomes.
3. **Pull Request**: preencher o modelo (`.github/pull_request_template.md`), referenciar a issue (`Closes #N`).
4. **Verificação automática**: o CI precisa passar.
5. **Revisão**: o responsável revisa o diff e confere o checklist do modelo de PR. Como o projeto é individual e o GitHub não permite aprovar o próprio PR, a proteção da `main` exige PR + CI aprovado (0 aprovações); a aprovação manual obrigatória fica no environment `production`. Se entrar um segundo colaborador, a regra passa a exigir 1 aprovação (`configurar-repositorio.sh` com o usuário do revisor).
6. **Integração**: merge por *squash*, branch apagada após o merge.
7. **Liberação**: deploy automático em *staging*; produção somente após aprovação manual.

### 4.3 Mudanças emergenciais (hotfix)
Seguem o mesmo fluxo (PR + revisão + CI) — **não existe atalho para a `main`**. A urgência é
tratada priorizando a revisão, não pulando-a. Após o merge, gera-se uma tag `PATCH`.

### 4.4 Mudanças no banco de dados
Alterações de esquema devem ser **aditivas** e entrar em `scripts/migrar.js` (idempotente) e em
`database/schema.sql` no mesmo PR. O PR deve indicar, no checklist, que há migração e que foi
testada em staging antes de produção.

---

## 5. Ambientes e liberação (release)

| Environment (GitHub) | Disparo | Proteção | Finalidade |
|---|---|---|---|
| `staging` | Automático a cada merge na `main` | Somente branch `main` | Homologação / teste com dados de teste |
| `production` | Após sucesso em staging | **Revisor obrigatório: `@CaioBorbaa`**; somente branch `main` | Ambiente usado pelos colaboradores |

- Cada environment tem os **próprios segredos** (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `SESSION_SECRET`, `HG_WEATHER_API_KEY`, `FACTORIAL_API_KEY` …), cadastrados em *Settings → Environments → Secrets*.
- O job de produção fica em estado **“Waiting”** até o revisor clicar em *Review deployments → Approve and deploy*.
- O histórico de implantações (quem aprovou, quando, qual commit) fica em *Actions* e na aba *Deployments* do repositório — isso compõe a trilha de auditoria.

### 5.1 Criação de baseline (release)
```bash
git switch main && git pull
git tag -a v1.1.0 -m "Release 1.1.0 - painel de RH e API Factorial"
git push origin v1.1.0
```
E registrar a versão no `CHANGELOG.md` (via PR).

---

## 6. Contabilização da situação da configuração (status accounting)

| Informação | Onde é obtida |
|---|---|
| O que mudou e por quê | Histórico de commits, PRs e Issues |
| Quem aprovou | Revisões do PR e aprovações de deployment |
| O que está em cada ambiente | Aba *Deployments* (staging / production) |
| Versões liberadas | Tags `vX.Y.Z` e `CHANGELOG.md` |
| Situação do build | Badges e execuções do GitHub Actions |

---

## 7. Auditoria de configuração

Realizada a cada release (e no mínimo uma vez por mês) pelo Gerente de Configuração:

- [ ] A proteção da `main` continua ativa e com `enforce_admins` ligado.
- [ ] Nenhum commit na `main` sem PR associado (`git log --first-parent main`).
- [ ] Todo PR mesclado tem ao menos 1 aprovação.
- [ ] Nenhum segredo versionado (busca por `.env`, senhas, chaves).
- [ ] Último deploy em produção tem aprovação registrada.
- [ ] `CHANGELOG.md` e tags correspondem ao que está em produção.
- [ ] O `CODEOWNERS` e a lista de colaboradores estão atualizados.

---

## 8. Ferramentas

| Ferramenta | Uso |
|---|---|
| Git | Controle de versão |
| GitHub | Hospedagem, PRs, Issues, proteção de branch, environments |
| GitHub Actions | CI e deploy |
| GitHub CLI (`gh`) | Automação da configuração do repositório |
| Node.js 20+/npm | Build do front-end e da API |

---

## 9. Backup e recuperação
- O próprio GitHub é a cópia remota do código; tags garantem a recuperação de qualquer baseline.
- O banco MySQL de produção tem backup antes de cada `npm run migrar` (ver README do `hub_react`).
- Rollback: re-executar o workflow de deploy a partir da tag anterior, ou reverter o PR (`git revert`) em novo PR.

---

## 10. Cronograma de GCS

| Atividade | Frequência |
|---|---|
| Revisão de PRs | Contínua |
| Release (tag + CHANGELOG) | A cada conjunto de funcionalidades entregue |
| Auditoria de configuração | A cada release / mensal |
| Revisão deste plano | Semestral, ou quando o processo mudar |
