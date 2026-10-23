// =====================================================
// ESTADO DO USUÁRIO
// =====================================================

let usuarioAtual = null;
let usuarioId = null;

const TAMANHO_FOTO = 256;


// =====================================================
// ELEMENTOS
// =====================================================

const nome = document.querySelector("#nome");
const email = document.querySelector("#email");
const senha = document.querySelector("#senha");
const emailResumo = document.querySelector("#emailResumo");

const formulario = document.querySelector("#formPerfil");
const mensagem = document.querySelector("#mensagemPerfil");
const botaoSalvar = document.querySelector("#botaoSalvar");

const botaoSair = document.querySelector("#sairConta");
const modalSair = document.querySelector("#modalSair");
const cancelarSair = document.querySelector("#cancelarSair");
const confirmarSair = document.querySelector("#confirmarSair");

const inputFoto = document.querySelector("#inputFoto");


// =====================================================
// BUSCAR USUÁRIO LOGADO
// =====================================================

function preencherDados(usuario) {
    usuarioAtual = usuario;
    usuarioId = usuario.id;

    nome.value = usuario.nome || "";
    email.value = usuario.email || "";
    emailResumo.textContent = usuario.email || "";

    atualizarNomeUsuario(usuario.nome);
}


// =====================================================
// EDITAR PERFIL
// =====================================================

formulario.addEventListener("submit", async (event) => {
    event.preventDefault();

    const novoNome =
        nome.value.trim();

    const novoEmail =
        email.value.trim();

    const senhaAtual =
        senha.value.trim();

    if (!novoNome || !novoEmail) {
        mostrarMensagem(
            mensagem,
            "Nome e e-mail são obrigatórios.",
            "erro"
        );

        return;
    }

    if (!senhaAtual) {
        mostrarMensagem(
            mensagem,
            "Digite sua senha para salvar as alterações.",
            "erro"
        );

        senha.focus();
        return;
    }

    limparMensagem(mensagem);
    definirCarregando(botaoSalvar, true, "Salvando...");

    try {
        const resposta = await fetch(
            "/me",
            {
                method: "PUT",
                credentials: "same-origin",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    nome: novoNome,
                    email: novoEmail,
                    senha: senhaAtual
                })
            }
        );

        const resultado =
            await resposta.json();

        if (resposta.status === 401) {
            if (
                resultado.erro ===
                "Senha incorreta."
            ) {
                mostrarMensagem(
                    mensagem,
                    resultado.erro,
                    "erro"
                );

                return;
            }

            irParaLogin();
            return;
        }

        if (!resposta.ok) {
            mostrarMensagem(
                mensagem,
                resultado.erro ||
                "Erro ao atualizar perfil.",
                "erro"
            );

            return;
        }

        preencherDados(resultado.usuario);

        senha.value = "";

        mostrarMensagem(
            mensagem,
            "Perfil atualizado com sucesso!",
            "sucesso"
        );

    } catch (erro) {
        console.error(erro);

        mostrarMensagem(
            mensagem,
            "Erro ao conectar com o servidor.",
            "erro"
        );

    } finally {
        definirCarregando(botaoSalvar, false);
    }
});


// =====================================================
// SAIR DA CONTA
// =====================================================

botaoSair.addEventListener("click", () => {
    modalSair.showModal();
});

cancelarSair.addEventListener("click", () => {
    modalSair.close();
});

fecharModalAoClicarFora(modalSair);

confirmarSair.addEventListener("click", async () => {
    definirCarregando(confirmarSair, true, "Saindo...");

    try {
        await fetch("/logout", {
            method: "POST",
            credentials: "same-origin"
        });

    } catch (erro) {
        console.error(
            "Erro ao realizar logout:",
            erro
        );
    }

    // Remove apenas dados antigos de autenticação.
    // A foto continua salva localmente.
    localStorage.removeItem("usuarioId");
    localStorage.removeItem("usuarioNome");
    localStorage.removeItem("usuarioEmail");

    irParaLogin();
});


// =====================================================
// ESCOLHER NOVA FOTO
// A imagem é reduzida antes de salvar para não
// estourar o limite do localStorage.
// =====================================================

function reduzirImagem(arquivo) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(arquivo);
        const imagem = new Image();

        imagem.onload = () => {
            const lado = Math.min(imagem.width, imagem.height);
            const canvas = document.createElement("canvas");

            canvas.width = TAMANHO_FOTO;
            canvas.height = TAMANHO_FOTO;

            // Recorte quadrado central
            canvas.getContext("2d").drawImage(
                imagem,
                (imagem.width - lado) / 2,
                (imagem.height - lado) / 2,
                lado,
                lado,
                0,
                0,
                TAMANHO_FOTO,
                TAMANHO_FOTO
            );

            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL("image/jpeg", 0.88));
        };

        imagem.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Imagem inválida"));
        };

        imagem.src = url;
    });
}

inputFoto.addEventListener("change", async () => {
    const arquivo =
        inputFoto.files[0];

    inputFoto.value = "";

    if (!arquivo) {
        return;
    }

    if (!arquivo.type.startsWith("image/")) {
        mostrarMensagem(
            mensagem,
            "Selecione uma imagem válida.",
            "erro"
        );

        return;
    }

    if (!usuarioId) {
        mostrarMensagem(
            mensagem,
            "Não foi possível identificar o usuário.",
            "erro"
        );

        return;
    }

    try {
        const imagem = await reduzirImagem(arquivo);

        localStorage.setItem(
            chaveFotoPerfil(usuarioId),
            imagem
        );

        aplicarFotoPerfil(usuarioId);

        mostrarMensagem(
            mensagem,
            "Foto atualizada!",
            "sucesso"
        );

    } catch (erro) {
        console.error("Erro ao salvar foto:", erro);

        mostrarMensagem(
            mensagem,
            "Não foi possível usar esta imagem.",
            "erro"
        );
    }
});


// =====================================================
// INICIALIZAÇÃO
// =====================================================

async function inicializarPerfil() {
    const usuario = await carregarUsuarioLogado();

    if (!usuario) {
        return;
    }

    preencherDados(usuario);
    configurarMenu();
    configurarOlhosSenha();
    esconderLoading();
}

inicializarPerfil();
