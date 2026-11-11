require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    res.status(503).json({ status: "error", message: "Não foi possível conectar ao banco de dados." });
  }
});

app.get("/api/pessoas", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.nome, p.cargo_id, c.nome AS cargo
       FROM pessoas p LEFT JOIN cargos c ON c.id = p.cargo_id
       ORDER BY p.id DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Não foi possível listar as pessoas." });
  }
});

app.post("/api/pessoas", async (req, res) => {
  const nome = String(req.body.nome || "").trim();
  const cargoId = req.body.cargo_id === "" || req.body.cargo_id == null ? null : Number(req.body.cargo_id);
  if (!nome) return res.status(400).json({ erro: "Informe o nome da pessoa." });
  if (cargoId !== null && !Number.isInteger(cargoId)) return res.status(400).json({ erro: "Cargo inválido." });

  try {
    const result = await pool.query(
      "INSERT INTO pessoas (nome, cargo_id) VALUES ($1, $2) RETURNING id, nome, cargo_id",
      [nome, cargoId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Não foi possível cadastrar a pessoa. Confira se o cargo existe." });
  }
});


app.put("/api/pessoas/:id", async (req, res) => {
  const id = Number(req.params.id);
  const nome = String(req.body.nome || "").trim();

  const cargoId =
    req.body.cargo_id === "" || req.body.cargo_id == null
      ? null
      : Number(req.body.cargo_id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ erro: "Identificador inválido." });
  }

  if (!nome) {
    return res.status(400).json({ erro: "Informe o nome da pessoa." });
  }

  if (cargoId !== null && !Number.isInteger(cargoId)) {
    return res.status(400).json({ erro: "Cargo inválido." });
  }

  try {
    const result = await pool.query(
      `UPDATE pessoas
       SET nome = $1, cargo_id = $2
       WHERE id = $3
       RETURNING id, nome, cargo_id`,
      [nome, cargoId, id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ erro: "Pessoa não encontrada." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      erro: "Não foi possível atualizar a pessoa. Confira se o cargo existe."
    });
  }
});


app.delete("/api/pessoas/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ erro: "Identificador inválido." });
  try {
    const result = await pool.query("DELETE FROM pessoas WHERE id = $1 RETURNING id", [id]);
    if (!result.rowCount) return res.status(404).json({ erro: "Pessoa não encontrada." });
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Não foi possível excluir a pessoa." });
  }
});

app.get("/api/cargos", async (_req, res) => {
  try {
    const result = await pool.query("SELECT id, nome FROM cargos ORDER BY nome");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Não foi possível listar os cargos." });
  }
});

app.post("/api/cargos", async (req, res) => {
  const nome = String(req.body.nome || "").trim();
  if (!nome) return res.status(400).json({ erro: "Informe o nome do cargo." });
  try {
    const result = await pool.query(
      "INSERT INTO cargos (nome) VALUES ($1) RETURNING id, nome",
      [nome]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") return res.status(409).json({ erro: "Esse cargo já existe." });
    console.error(error);
    res.status(500).json({ erro: "Não foi possível cadastrar o cargo." });
  }
});

app.delete("/api/cargos/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ erro: "Identificador inválido." });
  try {
    const result = await pool.query("DELETE FROM cargos WHERE id = $1 RETURNING id", [id]);
    if (!result.rowCount) return res.status(404).json({ erro: "Cargo não encontrado." });
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Não foi possível excluir o cargo." });
  }
});

app.listen(port, () => console.log(`API disponível em http://localhost:${port}`));
