// =====================================================
// ELEMENTOS
// =====================================================

const listaTransacoes = document.getElementById("listaTransacoes");
const semTransacoes = document.getElementById("semTransacoes");
const semTransacoesTitulo = document.getElementById("semTransacoesTitulo");
const semTransacoesTexto = document.getElementById("semTransacoesTexto");

const resumoEntrada = document.getElementById("resumoEntrada");
const resumoSaida = document.getElementById("resumoSaida");
const resumoSaldo = document.getElementById("resumoSaldo");

const filtroTipo = document.getElementById("filtroTipo");
const filtroMes = document.getElementById("filtroMes");
const filtroCategoria = document.getElementById("filtroCategoria");


// =====================================================
// ESTADO
// =====================================================

let transacoes = [];


// =====================================================
// FORMATAÇÃO
// =====================================================

function normalizarTipo(tipo) {
    return String(tipo || "")
        .trim()
        .toLowerCase();
}

function nomeTipo(tipo) {
    const tipoNormalizado = normalizarTipo(tipo);

    if (tipoNormalizado === "entrada") {
        return "Entrada";
    }

    if (
        tipoNormalizado === "saida" ||
        tipoNormalizado === "saída"
    ) {
        return "Saída";
    }

    return tipo;
}

// =====================================================
// DATA E HORÁRIO
// =====================================================

function converterData(data) {
    return new Date(data);
}

function inicioDoDia(data) {
    const novaData = new Date(data);

    novaData.setHours(
        0,
        0,
        0,
        0
    );

    return novaData;
}

function tituloDaData(data) {
    const dataTransacao = inicioDoDia(data);
    const hoje = inicioDoDia(new Date());

    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);

    if (
        dataTransacao.getTime() ===
        hoje.getTime()
    ) {
        return "Hoje";
    }

    if (
        dataTransacao.getTime() ===
        ontem.getTime()
    ) {
        return "Ontem";
    }

    const texto = dataTransacao.toLocaleDateString(
        "pt-BR",
        {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );

    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function chaveData(data) {
    const d = new Date(data);

    return [
        d.getFullYear(),

        String(
            d.getMonth() + 1
        ).padStart(
            2,
            "0"
        ),

        String(
            d.getDate()
        ).padStart(
            2,
            "0"
        )

    ].join("-");
}

function formatarHorario(data) {
    return new Date(data).toLocaleTimeString(
        "pt-BR",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


// =====================================================
// BUSCAR TRANSAÇÕES
// =====================================================

async function carregarTransacoes() {
    try {
        const resposta = await fetch(
            "/transactions",
            {
                credentials: "same-origin"
            }
        );

        if (resposta.status === 401) {
            irParaLogin();
            return;
        }

        if (!resposta.ok) {
            throw new Error(
                "Erro ao buscar transações"
            );
        }

        transacoes = await resposta.json();

        transacoes.sort(
            (a, b) =>
                new Date(b.data) -
                new Date(a.data)
        );

        montarCategorias();
        selecionarMesAtual();
        aplicarFiltros();

    } catch (erro) {
        console.error(
            "Erro ao carregar histórico:",
            erro
        );

        listaTransacoes.innerHTML = "";

        semTransacoes.hidden = false;
        semTransacoesTitulo.textContent = "Erro ao carregar o histórico.";
        semTransacoesTexto.textContent = "Verifique sua conexão e recarregue a página.";
    }
}


// =====================================================
// FILTROS
// =====================================================

function selecionarMesAtual() {
    const mesAtual = new Date().getMonth();

    filtroMes.value = String(mesAtual);
}

function montarCategorias() {
    const categorias = [
        ...new Set(
            transacoes
                .map(
                    transacao =>
                        transacao.categoria
                )
                .filter(Boolean)
        )
    ];

    categorias.sort();

    filtroCategoria.innerHTML =
        `<option value="todos">Todas as categorias</option>`;

    categorias.forEach(categoria => {
        const option =
            document.createElement("option");

        option.value = categoria;

        option.textContent =
            formatarCategoria(categoria);

        filtroCategoria.appendChild(option);
    });
}

function aplicarFiltros() {
    const tipo = filtroTipo.value;
    const mes = filtroMes.value;
    const categoria = filtroCategoria.value;

    const filtradas = transacoes.filter(
        transacao => {
            const data = converterData(
                transacao.data
            );

            const tipoTransacao =
                normalizarTipo(
                    transacao.tipo
                );

            if (
                tipo !== "todos" &&
                tipoTransacao !== tipo
            ) {
                return false;
            }

            if (
                mes !== "todos" &&
                data.getMonth() !== Number(mes)
            ) {
                return false;
            }

            if (
                categoria !== "todos" &&
                transacao.categoria !== categoria
            ) {
                return false;
            }

            return true;
        }
    );

    atualizarResumo(filtradas);
    renderizarHistorico(filtradas);
}


// =====================================================
// RESUMO
// =====================================================

function atualizarResumo(transacoesFiltradas) {
    let entrada = 0;
    let saida = 0;

    transacoesFiltradas.forEach(transacao => {
        const valor = Number(transacao.valor);
        const tipo = normalizarTipo(
            transacao.tipo
        );

        if (tipo === "entrada") {
            entrada += valor;
        }

        if (
            tipo === "saida" ||
            tipo === "saída"
        ) {
            saida += valor;
        }
    });

    const saldo = entrada - saida;

    resumoEntrada.textContent =
        formatarMoeda(entrada);

    resumoSaida.textContent =
        formatarMoeda(saida);

    resumoSaldo.textContent =
        formatarMoeda(saldo);

    resumoSaldo.classList.toggle("texto-entrada", saldo >= 0);
    resumoSaldo.classList.toggle("texto-saida", saldo < 0);
}


// =====================================================
// RENDERIZAR HISTÓRICO
// =====================================================

function renderizarHistorico(transacoesFiltradas) {
    listaTransacoes.innerHTML = "";

    if (transacoesFiltradas.length === 0) {
        semTransacoes.hidden = false;
        return;
    }

    semTransacoes.hidden = true;

    const grupos = {};

    transacoesFiltradas.forEach(transacao => {
        const chave = chaveData(
            transacao.data
        );

        if (!grupos[chave]) {
            grupos[chave] = [];
        }

        grupos[chave].push(transacao);
    });

    Object.keys(grupos)
        .sort()
        .reverse()
        .forEach(chave => {
            const grupo =
                document.createElement("div");

            grupo.className = "grupo-data";

            const primeira = grupos[chave][0];

            const titulo =
                document.createElement("div");

            titulo.className = "titulo-data";

            titulo.textContent =
                tituloDaData(
                    primeira.data
                );

            grupo.appendChild(titulo);

            grupos[chave]
                .sort(
                    (a, b) =>
                        new Date(b.data) -
                        new Date(a.data)
                )
                .forEach(transacao => {
                    grupo.appendChild(
                        criarLinha(transacao)
                    );
                });

            listaTransacoes.appendChild(grupo);
        });
}


// =====================================================
// CRIAR LINHA
// =====================================================

function criarLinha(transacao) {
    const linha =
        document.createElement("div");

    linha.className = "linha-historico";

    const tipo = normalizarTipo(
        transacao.tipo
    );

    const entrada = tipo === "entrada";

    const sinal = entrada
        ? "+"
        : "-";

    const classe = entrada
        ? "entrada"
        : "saida";

    linha.innerHTML = `
        <span class="linha-historico__categoria">
            <span class="linha-historico__icone linha-historico__icone--${classe}">
                ${icone(entrada ? "seta-entrada" : "seta-saida")}
            </span>
            <span></span>
        </span>

        <span class="linha-historico__tipo">
            <span class="selo selo--${classe}"></span>
        </span>

        <span class="linha-historico__horario numero"></span>

        <span class="valor-transacao valor-transacao--${classe} numero"></span>
    `;

    linha.querySelector(".linha-historico__categoria span:last-child").textContent =
        formatarCategoria(transacao.categoria);

    linha.querySelector(".selo").textContent =
        nomeTipo(transacao.tipo);

    linha.querySelector(".linha-historico__horario").textContent =
        formatarHorario(transacao.data);

    linha.querySelector(".valor-transacao").textContent =
        `${sinal} ${formatarMoeda(transacao.valor)}`;

    return linha;
}


// =====================================================
// EVENTOS DOS FILTROS
// =====================================================

filtroTipo.addEventListener(
    "change",
    aplicarFiltros
);

filtroMes.addEventListener(
    "change",
    aplicarFiltros
);

filtroCategoria.addEventListener(
    "change",
    aplicarFiltros
);


// =====================================================
// INICIALIZAÇÃO
// =====================================================

async function inicializarHistorico() {
    const usuario =
        await carregarUsuarioLogado();

    if (!usuario) {
        return;
    }

    configurarMenu();

    await carregarTransacoes();

    esconderLoading();
}

inicializarHistorico();
