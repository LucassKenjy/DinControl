// =====================================================
// DINCONTROL - FUNÇÕES COMPARTILHADAS
// Carregado antes do script de cada página.
// =====================================================

const ICONES = "/shared/img/icones.svg";


// =====================================================
// FORMATAÇÃO
// =====================================================

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function normalizarTexto(texto) {
    return String(texto || "")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .trim()
        .toLowerCase();
}

const NOMES_CATEGORIAS = {
    Salario: "Salário",
    Alimentacao: "Alimentação",
    Locomocao: "Locomoção",
    Educacao: "Educação",
    Investimento: "Investimento",
    Lazer: "Lazer",
    Outros: "Outros"
};

function formatarCategoria(categoria) {
    return NOMES_CATEGORIAS[categoria]
        || categoria
        || "Sem categoria";
}

function icone(nome, classe = "icone") {
    return `<svg class="${classe}" aria-hidden="true"><use href="${ICONES}#${nome}"></use></svg>`;
}


// =====================================================
// MENSAGENS
// =====================================================

function mostrarMensagem(elemento, texto, tipo = "info") {
    if (!elemento) {
        return;
    }

    elemento.classList.remove(
        "alerta--erro",
        "alerta--sucesso",
        "alerta--info"
    );

    elemento.classList.add("alerta", `alerta--${tipo}`);
    elemento.setAttribute("role", tipo === "erro" ? "alert" : "status");
    elemento.textContent = texto;
}

function limparMensagem(elemento) {
    if (elemento) {
        elemento.textContent = "";
    }
}


// =====================================================
// BOTÃO COM ESTADO DE CARREGAMENTO
// =====================================================

function definirCarregando(botao, carregando, textoCarregando) {
    if (!botao) {
        return;
    }

    if (carregando) {
        botao.dataset.textoOriginal = botao.innerHTML;
        botao.disabled = true;
        botao.innerHTML = `<span class="spinner" aria-hidden="true"></span>${textoCarregando}`;
        return;
    }

    botao.disabled = false;

    if (botao.dataset.textoOriginal) {
        botao.innerHTML = botao.dataset.textoOriginal;
    }
}


// =====================================================
// MOSTRAR / ESCONDER SENHA
// Botões com data-alternar-senha="idDoCampo"
// =====================================================

function configurarOlhosSenha() {
    document
        .querySelectorAll("[data-alternar-senha]")
        .forEach((botao) => {
            const campo = document.getElementById(
                botao.dataset.alternarSenha
            );

            if (!campo) {
                return;
            }

            const atualizar = () => {
                const visivel = campo.type === "text";

                botao.innerHTML = icone(visivel ? "olho-fechado" : "olho");
                botao.setAttribute(
                    "aria-label",
                    visivel ? "Ocultar senha" : "Mostrar senha"
                );
            };

            botao.addEventListener("click", () => {
                campo.type = campo.type === "password" ? "text" : "password";
                atualizar();
                campo.focus();
            });

            atualizar();
        });
}


// =====================================================
// SENHA NUMÉRICA
// Regras: só números, mínimo 5, sem números repetidos
// =====================================================

const REGRAS_SENHA = {
    numeros: (senha) => /^\d+$/.test(senha),
    tamanho: (senha) => senha.length >= 5,
    unicos: (senha) => senha.length > 0 && new Set(senha).size === senha.length
};

function validarSenhaNumerica(senha) {
    if (!REGRAS_SENHA.numeros(senha)) {
        return "A senha deve conter somente números.";
    }

    if (!REGRAS_SENHA.tamanho(senha)) {
        return "A senha deve conter no mínimo 5 números.";
    }

    if (!REGRAS_SENHA.unicos(senha)) {
        return "A senha não pode conter números repetidos.";
    }

    return null;
}

function permitirSomenteNumeros(campo, limite) {
    campo.addEventListener("input", () => {
        let valor = campo.value.replace(/\D/g, "");

        if (limite) {
            valor = valor.slice(0, limite);
        }

        campo.value = valor;
    });
}

// Atualiza a lista <ul class="regras-senha"> com itens data-regra
function configurarRegrasSenha(campo, lista) {
    if (!campo || !lista) {
        return;
    }

    const atualizar = () => {
        lista.querySelectorAll("[data-regra]").forEach((item) => {
            const regra = REGRAS_SENHA[item.dataset.regra];

            item.classList.toggle("ok", Boolean(regra && regra(campo.value)));
        });
    };

    campo.addEventListener("input", atualizar);
    atualizar();
}


// =====================================================
// ÁREA LOGADA
// =====================================================

function esconderLoading() {
    const loading = document.querySelector("#loading-screen");

    if (!loading) {
        return;
    }

    loading.classList.add("esconder");

    // Remove depois do fade, mesmo que a transição não dispare
    setTimeout(() => loading.remove(), 400);
}

function irParaLogin() {
    window.location.href = "/login/login.html";
}

function chaveFotoPerfil(usuarioId) {
    return `fotoPerfil_${usuarioId}`;
}

function aplicarFotoPerfil(usuarioId) {
    const fotoSalva = localStorage.getItem(chaveFotoPerfil(usuarioId));

    if (!fotoSalva) {
        return;
    }

    document
        .querySelectorAll("[data-usuario-foto]")
        .forEach((imagem) => {
            imagem.src = fotoSalva;
        });
}

// Busca o usuário logado e preenche nome/foto do cabeçalho.
// Redireciona para o login se a sessão não for válida.
async function carregarUsuarioLogado() {
    try {
        const resposta = await fetch("/me", {
            credentials: "same-origin"
        });

        if (!resposta.ok) {
            irParaLogin();
            return null;
        }

        const { usuario } = await resposta.json();

        atualizarNomeUsuario(usuario.nome);
        aplicarFotoPerfil(usuario.id);

        return usuario;

    } catch (erro) {
        console.error("Erro ao verificar sessão:", erro);
        irParaLogin();
        return null;
    }
}

function atualizarNomeUsuario(nome) {
    document
        .querySelectorAll("[data-usuario-nome]")
        .forEach((elemento) => {
            elemento.textContent = nome;
        });
}

function primeiroNome(nome) {
    return String(nome || "").trim().split(/\s+/)[0] || "";
}

// Menu de páginas no celular
function configurarMenu() {
    const botaoMenu = document.querySelector("#botaoMenu");
    const menuPaginas = document.querySelector("#menuPaginas");

    if (!botaoMenu || !menuPaginas) {
        return;
    }

    const fechar = () => {
        menuPaginas.classList.remove("ativo");
        botaoMenu.setAttribute("aria-expanded", "false");
    };

    botaoMenu.addEventListener("click", (event) => {
        event.stopPropagation();

        const aberto = menuPaginas.classList.toggle("ativo");
        botaoMenu.setAttribute("aria-expanded", String(aberto));
    });

    menuPaginas.addEventListener("click", (event) => {
        event.stopPropagation();
    });

    document.addEventListener("click", fechar);

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            fechar();
        }
    });
}

// Fecha um <dialog> ao clicar fora do conteúdo
function fecharModalAoClicarFora(modal) {
    modal?.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.close();
        }
    });
}
