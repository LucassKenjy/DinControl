// =====================================================
// ELEMENTOS
// =====================================================

const formulario = document.getElementById("formRedefinirSenha");

const novaSenhaInput = document.getElementById("novaSenha");
const confirmarSenhaInput = document.getElementById("confirmarSenha");

const btnRedefinirSenha = document.getElementById("btnRedefinirSenha");

const mensagem = document.getElementById("mensagem");


// =====================================================
// DADOS DA RECUPERAÇÃO
// =====================================================

const email = sessionStorage.getItem("emailRecuperacao");
const resetToken = sessionStorage.getItem("resetToken");


// =====================================================
// BLOQUEIA ACESSO DIRETO À PÁGINA
// =====================================================

if (!email || !resetToken) {
    window.location.href =
        "/Redefinir/redefinir.html";
}


// =====================================================
// CAMPOS DE SENHA
// =====================================================

permitirSomenteNumeros(novaSenhaInput);
permitirSomenteNumeros(confirmarSenhaInput);

configurarOlhosSenha();
configurarRegrasSenha(
    novaSenhaInput,
    document.getElementById("regrasSenha")
);


// =====================================================
// REDEFINIR SENHA
// =====================================================

formulario.addEventListener("submit", async (event) => {
    event.preventDefault();

    const novaSenha = novaSenhaInput.value.trim();
    const confirmarSenha = confirmarSenhaInput.value.trim();

    if (!novaSenha || !confirmarSenha) {
        mostrarMensagem(
            mensagem,
            "Preencha os dois campos.",
            "erro"
        );

        return;
    }

    const erroSenha = validarSenhaNumerica(novaSenha);

    if (erroSenha) {
        mostrarMensagem(mensagem, erroSenha, "erro");
        novaSenhaInput.focus();
        return;
    }

    if (novaSenha !== confirmarSenha) {
        mostrarMensagem(
            mensagem,
            "As senhas não são iguais.",
            "erro"
        );

        confirmarSenhaInput.focus();
        return;
    }

    limparMensagem(mensagem);
    definirCarregando(btnRedefinirSenha, true, "Redefinindo...");

    try {
        const resposta = await fetch(
            "/forgot-password/reset-password",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    resetToken,
                    novaSenha
                })
            }
        );

        const resultado = await resposta.json();

        if (!resposta.ok) {
            mostrarMensagem(
                mensagem,
                resultado.erro ||
                "Erro ao redefinir senha.",
                "erro"
            );

            definirCarregando(btnRedefinirSenha, false);
            return;
        }

        mostrarMensagem(
            mensagem,
            "Senha redefinida com sucesso! Redirecionando para o login...",
            "sucesso"
        );

        sessionStorage.removeItem("emailRecuperacao");
        sessionStorage.removeItem("resetToken");

        setTimeout(() => {
            window.location.href =
                "/login/login.html";
        }, 1500);

    } catch (erro) {
        console.error(
            "Erro ao redefinir senha:",
            erro
        );

        mostrarMensagem(
            mensagem,
            "Erro ao conectar com o servidor.",
            "erro"
        );

        definirCarregando(btnRedefinirSenha, false);
    }
});
