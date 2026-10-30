# DinControl

Sistema de controle financeiro pessoal, desenvolvido em dupla, para registrar receitas e despesas e acompanhar as finanças por meio de um dashboard com gráficos.

🔗 **Acesse online:** [din-control.vercel.app](https://din-control.vercel.app)

## Funcionalidades

- Cadastro de usuário, login e logout com autenticação JWT
- Recuperação de senha por e-mail
- CRUD de transações (receitas e despesas)
- Categorias personalizadas
- Dashboard com gráficos e indicadores (Chart.js)
- Layout responsivo para celular

## Tecnologias

**Frontend:** React, TypeScript, Vite, React Router, HTML, CSS e Chart.js

**Backend:** Node.js, Express, PostgreSQL, JWT, bcryptjs e Nodemailer

**Ferramentas:** Git, GitHub (branches e Pull Requests) e Vercel

## Como rodar localmente

```bash
# 1. Clone o repositório
git clone https://github.com/LucassKenjy/DinControl.git
cd DinControl

# 2. Instale as dependências (também gera o build do frontend)
npm install

# 3. Crie um arquivo .env com as variáveis do banco PostgreSQL, do JWT e do e-mail

# 4. Crie as tabelas do banco
npm run migrate

# 5. Inicie o servidor
npm start
```

Para desenvolver só o frontend: `cd frontend && npm run dev`

## Equipe de Desenvolvimento

O DinControl foi desenvolvido em dupla por:

- [João Victor Lagoa Pacheco](https://github.com/Jlagoa10)
- [Lucas Kenjy Silva Okamoto](https://github.com/LucassKenjy)
