# Hub Tintomax — versão React + Tailwind

Reescrita do Hub de Sistemas (antes em Flask + Jinja + Alpine.js), agora com **painel administrativo**.

```
hub_react/
├── frontend/   React 19 + Vite + Tailwind CSS v4 (hub público + painel /admin)
└── backend/    API Node.js (Express) usando o MESMO banco MySQL do sistema Flask
```

## O que tem

**Hub (colaboradores)** — mesmo comportamento do sistema atual:
- Login só com CPF (usuários ativos da tabela `usuarios`)
- Relógio, clima da cidade (HG Brasil, com cache de 30 min), carrossel de banners (10 s)
- Botões por categoria; a categoria **geral** aparece em todas as abas (recolhível)
- Pesquisa com `Ctrl+K` / `Esc`, menu do usuário flutuante com "Sair"
- Novo: popup de **aviso** e registro de **cliques** em cada sistema

**Painel administrativo (`/admin`)** — CPF **+ senha**, só para níveis de acesso administrativos:
| Tela | Funções |
|---|---|
| Visão geral | cliques (30 dias), acessos de hoje, colaboradores ativos, mais acessados, últimos logins |
| Sistemas | cadastrar/editar/excluir, ícone (upload), categorias, ativar/ocultar, ordenar arrastando |
| Categorias | criar/renomear/excluir, ordenar ("geral" é fixa) |
| Banners | upload, ativar/ocultar, ordenar; ao clicar: nada, abrir um link ou **mostrar uma imagem no centro da tela** |
| Avisos | popup exibido uma vez por sessão (o ativo mais recente) |
| Temas | Páscoa, Natal e Ano Novo: automático por data, fixo ou desligado; mensagem do rodapé, efeitos e prévia |
| Usuários | cadastro por CPF, nível de acesso, ativar/desativar, senha do painel |

## Instalação

Requisitos: **Node.js 20+** e acesso ao MySQL.

```bash
# 1) API
cd backend
npm install
cp .env.example .env        # (já existe um .env preenchido com os dados do sistema antigo)
npm run migrar              # prepara o banco existente — pode rodar mais de uma vez
npm run criar-admin         # define o primeiro administrador (CPF + senha)

# 2) Front-end
cd ../frontend
npm install
```

### O que `npm run migrar` muda no banco
Só **acrescenta**, não apaga nada:
- `usuarios.senha_hash` (senha do painel, com bcrypt)
- `links.imagem` passa de BLOB para MEDIUMBLOB (BLOB corta ícones acima de 64 KB)
- Tabelas novas: `link_cliques`, `login_log`, `avisos`, `configuracoes` (temas), `presentes` (saco de Natal)
- `banners.popup_nome` (imagem aberta ao clicar no banner)

Faça um backup antes de rodar em produção. Para instalar do zero, `database/schema.sql` tem o esquema completo.

## Desenvolvimento

Dois terminais:

```bash
cd backend  && npm run dev     # API em http://localhost:3001
cd frontend && npm run dev     # site em http://localhost:5173 (repassa /api e /uploads para a API)
```

## Produção

```bash
cd frontend && npm run build   # gera frontend/dist
cd ../backend && npm start     # a API também serve o site compilado
```

Um único processo atende tudo na porta `PORT`. Atrás de Nginx/Cloudflare, configure
`TRUST_PROXY=1` (para pegar o IP real) e `COOKIE_SECURE=true` se o site estiver em HTTPS.
Use um gerenciador de processos (PM2, serviço do Windows, systemd) para manter a API no ar.

## Configuração (`backend/.env`)

| Variável | Para quê |
|---|---|
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | banco MySQL |
| `SESSION_SECRET` | assina o cookie de sessão — valor aleatório longo |
| `SESSION_HOURS` | duração da sessão (padrão 12 h) |
| `ADMIN_LEVELS` | valores de `nivel_acesso` que entram no painel (padrão `admin`; ex.: `admin,ti`) |
| `RH_LEVELS` | valores de `nivel_acesso` que entram no painel do RH (padrão `rh`) |
| `HG_WEATHER_API_KEY` | chave da HG Brasil |
| `WEATHER_FALLBACK_IP` | IP público usado para o clima quando o acesso vem da rede interna |
| `TRUST_PROXY`, `COOKIE_SECURE`, `PORT` | servidor |
| `UPLOADS_DIR` | pasta dos arquivos enviados (padrão `uploads`) |

## Personalizando

- **Cores da marca**: `frontend/src/index.css`, bloco `@theme` (`--color-brand` etc.) — vira `bg-brand`, `text-brand-dark`...
- **Logos**: `frontend/public/images/`
- **Menu do painel**: array `MENU` em `frontend/src/admin/AdminLayout.jsx`
- **Nova tela no admin**: crie a rota em `backend/src/routes/admin/`, registre em `backend/src/server.js`,
  crie a página em `frontend/src/admin/pages/` e adicione em `App.jsx` + `MENU`.
  Os componentes prontos ficam em `frontend/src/admin/ui/` (Modal, Toggle, EntradaImagem, ListaOrdenavel, toasts/confirmação).

## Painel do RH (`/rh`)

Painel separado e mais limitado para o setor de RH, com login próprio (CPF + senha) em `/rh/login`.

| O RH pode | O RH não pode |
|---|---|
| Cadastrar, editar e liberar/bloquear CPFs de **colaboradores** | Ver ou alterar contas da T.I. ou do próprio RH |
| Cadastrar vários de uma vez (colando nome e CPF da planilha) | Dar nível de acesso ou senha a ninguém |
| Excluir só cadastro feito por engano (quem nunca entrou no hub) | Excluir quem já usou o hub (deve bloquear) |
| Publicar avisos (popup do hub) | Mexer em sistemas, banners, categorias, temas |
| Ver a visão geral (quem nunca entrou, sem acesso há 60+ dias) e baixar a lista em planilha | Entrar no painel da T.I. |

- **Criar a conta do RH**: em `/admin/usuarios`, cadastre a pessoa com nível `rh` e uma senha.
  Quais níveis entram no painel do RH é definido em `RH_LEVELS` no `.env` (padrão `rh`).
- **Histórico**: tudo o que o RH faz fica registrado (quem, o quê e quando) em `/rh/historico` (tabela `historico_rh`, criada pelo `npm run migrar`).
- A T.I. também entra em `/rh` com o login dela, para dar suporte.

### Integração com o Factorial

O Factorial é a fonte dos colaboradores: quem está **ativo** lá pode entrar no hub com o CPF e quem é **desligado** lá
é bloqueado aqui. O hub só **lê** o Factorial (`GET /api/<versão>/resources/employees/employees`), nunca altera nada lá.

1. No Factorial, um administrador cria a chave em **Configuração → API → Criar chave de API**.
2. No `backend/.env` do servidor: `FACTORIAL_API_KEY=<chave>` (veja as outras opções no `.env.example`) e reinicie.
3. Em **/rh → Factorial**, clique em **Verificar agora**: aparece o que mudaria (sem alterar nada). Confira e clique em **Aplicar sincronização**.
4. Depois disso roda sozinho a cada `FACTORIAL_SYNC_HORAS` horas (padrão 6; `0` = só pelo botão).

Regras: contas da T.I./RH nunca são alteradas; quem o RH bloqueou não é reativado sozinho; quem está no hub mas não
no Factorial (terceiros) continua com acesso; o nome no hub acompanha o do Factorial; a data de desligamento vale até
o fim do dia. A sincronização automática **pausa** se for bloquear mais que `FACTORIAL_MAX_BLOQUEIOS` pessoas de uma
vez (proteção contra erro na API) — o RH confere e aplica pelo botão. Tudo fica no histórico do RH.

O CPF é procurado nos campos `identifier`, `social_security_number` e `company_identifier` do funcionário (o primeiro
com CPF válido vence; a tela mostra qual foi usado). Para fixar um campo: `FACTORIAL_CAMPO_CPF`.
A API do Factorial lança versões trimestrais que valem 1 ano: atualize `FACTORIAL_API_VERSION` quando avisarem.
**A chave da API dá acesso a todos os dados do Factorial**: fica só no `.env` do servidor e nunca é enviada ao navegador.
- Desativar a conta do RH em `/admin/usuarios` corta o acesso na hora, mesmo com o painel aberto.

## Temas comemorativos

Configurados em **/admin/temas**. No modo automático:

| Tema | Período padrão |
|---|---|
| 🐰 Páscoa | 2 semanas antes do domingo de Páscoa até a segunda seguinte (calculado a cada ano) |
| 🌽 Festa Junina | 01/06 a 30/06 |
| 🎉 Festa Julina | 01/07 a 31/07 |
| 🎃 Halloween | 24/10 a 31/10 |
| 🎄 Natal | 01/12 a 26/12 |
| 🎆 Ano Novo | 27/12 a 06/01 |

Os temas mudam o fundo da página (degradê claro + estampa suave + enfeites caindo devagar atrás dos ícones),
a mensagem do rodapé e podem ter um personagem cruzando o topo e enfeites logo abaixo dele. **O cabeçalho e o rodapé ficam sempre na cor da marca.**
Cada tema pode ter período personalizado, mensagem própria e enfeites animados ligados/desligados.
O botão **Pré-visualizar** abre o hub com o tema (só para administradores, via `?previa=`).
As datas usam o fuso `America/Sao_Paulo` (variável `TIMEZONE` no `.env` para mudar).

| Tema | No cabeçalho | Na página |
|---|---|---|
| 🐰 Páscoa | coelho correndo | ovos pendurados (balançam ao passar o mouse) + fundo pastel |
| 🌽 Festa Junina | balões juninos | bandeirinhas, fogueira com fagulhas (telas largas) + confete de papel |
| 🎉 Festa Julina | balões coloridos | bandeirinhas triangulares, fogueira + pipocas caindo |
| 🎃 Halloween | abóbora de chapéu de bruxa correndo + morcego | aranhas penduradas (sobem ao passar o mouse), espantalho com corvo e fardos de feno (telas largas) + folhas de outono |
| 🎄 Natal | Papai Noel no trenó com renas | árvore com galões Lukscolor/Futura (telas largas) + neve |
| 🎆 Ano Novo | fogos de artifício | brilhos dourados no fundo |

**Galões da árvore** (Natal): são as fotos dos produtos, sem fundo, em `frontend/public/temas/natal/`
(`lukscolor.png` e `futura.png`). Para trocar o modelo, substitua o PNG (de preferência com fundo transparente)
e ajuste a `proporcao` em `frontend/src/temas/ArvoreNatal.jsx` (objeto `LATAS`).
A árvore fica no canto inferior esquerdo e só aparece quando sobra espaço ao lado dos ícones (telas largas).

**Saco de presentes** (Natal): fica no canto inferior direito (também só em telas largas e só para quem entrou).
Ao clicar, um produto é sorteado e pula para fora do saco. Regras: um presente por carregamento da página
(recarregar libera outro) e o sorteio evita repetir os 3 últimos que a pessoa já viu (guardado no navegador dela).
Os produtos são gerenciados em **/admin/temas → Saco de presentes** (tabela `presentes`). O `npm run migrar`
cadastra os produtos iniciais de `backend/database/presentes/` se a tabela estiver vazia.

**Criar um tema novo** (ex.: Festa Junina):
1. `backend/src/temas.js` → adicione em `TEMAS` com a mensagem e a regra de datas.
2. `frontend/src/temas/index.js` → adicione a aparência: degradê do fundo, estampa (crie em `estampas.js`)
   e, se quiser, um efeito em `Efeitos.jsx`. Mantenha as cores claras (tons 50–200) para não competir com os ícones.
3. `frontend/src/temas/pacotes/<id>.js` → exporte os componentes do tema (personagem, enfeites, cenários).
   Cada pacote é baixado só quando o tema está ativo.

## Desempenho (PCs modestos)

O hub foi ajustado para rodar leve em computadores fracos (medido com CPU 6× mais lenta e rede de 10 Mbit/s):
1ª visita de ~3,2 s / 2,3 MB para ~1,5 s / 260 KB e todos os temas a ~60 quadros por segundo.

- **Ícones**: o banco guarda a imagem original, mas a API entrega uma versão WebP reduzida (`sharp`), com
  cache de 1 ano no navegador. A URL leva a versão (`?v=...`), então trocar o ícone no painel aparece na hora.
- **Compressão gzip** nas respostas e cache longo dos arquivos de `/assets` (o `index.html` é sempre revalidado).
- **Código dividido**: o painel admin e cada tema são baixados só quando usados; banners carregam só o atual e o próximo.
- **Animações**: só `transform`/`opacity` (placa de vídeo). Personagens e cenários alternam "poses" prontas
  (componente `temas/Quadros.jsx`) em vez de animar partes do desenho. Enfeites fora da tela ficam pausados
  e PCs com até 4 núcleos/4 GB recebem metade das partículas (`src/lib/desempenho.js`).
- **Atenção ao criar animações**: keyframes usados direto em `style={{ animation: ... }}` devem ficar **fora** do
  bloco `@theme` do `index.css` — o Tailwind só publica os keyframes do `@theme` que tenham classe `animate-*` em uso.

## Diferenças em relação ao sistema Flask

- Corrigido: no `app.py` o `redirect` após login válido estava dentro do `except` (indentação), então o login bem-sucedido não redirecionava.
- O tipo da imagem dos ícones é detectado pelo conteúdo (antes era sempre `image/png`).
- Banners agora ficam em `backend/uploads/banners/` (os atuais `1.jpg`, `fin.jpg` e `ti.jpg` já foram copiados).
  Se houver outros banners cadastrados no banco, copie os arquivos de `sistema_hub/static/images/` para lá.
- Categorias sem nenhum sistema ativo não aparecem como botão na home.
- Rota `/debug` removida (expunha dados sem login).
