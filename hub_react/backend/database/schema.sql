-- =====================================================================
-- Hub Tintomax — esquema completo (para instalação NOVA do zero).
--
-- Se você já tem o banco do sistema Flask em produção, NÃO rode este
-- arquivo: use `npm run migrar`, que só adiciona o que falta.
-- =====================================================================

CREATE TABLE IF NOT EXISTS categorias (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  nome    VARCHAR(60) NOT NULL,
  ordem   INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS links (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  nome    VARCHAR(100) NOT NULL,
  url     VARCHAR(500) NOT NULL,
  imagem  MEDIUMBLOB NULL,
  ativo   TINYINT(1) NOT NULL DEFAULT 1,
  ordem   INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS link_categorias (
  link_id       INT NOT NULL,
  categoria_id  INT NOT NULL,
  PRIMARY KEY (link_id, categoria_id),
  INDEX idx_categoria (categoria_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS banners (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  imagem_nome  VARCHAR(255) NOT NULL,
  link_url     VARCHAR(500) NULL,
  popup_nome   VARCHAR(255) NULL,
  ativo        TINYINT(1) NOT NULL DEFAULT 1,
  ordem        INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS usuarios (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  nome_completo  VARCHAR(150) NOT NULL,
  cpf            CHAR(11) NOT NULL UNIQUE,
  nivel_acesso   VARCHAR(50) NOT NULL DEFAULT 'colaborador',
  ativo          TINYINT(1) NOT NULL DEFAULT 1,
  senha_hash     VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --- Tabelas novas (painel administrativo) ---------------------------

CREATE TABLE IF NOT EXISTS link_cliques (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  link_id     INT NOT NULL,
  usuario_id  INT NULL,
  ip          VARCHAR(45) NULL,
  data_hora   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_link (link_id),
  INDEX idx_data (data_hora)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS login_log (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT NOT NULL,
  ip          VARCHAR(45) NULL,
  data_hora   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_usuario (usuario_id),
  INDEX idx_data (data_hora)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS avisos (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  titulo       VARCHAR(150) NOT NULL,
  link_url     VARCHAR(500) NULL,
  imagem       MEDIUMBLOB NOT NULL,
  imagem_tipo  VARCHAR(50) NOT NULL,
  ativo        TINYINT(1) NOT NULL DEFAULT 1,
  criado_em    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Categoria especial: sistemas em "geral" aparecem em todas as abas.
INSERT INTO categorias (nome, ordem)
SELECT 'geral', 0 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nome = 'geral');

-- Configurações gerais do hub (ex.: temas comemorativos), em JSON
CREATE TABLE IF NOT EXISTS configuracoes (
  chave          VARCHAR(50) PRIMARY KEY,
  valor          TEXT NOT NULL,
  atualizado_em  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Produtos do saco de presentes do tema de Natal (um é sorteado por clique)
CREATE TABLE IF NOT EXISTS presentes (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  nome         VARCHAR(100) NOT NULL,
  imagem       MEDIUMBLOB NOT NULL,
  imagem_tipo  VARCHAR(50) NOT NULL,
  ativo        TINYINT(1) NOT NULL DEFAULT 1,
  criado_em    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- O que o RH fez no painel dele (cadastros, edições, ativações, exclusões, avisos)
CREATE TABLE IF NOT EXISTS historico_rh (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT NULL,
  autor       VARCHAR(150) NOT NULL,
  acao        VARCHAR(30) NOT NULL,
  descricao   VARCHAR(500) NOT NULL,
  data_hora   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_data (data_hora)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
