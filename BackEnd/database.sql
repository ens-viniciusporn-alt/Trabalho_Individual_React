-- Execute este arquivo dentro do banco configurado em DB_NAME no .env.
CREATE TABLE IF NOT EXISTS cargos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS pessoas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cargo_id INTEGER REFERENCES cargos(id) ON DELETE SET NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Dados iniciais opcionais: só adiciona se ainda não existirem.
INSERT INTO cargos (nome)
VALUES ('Assistente'), ('Analista'), ('Coordenador')
ON CONFLICT (nome) DO NOTHING;
