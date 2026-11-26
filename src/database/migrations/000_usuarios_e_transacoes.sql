-- =====================================================
-- DINCONTROL - USUÁRIOS, TRANSAÇÕES E RECUPERAÇÃO DE SENHA
--
-- Cria as tabelas base usadas pelo servidor. Roda antes
-- de 001_listas_e_anotacoes.sql, que depende de Users.
-- O script é idempotente: pode ser executado mais de uma
-- vez sem quebrar um banco que já tenha as tabelas.
--
-- Execute com:  npm run migrate
-- =====================================================


-- =====================================================
-- USUÁRIOS
-- A senha guarda o hash do bcrypt (60 caracteres).
-- =====================================================

CREATE TABLE IF NOT EXISTS Users (
    id      SERIAL PRIMARY KEY,
    nome    VARCHAR(120) NOT NULL,
    email   VARCHAR(255) NOT NULL,
    senha   VARCHAR(255) NOT NULL
);


-- O servidor já impede e-mails repetidos (busca por LOWER(email)).
CREATE INDEX IF NOT EXISTS idx_users_email
    ON Users (LOWER(email));


-- =====================================================
-- TRANSAÇÕES
-- =====================================================

CREATE TABLE IF NOT EXISTS Transac (
    id          SERIAL PRIMARY KEY,

    user_id     INTEGER NOT NULL
                REFERENCES Users (id)
                ON DELETE CASCADE,

    tipo        VARCHAR(10) NOT NULL
                CHECK (tipo IN ('ENTRADA', 'SAIDA')),

    valor       NUMERIC(12, 2) NOT NULL,
    categoria   VARCHAR(60) NOT NULL,
    data        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_transac_user_id
    ON Transac (user_id);


-- =====================================================
-- CÓDIGOS DE RECUPERAÇÃO DE SENHA
-- =====================================================

CREATE TABLE IF NOT EXISTS password_reset_codes (
    id                  SERIAL PRIMARY KEY,

    user_id             INTEGER NOT NULL
                        REFERENCES Users (id)
                        ON DELETE CASCADE,

    codigo_hash         CHAR(64) NOT NULL,
    expires_at          TIMESTAMPTZ NOT NULL,
    verificado          BOOLEAN NOT NULL DEFAULT FALSE,
    reset_token_hash    CHAR(64),
    reset_expires_at    TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_password_reset_codes_user_id
    ON password_reset_codes (user_id);
