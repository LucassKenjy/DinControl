// =====================================================
// DINCONTROL - MIGRAÇÕES
//
// Executa, em ordem alfabética, todos os arquivos .sql
// de src/database/migrations usando a mesma conexão
// (DATABASE_URL) já utilizada pelo servidor.
//
// Uso:  npm run migrate
// =====================================================

const fs = require("fs");
const path = require("path");
const pool = require("./db");


const PASTA_MIGRACOES =
    path.join(__dirname, "migrations");


async function executarMigracoes() {
    if (!process.env.DATABASE_URL) {
        throw new Error(
            "DATABASE_URL não configurado no ambiente."
        );
    }

    const arquivos =
        fs
            .readdirSync(PASTA_MIGRACOES)
            .filter(
                (arquivo) =>
                    arquivo.endsWith(".sql")
            )
            .sort();

    for (const arquivo of arquivos) {
        const sql =
            fs.readFileSync(
                path.join(
                    PASTA_MIGRACOES,
                    arquivo
                ),
                "utf8"
            );

        console.log(
            `Executando migração: ${arquivo}`
        );

        await pool.query(sql);
    }

    console.log(
        "Migrações executadas com sucesso."
    );
}


executarMigracoes()
    .then(
        async () => {
            await pool.end();
            process.exit(0);
        }
    )
    .catch(
        async (erro) => {
            console.error(
                "Erro ao executar migrações:",
                erro
            );

            await pool.end().catch(() => {});
            process.exit(1);
        }
    );
