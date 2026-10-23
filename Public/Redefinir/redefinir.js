const emailInput = document.getElementById("email");
const codigoInput = document.getElementById("codigo");

const btnEnviarCodigo = document.getElementById("btnEnviarCodigo");
const btnVerificarCodigo = document.getElementById("btnVerificarCodigo");

const mensagem = document.getElementById("mensagem");


// =====================================================
// CONFIGURAÇÕES
// =====================================================

const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const regexCodigo = /^\d{6}$/;


// =====================================================
// DEIXA O CAMPO CÓDIGO SOMENTE COM NÚMEROS
// =====================================================

permitirSomenteNumeros(codigoInput, 6);


// =====================================================
// MENSAGENS
// =====================================================

function mostrar(texto, tipo) {
    mostrarMensagem(
        mensagem,
        texto,
        tipo === "normal" ? "info" : tipo
    );
}


// =====================================================
// ENVIAR CÓDIGO
// =====================================================

btnEnviarCodigo.addEventListener("click", async () => {
    const email = emailInput.value
        .trim()
        .toLowerCase();

    if (!email) {
        mostrar(
            "Digite seu e-mail.",
            "erro"
        );

        emailInput.focus();
        return;
    }

    if (!regexEmail.test(email)) {
        mostrar(
            "Digite um e-mail válido.",
            "erro"
        );

        emailInput.focus();
        return;
    }

    try {
        definirCarregando(btnEnviarCodigo, true, "Enviando...");
        limparMensagem(mensagem);

        const resposta = await fetch(
            "/forgot-password/send-code",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email
                })
            }
        );

        const resultado = await resposta.json();

        if (!resposta.ok) {
            mostrar(
                resultado.erro ||
                "Erro ao enviar código.",
                "erro"
            );

            return;
        }

        mostrar(
            resultado.mensagem ||
            "Código enviado para o seu e-mail.",
            "sucesso"
        );

        emailInput.readOnly = true;

        codigoInput.value = "";
        codigoInput.focus();

    } catch (erro) {
        console.error(
            "Erro ao enviar código:",
            erro
        );

        mostrar(
            "Erro ao conectar com o servidor.",
            "erro"
        );

    } finally {
        definirCarregando(btnEnviarCodigo, false);
    }
});


// =====================================================
// VERIFICAR CÓDIGO
// =====================================================

btnVerificarCodigo.addEventListener("click", async () => {
    const email = emailInput.value
        .trim()
        .toLowerCase();

    const codigo = codigoInput.value.trim();

    if (!email) {
        mostrar(
            "Digite seu e-mail.",
            "erro"
        );

        emailInput.focus();
        return;
    }

    if (!codigo) {
        mostrar(
            "Digite o código recebido no e-mail.",
            "erro"
        );

        codigoInput.focus();
        return;
    }

    if (!regexCodigo.test(codigo)) {
        mostrar(
            "O código deve possuir 6 números.",
            "erro"
        );

        codigoInput.focus();
        return;
    }

    try {
        definirCarregando(btnVerificarCodigo, true, "Verificando...");
        limparMensagem(mensagem);

        const resposta = await fetch(
            "/forgot-password/verify-code",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    codigo
                })
            }
        );

        const resultado = await resposta.json();

        if (!resposta.ok) {
            mostrar(
                resultado.erro ||
                "Código inválido.",
                "erro"
            );

            codigoInput.focus();
            return;
        }

        mostrar(
            "Código verificado com sucesso!",
            "sucesso"
        );

        sessionStorage.setItem(
            "emailRecuperacao",
            email
        );

        sessionStorage.setItem(
            "resetToken",
            resultado.resetToken
        );

        window.location.href =
            "/RedefinirSenha/redefinirsenha.html";

    } catch (erro) {
        console.error(
            "Erro ao verificar código:",
            erro
        );

        mostrar(
            "Erro ao conectar com o servidor.",
            "erro"
        );

    } finally {
        definirCarregando(btnVerificarCodigo, false);
    }
});
