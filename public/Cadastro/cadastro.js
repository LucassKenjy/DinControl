// =====================================================
// ELEMENTOS
// =====================================================

const formulario =
    document.querySelector("#formCadastro");

const campoNome =
    document.querySelector("#nome");

const campoEmail =
    document.querySelector("#email");

const campoSenha =
    document.querySelector("#senha");

const botaoCriar =
    document.querySelector("#botaoCriar");

const mensagem =
    document.querySelector("#mensagem");


// =====================================================
// SENHA: SOMENTE NÚMEROS, OLHO E REGRAS AO VIVO
// =====================================================

permitirSomenteNumeros(campoSenha, 10);
configurarOlhosSenha();
configurarRegrasSenha(
    campoSenha,
    document.querySelector("#regrasSenha")
);


// =====================================================
// CADASTRAR USUÁRIO
// =====================================================

formulario.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const nome =
            campoNome.value.trim();

        const email =
            campoEmail.value.trim();

        const senha =
            campoSenha.value.trim();


        // =============================================
        // CAMPOS OBRIGATÓRIOS
        // =============================================

        if (
            !nome ||
            !email ||
            !senha
        ) {

            mostrarMensagem(
                mensagem,
                "Preencha todos os campos.",
                "erro"
            );

            return;

        }


        // =============================================
        // VALIDAR SENHA
        // =============================================

        const erroSenha =
            validarSenhaNumerica(senha);

        if (erroSenha) {

            mostrarMensagem(mensagem, erroSenha, "erro");
            campoSenha.focus();

            return;

        }


        limparMensagem(mensagem);
        definirCarregando(botaoCriar, true, "Criando conta...");

        try {

            const resposta =
                await fetch(
                    "/users",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                nome,
                                email,
                                senha
                            })
                    }
                );


            const resultado =
                await resposta.json();


            // =========================================
            // SUCESSO
            // =========================================

            if (resposta.ok) {

                mostrarMensagem(
                    mensagem,
                    "Conta criada com sucesso! Redirecionando para o login...",
                    "sucesso"
                );

                formulario.reset();
                campoSenha.dispatchEvent(new Event("input"));

                setTimeout(() => {
                    window.location.href =
                        "/login/login.html";
                }, 1800);

                return;

            }


            // =========================================
            // ERRO DO SERVIDOR
            // =========================================

            mostrarMensagem(
                mensagem,
                resultado.erro ||
                "Erro ao criar conta.",
                "erro"
            );


        } catch (erro) {

            console.error(
                "Erro ao cadastrar usuário:",
                erro
            );


            mostrarMensagem(
                mensagem,
                "Erro ao conectar com o servidor.",
                "erro"
            );

        }

        definirCarregando(botaoCriar, false);

    }
);
