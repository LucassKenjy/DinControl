-- =====================================================
-- DINCONTROL - LISTAS E ANOTAÇÕES
--
-- Cria as tabelas usadas pela seção "Listas e Anotações".
-- O script é idempotente: pode ser executado mais de uma
-- vez sem quebrar um banco que já tenha as tabelas.
--
-- Execute com:  npm run migrate
-- (ou cole o conteúdo no psql / console do provedor)
-- =====================================================


-- =====================================================
-- LISTAS
-- Uma lista pertence a um usuário.
-- =====================================================

CREATE TABLE IF NOT EXISTS lists (
    id          SERIAL PRIMARY KEY,

    user_id     INTEGER NOT NULL
                REFERENCES Users (id)
                ON DELETE CASCADE,

    name        VARCHAR(120) NOT NULL,

    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_lists_user_id
    ON lists (user_id);


-- =====================================================
-- ITENS DE LISTA
-- Um item pertence a uma lista.
-- Ao excluir a lista, os itens são excluídos junto
-- (ON DELETE CASCADE).
-- =====================================================

CREATE TABLE IF NOT EXISTS list_items (
    id          SERIAL PRIMARY KEY,

    list_id     INTEGER NOT NULL
                REFERENCES lists (id)
                ON DELETE CASCADE,

    text        VARCHAR(255) NOT NULL,

    completed   BOOLEAN NOT NULL DEFAULT FALSE,

    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_list_items_list_id
    ON list_items (list_id);


-- =====================================================
-- ANOTAÇÕES
-- Uma anotação pertence a um usuário.
-- =====================================================

CREATE TABLE IF NOT EXISTS notes (
    id          SERIAL PRIMARY KEY,

    user_id     INTEGER NOT NULL
                REFERENCES Users (id)
                ON DELETE CASCADE,

    title       VARCHAR(120) NOT NULL,

    content     TEXT NOT NULL DEFAULT '',

    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_notes_user_id
    ON notes (user_id);
