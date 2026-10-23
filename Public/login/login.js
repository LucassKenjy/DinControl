const formulario = document.querySelector("#formLogin");

const campoEmail = document.querySelector("#email");
const campoSenha = document.querySelector("#senha");

const botaoEntrar = document.querySelector("#botaoEntrar");
const mensagem = document.querySelector("#mensagem");

configurarOlhosSenha();


// =====================================================
// LOGIN
// =====================================================

formulario.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = campoEmail.value.trim();
    const senha = campoSenha.value.trim();

    if (!email || !senha) {
        mostrarMensagem(mensagem, "Preencha e-mail e senha.", "erro");
        (email ? campoSenha : campoEmail).focus();
        return;
    }

    limparMensagem(mensagem);
    definirCarregando(botaoEntrar, true, "Entrando...");

    try {
        const resposta = await fetch("/login", {
            method: "POST",
            credentials: "same-origin",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                senha
            })
        });

        const resultado = await resposta.json();

        if (resposta.ok) {
            // Remove dados antigos que eram usados
            // como autenticação no localStorage.
            localStorage.removeItem("usuarioId");
            localStorage.removeItem("usuarioNome");
            localStorage.removeItem("usuarioEmail");

            window.location.href =
                "/Principal/principal.html";

            return;
        }

        mostrarMensagem(
            mensagem,
            resultado.erro || "E-mail ou senha incorretos.",
            "erro"
        );

    } catch (error) {
        console.error(error);

        mostrarMensagem(
            mensagem,
            "Erro ao conectar com o servidor.",
            "erro"
        );
    }

    definirCarregando(botaoEntrar, false);
});
