let graficoMensal = null;
let graficoSaida = null;
let graficoInvestimento = null;

const MESES = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

const CATEGORIAS_TRANSACAO = {
    ENTRADA: ["Salario", "Outros"],
    SAIDA: ["Alimentacao", "Locomocao", "Lazer", "Educacao", "Investimento", "Outros"]
};

const CATEGORIAS_SAIDA = [
    { chave: "Alimentacao", cor: "#ff6b6b" },
    { chave: "Locomocao", cor: "#fbbf24" },
    { chave: "Investimento", cor: "#8b9bff" },
    { chave: "Lazer", cor: "#34d399" },
    { chave: "Educacao", cor: "#f472b6" },
    { chave: "Outros", cor: "#60a5fa" }
];

const CORES = {
    entrada: "#22c55e",
    saida: "#f5475a",
    investimento: "#8b9bff",
    texto: "#9fb0d6",
    grade: "rgba(148, 177, 255, 0.08)"
};

let usuarioAtual = null;


// =====================================================
// UTILITÁRIOS
// =====================================================

function calcularLimiteMaximo(valores) {
    const maiorValor = Math.max(...valores);

    if (maiorValor === 0) {
        return 5000;
    }

    const limite = Math.ceil(maiorValor / 1000) * 1000;

    return Math.max(limite, 1000);
}

function formatarEixoMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        notation: Math.abs(valor) >= 10000 ? "compact" : "standard",
        maximumFractionDigits: 0
    });
}

function anoAtual() {
    return new Date().getFullYear();
}


// =====================================================
// API
// =====================================================

async function buscarTransacoes() {
    const resposta = await fetch("/transactions", {
        credentials: "same-origin"
    });

    if (resposta.status === 401) {
        irParaLogin();
        throw new Error("Sessão expirada");
    }

    if (!resposta.ok) {
        throw new Error("Erro ao buscar transações");
    }

    return resposta.json();
}

async function cadastrarTransacao(tipo, valor, categoria) {
    const resposta = await fetch("/transactions", {
        method: "POST",
        credentials: "same-origin",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            tipo,
            valor: Number(valor),
            categoria
        })
    });

    const resultado = await resposta.json();

    if (!resposta.ok) {
        throw new Error(
            resultado.erro || "Erro ao cadastrar transação"
        );
    }

    return resultado;
}


// =====================================================
// DOM
// =====================================================

const elementos = {
    saudacao: document.querySelector("#saudacao"),
    dataHoje: document.querySelector("#dataHoje"),

    botaoAdicionar: document.querySelector("#abrirTransacao"),
    painelTransacao: document.querySelector("#painelTransacao"),
    formTransacao: document.querySelector("#formTransacao"),
    valorTransacao: document.querySelector("#valorTransacao"),
    categoriaTransacao: document.querySelector("#categoriaTransacao"),
    confirmarTransacao: document.querySelector("#confirmarTransacao"),
    mensagemTransacao: document.querySelector("#mensagemTransacao"),

    valorSaldo: document.querySelector("#valorSaldo"),
    totalEntrada: document.querySelector("#totalEntrada"),
    totalSaida: document.querySelector("#totalSaida"),
    totalInvestimento: document.querySelector("#totalInvestimento"),
    indicadorSaldo: document.querySelector("#indicadorSaldo"),
    indicadorSaldoTexto: document.querySelector("#indicadorSaldoTexto"),

    totalSaidaGrafico: document.querySelector("#totalSaidaGrafico"),
    legendaSaida: document.querySelector("#legendaSaida"),

    ultimasTransacoes: document.querySelector("#ultimasTransacoes"),
    ultimasVazio: document.querySelector("#ultimasVazio")
};


// =====================================================
// INICIALIZAÇÃO
// =====================================================

document.addEventListener("DOMContentLoaded", async () => {
    usuarioAtual = await carregarUsuarioLogado();

    if (!usuarioAtual) {
        return;
    }

    configurarGraficos();
    configurarMenu();
    configurarEventos();
    preencherSaudacao();

    await carregarDashboard();

    esconderLoading();
});

function preencherSaudacao() {
    const nome = primeiroNome(usuarioAtual.nome);

    elementos.saudacao.textContent =
        nome ? `Olá, ${nome}` : "Olá!";

    const hoje = new Date().toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long"
    });

    elementos.dataHoje.textContent =
        `${hoje.charAt(0).toUpperCase()}${hoje.slice(1)} · Resumo das suas finanças`;
}

function configurarEventos() {
    elementos.botaoAdicionar.addEventListener("click", abrirPainelTransacao);

    elementos.formTransacao.addEventListener("submit", (event) => {
        event.preventDefault();
        confirmarCadastroTransacao();
    });

    elementos.formTransacao
        .querySelectorAll("input[name='tipo']")
        .forEach((opcao) => {
            opcao.addEventListener("change", preencherCategorias);
        });

    elementos.painelTransacao
        .querySelectorAll("[data-fechar-modal]")
        .forEach((botao) => {
            botao.addEventListener("click", () => elementos.painelTransacao.close());
        });

    fecharModalAoClicarFora(elementos.painelTransacao);
}


// =====================================================
// TRANSAÇÕES
// =====================================================

function tipoSelecionado() {
    return elementos.formTransacao
        .querySelector("input[name='tipo']:checked")
        .value;
}

function preencherCategorias() {
    const categorias = CATEGORIAS_TRANSACAO[tipoSelecionado()];

    elementos.categoriaTransacao.innerHTML =
        `<option value="">Selecione uma categoria</option>`;

    categorias.forEach((categoria) => {
        const opcao = document.createElement("option");

        opcao.value = categoria;
        opcao.textContent = formatarCategoria(categoria);

        elementos.categoriaTransacao.appendChild(opcao);
    });
}

function abrirPainelTransacao() {
    elementos.formTransacao.reset();
    preencherCategorias();
    limparMensagem(elementos.mensagemTransacao);
    definirCarregando(elementos.confirmarTransacao, false);

    elementos.painelTransacao.showModal();
    elementos.valorTransacao.focus();
}

function validarTransacao(valor, categoria) {
    if (!valor) {
        return "Digite um valor.";
    }

    if (Number(valor) <= 0) {
        return "Digite um valor válido.";
    }

    if (!categoria) {
        return "Selecione uma categoria.";
    }

    return null;
}

async function confirmarCadastroTransacao() {
    limparMensagem(elementos.mensagemTransacao);

    const tipo = tipoSelecionado();
    const valor = elementos.valorTransacao.value.trim();
    const categoria = elementos.categoriaTransacao.value;

    const erroValidacao = validarTransacao(valor, categoria);

    if (erroValidacao) {
        mostrarMensagem(elementos.mensagemTransacao, erroValidacao, "erro");
        return;
    }

    definirCarregando(elementos.confirmarTransacao, true, "Salvando...");

    try {
        await cadastrarTransacao(tipo, valor, categoria);

        mostrarMensagem(
            elementos.mensagemTransacao,
            "Transação cadastrada com sucesso!",
            "sucesso"
        );

        await carregarDashboard();

        setTimeout(() => {
            elementos.painelTransacao.close();
        }, 700);

    } catch (erro) {
        console.error("Erro ao cadastrar:", erro);

        mostrarMensagem(
            elementos.mensagemTransacao,
            "Erro ao cadastrar transação.",
            "erro"
        );

        definirCarregando(elementos.confirmarTransacao, false);
    }
}


// =====================================================
// DASHBOARD
// =====================================================

async function carregarDashboard() {
    try {
        const transacoes = await buscarTransacoes();

        atualizarResumo(transacoes);
        atualizarUltimasTransacoes(transacoes);
        carregarGraficoMensal(transacoes);
        carregarGraficoSaida(transacoes);
        carregarGraficoInvestimento(transacoes);

    } catch (erro) {
        console.error("Erro ao carregar dashboard:", erro);
    }
}

function calcularTotais(transacoes) {
    let entradas = 0;
    let saidas = 0;
    let investimentos = 0;

    transacoes.forEach((transacao) => {
        const valor = Number(transacao.valor) || 0;

        if (transacao.tipo === "ENTRADA") {
            entradas += valor;
        }

        if (transacao.tipo === "SAIDA") {
            saidas += valor;
        }

        if (normalizarTexto(transacao.categoria) === "investimento") {
            investimentos += valor;
        }
    });

    return {
        entradas,
        saidas,
        investimentos
    };
}

function atualizarResumo(transacoes) {
    const {
        entradas,
        saidas,
        investimentos
    } = calcularTotais(transacoes);

    const saldo = entradas - saidas;
    const negativo = saidas > entradas;

    elementos.valorSaldo.textContent = formatarMoeda(saldo);
    elementos.valorSaldo.classList.toggle("negativo", saldo < 0);

    elementos.indicadorSaldo.classList.toggle("selo--entrada", !negativo);
    elementos.indicadorSaldo.classList.toggle("selo--saida", negativo);

    elementos.indicadorSaldoTexto.textContent = negativo
        ? "Saídas acima das entradas"
        : "Entradas acima das saídas";

    elementos.totalEntrada.textContent = formatarMoeda(entradas);
    elementos.totalSaida.textContent = formatarMoeda(saidas);
    elementos.totalInvestimento.textContent = formatarMoeda(investimentos);
}

function atualizarUltimasTransacoes(transacoes) {
    const ultimas = [...transacoes]
        .sort((a, b) => new Date(b.data) - new Date(a.data))
        .slice(0, 5);

    elementos.ultimasTransacoes.innerHTML = "";
    elementos.ultimasVazio.hidden = ultimas.length > 0;

    ultimas.forEach((transacao) => {
        const entrada = transacao.tipo === "ENTRADA";
        const item = document.createElement("li");

        item.innerHTML = `
            <span class="ultimas__icone ${entrada ? "indicador__icone--entrada" : "indicador__icone--saida"}">
                ${icone(entrada ? "seta-entrada" : "seta-saida")}
            </span>
            <div>
                <p class="ultimas__categoria"></p>
                <p class="ultimas__data"></p>
            </div>
            <span class="ultimas__valor numero ${entrada ? "texto-entrada" : "texto-saida"}"></span>
        `;

        item.querySelector(".ultimas__categoria").textContent =
            formatarCategoria(transacao.categoria);

        item.querySelector(".ultimas__data").textContent =
            new Date(transacao.data).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit"
            });

        item.querySelector(".ultimas__valor").textContent =
            `${entrada ? "+" : "-"} ${formatarMoeda(transacao.valor)}`;

        elementos.ultimasTransacoes.appendChild(item);
    });
}


// =====================================================
// DADOS DOS GRÁFICOS
// (os gráficos mensais mostram o ano atual)
// =====================================================

function dataDoAnoAtual(transacao) {
    if (!transacao.data) {
        return null;
    }

    const data = new Date(transacao.data);

    if (isNaN(data.getTime()) || data.getFullYear() !== anoAtual()) {
        return null;
    }

    return data;
}

function obterMovimentacaoMensal(transacoes) {
    const entradas = Array(12).fill(0);
    const saidas = Array(12).fill(0);

    transacoes.forEach((transacao) => {
        const data = dataDoAnoAtual(transacao);

        if (!data) {
            return;
        }

        const mes = data.getMonth();
        const valor = Number(transacao.valor) || 0;

        if (transacao.tipo === "ENTRADA") {
            entradas[mes] += valor;
        }

        if (transacao.tipo === "SAIDA") {
            saidas[mes] += valor;
        }
    });

    return { entradas, saidas };
}

function obterSaidasPorCategoria(transacoes) {
    const categorias = Object.fromEntries(
        CATEGORIAS_SAIDA.map(({ chave }) => [chave, 0])
    );

    const porNome = Object.fromEntries(
        CATEGORIAS_SAIDA.map(({ chave }) => [normalizarTexto(chave), chave])
    );

    transacoes.forEach((transacao) => {
        if (transacao.tipo !== "SAIDA") {
            return;
        }

        const valor = Number(transacao.valor) || 0;
        const chave = porNome[normalizarTexto(transacao.categoria)] || "Outros";

        categorias[chave] += valor;
    });

    return categorias;
}

function obterInvestimentosMensais(transacoes) {
    const investimentos = Array(12).fill(0);

    transacoes.forEach((transacao) => {
        if (normalizarTexto(transacao.categoria) !== "investimento") {
            return;
        }

        const data = dataDoAnoAtual(transacao);
        const valor = Number(transacao.valor);

        if (!data || isNaN(valor)) {
            return;
        }

        investimentos[data.getMonth()] += valor;
    });

    return investimentos;
}


// =====================================================
// CONFIGURAÇÕES COMPARTILHADAS DOS GRÁFICOS
// =====================================================

function configurarGraficos() {
    Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
    Chart.defaults.font.size = 12;
    Chart.defaults.color = CORES.texto;

    Object.assign(Chart.defaults.plugins.tooltip, {
        backgroundColor: "#0c1a3d",
        borderColor: "rgba(148, 177, 255, 0.22)",
        borderWidth: 1,
        titleColor: "#eaf0ff",
        bodyColor: "#eaf0ff",
        padding: 10,
        cornerRadius: 8,
        boxPadding: 4,
        usePointStyle: true
    });
}

function opcoesBarras(limiteMaximo, rotuloTooltip) {
    return {
        responsive: true,
        maintainAspectRatio: false,

        animation: {
            duration: 500
        },

        interaction: {
            mode: "index",
            intersect: false
        },

        plugins: {
            legend: {
                display: false
            },

            tooltip: {
                callbacks: {
                    label(context) {
                        return ` ${rotuloTooltip || context.dataset.label}: ${formatarMoeda(context.raw)}`;
                    }
                }
            }
        },

        scales: {
            x: {
                grid: {
                    display: false
                },

                border: {
                    display: false
                },

                ticks: {
                    maxRotation: 0,
                    autoSkip: false,
                    font: {
                        size: window.innerWidth < 560 ? 10 : 12
                    }
                }
            },

            y: {
                beginAtZero: true,
                max: limiteMaximo,

                border: {
                    display: false
                },

                grid: {
                    color: CORES.grade
                },

                ticks: {
                    stepSize: limiteMaximo / 5,
                    callback: formatarEixoMoeda
                }
            }
        }
    };
}


// =====================================================
// GRÁFICO MENSAL
// =====================================================

function carregarGraficoMensal(transacoes) {
    const { entradas, saidas } = obterMovimentacaoMensal(transacoes);

    const limiteMaximo = calcularLimiteMaximo([
        ...entradas,
        ...saidas
    ]);

    graficoMensal?.destroy();

    graficoMensal = new Chart(document.querySelector("#graficoMensal"), {
        type: "bar",

        data: {
            labels: MESES,

            datasets: [
                {
                    label: "Entrada",
                    data: entradas,
                    backgroundColor: CORES.entrada,
                    borderRadius: 5,
                    maxBarThickness: 18
                },
                {
                    label: "Saída",
                    data: saidas,
                    backgroundColor: CORES.saida,
                    borderRadius: 5,
                    maxBarThickness: 18
                }
            ]
        },

        options: opcoesBarras(limiteMaximo)
    });
}


// =====================================================
// GRÁFICO DE SAÍDA
// =====================================================

function carregarGraficoSaida(transacoes) {
    const categorias = obterSaidasPorCategoria(transacoes);
    const valores = CATEGORIAS_SAIDA.map(({ chave }) => categorias[chave]);
    const total = valores.reduce((soma, valor) => soma + valor, 0);

    elementos.totalSaidaGrafico.textContent = formatarMoeda(total);

    graficoSaida?.destroy();

    graficoSaida = new Chart(document.querySelector("#graficoSaida"), {
        type: "doughnut",

        data: {
            labels: CATEGORIAS_SAIDA.map(({ chave }) => formatarCategoria(chave)),

            datasets: [
                {
                    // Sem saídas, mostra um anel vazio
                    data: total > 0 ? valores : [1],
                    backgroundColor: total > 0
                        ? CATEGORIAS_SAIDA.map(({ cor }) => cor)
                        : ["rgba(148, 177, 255, 0.12)"],
                    borderWidth: 0,
                    hoverOffset: total > 0 ? 6 : 0,
                    spacing: total > 0 ? 2 : 0
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "74%",

            layout: {
                padding: 6
            },

            plugins: {
                legend: {
                    display: false
                },

                tooltip: {
                    enabled: total > 0,

                    callbacks: {
                        label(context) {
                            const valor = Number(context.raw);
                            const porcentagem = ((valor / total) * 100).toFixed(1);

                            return ` ${formatarMoeda(valor)} (${porcentagem}%)`;
                        }
                    }
                }
            }
        }
    });

    montarLegendaSaida(valores, total);
}

function montarLegendaSaida(valores, total) {
    elementos.legendaSaida.innerHTML = "";

    CATEGORIAS_SAIDA.forEach(({ chave, cor }, indice) => {
        const valor = valores[indice];
        const porcentagem = total > 0 ? Math.round((valor / total) * 100) : 0;
        const item = document.createElement("li");

        item.innerHTML = `
            <span class="ponto" style="background:${cor}"></span>
            <span>${formatarCategoria(chave)}</span>
            <span class="legenda-categorias__porcentagem numero">${porcentagem}%</span>
            <span class="legenda-categorias__valor numero">${formatarMoeda(valor)}</span>
        `;

        elementos.legendaSaida.appendChild(item);
    });
}


// =====================================================
// GRÁFICO DE INVESTIMENTO
// =====================================================

function carregarGraficoInvestimento(transacoes) {
    const investimentos = obterInvestimentosMensais(transacoes);
    const limiteMaximo = calcularLimiteMaximo(investimentos);

    graficoInvestimento?.destroy();

    graficoInvestimento = new Chart(document.querySelector("#graficoInvestimento"), {
        type: "bar",

        data: {
            labels: MESES,

            datasets: [
                {
                    label: "Investimento",
                    data: investimentos,
                    backgroundColor: CORES.investimento,
                    hoverBackgroundColor: "#a9b5ff",
                    borderRadius: 5,
                    maxBarThickness: 28
                }
            ]
        },

        options: opcoesBarras(limiteMaximo)
    });
}
