
import { useEffect, useMemo, useState } from "react";

const API = "http://localhost:3000/api";

export default function App() {
  // Estados principais
  const [pagina, setPagina] = useState("visao");

  const [pessoas, setPessoas] = useState([]);
  const [cargos, setCargos] = useState([]);

  // Estados do formulário de pessoas
  const [nomePessoa, setNomePessoa] = useState("");
  const [cargoPessoa, setCargoPessoa] = useState("");
  const [pessoaEditando, setPessoaEditando] = useState(null);

  // Estado do formulário de cargos
  const [nomeCargo, setNomeCargo] = useState("");

  // Estados de mensagens e carregamento
  const [aviso, setAviso] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  // Função padrão para comunicação com a API
  async function requisicao(caminho, opcoes = {}) {
    const resposta = await fetch(`${API}${caminho}`, {
      ...opcoes,
      headers: {
        "Content-Type": "application/json",
        ...(opcoes.headers || {})
      }
    });

    if (!resposta.ok) {
      const corpo = await resposta.json().catch(() => ({}));

      throw new Error(
        corpo.erro || `Falha na requisição (${resposta.status}).`
      );
    }

    return resposta.status === 204 ? null : resposta.json();
  }

  // Carrega pessoas e cargos do banco de dados
  async function carregarDados() {
    setCarregando(true);
    setErro("");

    try {
      const [listaPessoas, listaCargos] = await Promise.all([
        requisicao("/pessoas"),
        requisicao("/cargos")
      ]);

      setPessoas(listaPessoas);
      setCargos(listaCargos);
    } catch (e) {
      setErro(
        `${e.message} Confirme se o Back-End e o PostgreSQL estão funcionando.`
      );
    } finally {
      setCarregando(false);
    }
  }

  // Carrega os dados ao abrir a aplicação
  useEffect(() => {
    carregarDados();
  }, []);

  // Seleciona as cinco pessoas mais recentes
  const recentes = useMemo(
    () => pessoas.slice(0, 5),
    [pessoas]
  );

  // Cadastra uma pessoa ou atualiza um cadastro existente
  async function cadastrarPessoa(e) {
    e.preventDefault();

    setAviso("");
    setErro("");

    try {
      const editando = pessoaEditando !== null;

      await requisicao(
        editando ? `/pessoas/${pessoaEditando}` : "/pessoas",
        {
          method: editando ? "PUT" : "POST",
          body: JSON.stringify({
            nome: nomePessoa,
            cargo_id: cargoPessoa || null
          })
        }
      );

      setNomePessoa("");
      setCargoPessoa("");
      setPessoaEditando(null);

      setAviso(
        editando
          ? "Pessoa atualizada com sucesso."
          : "Pessoa cadastrada com sucesso."
      );

      await carregarDados();
    } catch (e) {
      setErro(e.message);
    }
  }

  // Preenche o formulário com os dados da pessoa selecionada
  function editarPessoa(pessoa) {
    setPessoaEditando(pessoa.id);
    setNomePessoa(pessoa.nome);

    setCargoPessoa(
      pessoa.cargo_id == null ? "" : String(pessoa.cargo_id)
    );

    setAviso("");
    setErro("");
    setPagina("pessoas");
  }

  // Cancela a edição e limpa o formulário
  function cancelarEdicao() {
    setPessoaEditando(null);
    setNomePessoa("");
    setCargoPessoa("");
    setAviso("");
    setErro("");
  }

  // Cadastra um novo cargo
  async function cadastrarCargo(e) {
    e.preventDefault();

    setAviso("");
    setErro("");

    try {
      await requisicao("/cargos", {
        method: "POST",
        body: JSON.stringify({
          nome: nomeCargo
        })
      });

      setNomeCargo("");
      setAviso("Cargo cadastrado com sucesso.");

      await carregarDados();
    } catch (e) {
      setErro(e.message);
    }
  }

  // Exclui uma pessoa ou um cargo
  async function excluir(tipo, id) {
    if (!window.confirm("Deseja realmente excluir este registro?")) {
      return;
    }

    setAviso("");
    setErro("");

    try {
      await requisicao(`/${tipo}/${id}`, {
        method: "DELETE"
      });

      setAviso("Registro excluído com sucesso.");

      await carregarDados();
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <div className="layout">

      {/* Menu lateral */}
      <aside className="sidebar">

        <div className="brand">
          <span className="brand-icon">PC</span>

          <div>
            <b>PeopleCore</b>
            <small>PAINEL ADMINISTRATIVO</small>
          </div>
        </div>

        <p className="nav-label">MENU PRINCIPAL</p>

        <button
          className={
            pagina === "visao" ? "nav-item active" : "nav-item"
          }
          onClick={() => setPagina("visao")}
        >
          ▦ <span>Visão geral</span>
        </button>

        <button
          className={
            pagina === "pessoas" ? "nav-item active" : "nav-item"
          }
          onClick={() => setPagina("pessoas")}
        >
          ♙ <span>Pessoas</span>
        </button>

        <button
          className={
            pagina === "cargos" ? "nav-item active" : "nav-item"
          }
          onClick={() => setPagina("cargos")}
        >
          ▤ <span>Cargos</span>
        </button>

        <div className="sidebar-bottom">
          <span className="status-dot"></span>
          Sistema de cadastro
          <small>Versão acadêmica 1.0</small>
        </div>

      </aside>

      {/* Conteúdo principal */}
      <main className="main">

        {/* Cabeçalho */}
        <header className="topbar">

          <div>
            <span className="eyebrow">GESTÃO DE EQUIPE</span>

            <h1>
              {pagina === "visao"
                ? "Visão geral"
                : pagina === "pessoas"
                  ? "Pessoas"
                  : "Cargos"}
            </h1>
          </div>

          <button
            className="refresh"
            onClick={carregarDados}
          >
            ↻ Atualizar
          </button>

        </header>

        <section className="content">

          {/* Mensagens */}
          {aviso && (
            <div className="notice success">
              {aviso}
            </div>
          )}

          {erro && (
            <div className="notice error">
              {erro}
            </div>
          )}

          {/* Página inicial */}
          {pagina === "visao" && (
            <>

              <div className="welcome">

                <div>
                  <span className="welcome-tag">
                    SEU ESPAÇO DE TRABALHO
                  </span>

                  <h2>
                    Organize sua equipe
                    <br />
                    com simplicidade.
                  </h2>

                  <p>
                    Consulte pessoas cadastradas e mantenha
                    os cargos em ordem em um só lugar.
                  </p>

                  <button
                    className="light-button"
                    onClick={() => setPagina("pessoas")}
                  >
                    Ver pessoas <span>→</span>
                  </button>
                </div>

                <div className="welcome-art">

                  <div className="orb orb-one"></div>
                  <div className="orb orb-two"></div>

                  <div className="art-card">
                    <span>PEOPLE</span>

                    <strong>
                      {String(pessoas.length).padStart(2, "0")}
                    </strong>

                    <small>pessoas registradas</small>

                    <div className="mini-bars">
                      <i></i>
                      <i></i>
                      <i></i>
                      <i></i>
                      <i></i>
                      <i></i>
                      <i></i>
                    </div>
                  </div>

                </div>

              </div>

              {/* Indicadores */}
              <div className="stats">

                <article className="stat-card">
                  <div className="stat-icon purple">♙</div>
                  <span>Total de pessoas</span>
                  <strong>{pessoas.length}</strong>
                  <small>Registros cadastrados</small>
                </article>

                <article className="stat-card">
                  <div className="stat-icon blue">▤</div>
                  <span>Cargos disponíveis</span>
                  <strong>{cargos.length}</strong>
                  <small>Funções na organização</small>
                </article>

                <article className="stat-card">
                  <div className="stat-icon green">✓</div>
                  <span>Status da aplicação</span>

                  <strong className="status-text">
                    {erro
                      ? "Atenção"
                      : carregando
                        ? "Carregando"
                        : "Operacional"}
                  </strong>

                  <small>Conexão com a API</small>
                </article>

              </div>

              {/* Cadastros recentes */}
              <section className="panel">

                <div className="panel-heading">

                  <div>
                    <h3>Cadastros recentes</h3>
                    <p>Últimas pessoas adicionadas ao sistema</p>
                  </div>

                  <button
                    className="text-button"
                    onClick={() => setPagina("pessoas")}
                  >
                    Ver todas →
                  </button>

                </div>

                <PeopleTable
                  rows={recentes}
                  onDelete={(id) => excluir("pessoas", id)}
                  onEdit={editarPessoa}
                />

              </section>

            </>
          )}

          {/* Página de pessoas */}
          {pagina === "pessoas" && (
            <div className="columns">

              {/* Formulário de cadastro e edição */}
              <section className="panel form-panel">

                <div className="panel-heading">

                  <div>
                    <h3>
                      {pessoaEditando
                        ? "Editar pessoa"
                        : "Adicionar pessoa"}
                    </h3>

                    <p>
                      {pessoaEditando
                        ? "Altere os dados da pessoa selecionada."
                        : "Preencha os dados para registrar alguém."}
                    </p>
                  </div>

                </div>

                <form onSubmit={cadastrarPessoa}>

                  <label>
                    Nome completo

                    <input
                      value={nomePessoa}
                      onChange={(e) => setNomePessoa(e.target.value)}
                      placeholder="Ex.: Ana Martins"
                      required
                      maxLength="100"
                    />
                  </label>

                  <label>
                    Cargo

                    <select
                      value={cargoPessoa}
                      onChange={(e) => setCargoPessoa(e.target.value)}
                    >
                      <option value="">
                        Sem cargo definido
                      </option>

                      {cargos.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nome}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button className="primary-button">
                    {pessoaEditando
                      ? "Salvar alterações"
                      : "Cadastrar pessoa"}
                  </button>

                  {pessoaEditando && (
                    <button
                      type="button"
                      className="delete-button"
                      onClick={cancelarEdicao}
                    >
                      Cancelar edição
                    </button>
                  )}

                </form>

              </section>

              {/* Tabela de pessoas */}
              <section className="panel">

                <div className="panel-heading">

                  <div>
                    <h3>Pessoas cadastradas</h3>
                    <p>{pessoas.length} registro(s)</p>
                  </div>

                </div>

                <PeopleTable
                  rows={pessoas}
                  onDelete={(id) => excluir("pessoas", id)}
                  onEdit={editarPessoa}
                />

              </section>

            </div>
          )}

          {/* Página de cargos */}
          {pagina === "cargos" && (
            <div className="columns">

              {/* Formulário de cargos */}
              <section className="panel form-panel">

                <div className="panel-heading">

                  <div>
                    <h3>Novo cargo</h3>
                    <p>Cadastre uma função para a equipe.</p>
                  </div>

                </div>

                <form onSubmit={cadastrarCargo}>

                  <label>
                    Nome do cargo

                    <input
                      value={nomeCargo}
                      onChange={(e) => setNomeCargo(e.target.value)}
                      placeholder="Ex.: Analista"
                      required
                      maxLength="80"
                    />
                  </label>

                  <button className="primary-button">
                    Adicionar cargo
                  </button>

                </form>

              </section>

              {/* Lista de cargos */}
              <section className="panel">

                <div className="panel-heading">

                  <div>
                    <h3>Lista de cargos</h3>
                    <p>
                      {cargos.length} função(ões) cadastrada(s)
                    </p>
                  </div>

                </div>

                {cargos.length ? (
                  <div className="cargo-list">

                    {cargos.map((c) => (
                      <div className="cargo-row" key={c.id}>

                        <span className="cargo-symbol">▤</span>

                        <div>
                          <b>{c.nome}</b>
                          <small>Identificador #{c.id}</small>
                        </div>

                        <button
                          className="delete-button"
                          onClick={() => excluir("cargos", c.id)}
                          aria-label={`Excluir ${c.nome}`}
                        >
                          Excluir
                        </button>

                      </div>
                    ))}

                  </div>
                ) : (
                  <p className="empty">
                    Nenhum cargo cadastrado ainda.
                  </p>
                )}

              </section>

            </div>
          )}

          {carregando && (
            <p className="loading">
              Atualizando dados…
            </p>
          )}

        </section>

        <footer className="footer">
          PeopleCore <span>•</span> Projeto de estudo de desenvolvimento web
        </footer>

      </main>

    </div>
  );
}

// Componente responsável por exibir a tabela de pessoas
function PeopleTable({ rows, onDelete, onEdit }) {

  if (!rows.length) {
    return (
      <p className="empty">
        Nenhuma pessoa para exibir. Cadastre a primeira pessoa para começar.
      </p>
    );
  }

  return (
    <div className="table-wrap">

      <table>

        <thead>
          <tr>
            <th>PESSOA</th>
            <th>CARGO</th>
            <th>ID</th>
            <th></th>
          </tr>
        </thead>

        <tbody>

          {rows.map((p) => (
            <tr key={p.id}>

              <td>
                <span className="avatar">
                  {p.nome.trim().charAt(0).toUpperCase()}
                </span>

                <b>{p.nome}</b>
              </td>

              <td>{p.cargo || "—"}</td>

              <td>#{p.id}</td>

              <td>
                <button
                  className="text-button"
                  onClick={() => onEdit(p)}
                >
                  Editar
                </button>

                <button
                  className="delete-button"
                  onClick={() => onDelete(p.id)}
                >
                  Excluir
                </button>
              </td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}
