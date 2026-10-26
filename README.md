# Gestão de Pessoas e Cargos

Projeto didático com React + Vite no Front-End, Node.js/Express no Back-End e PostgreSQL.

## Requisitos
- Node.js instalado
- PostgreSQL instalado e em execução

## 1. Preparar o banco
No PostgreSQL, crie um banco chamado `gestao_pessoas` (ou use outro nome e atualize `BackEnd/.env`).
Execute o script `BackEnd/database.sql` nesse banco. O script cria as tabelas `cargos` e `pessoas`.

Exemplo com psql:
```bash
psql -U postgres -d gestao_pessoas -f database.sql
```
Também é possível abrir `database.sql` no pgAdmin e executar o conteúdo depois de selecionar o banco.

## 2. Configurar o Back-End
Entre em `BackEnd`, copie `.env.example` para `.env` e preencha os dados do seu PostgreSQL:
```bash
cd BackEnd
npm install
npm run dev
```
API padrão: http://localhost:3000
Verificação: http://localhost:3000/api/health

## 3. Iniciar o Front-End
Em outro terminal:
```bash
cd FrontEnd
npm install
npm run dev
```
Abra o endereço informado pelo Vite (normalmente http://localhost:5173).

## Rotas
- `GET /api/pessoas` — listar pessoas
- `POST /api/pessoas` — cadastrar pessoa
- `DELETE /api/pessoas/:id` — excluir pessoa
- `GET /api/cargos` — listar cargos
- `POST /api/cargos` — cadastrar cargo
- `DELETE /api/cargos/:id` — excluir cargo

O arquivo `.env` não deve ser enviado para repositórios públicos. O `.env.example` contém apenas valores de exemplo.
