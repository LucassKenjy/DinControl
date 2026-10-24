import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { CampoSenha } from '../../components/ui/CampoSenha'
import { Mensagem } from '../../components/ui/Mensagem'
import { RegrasSenha } from '../../components/ui/RegrasSenha'
import { cadastrarUsuario } from '../../api/auth'
import { ApiError } from '../../api/client'
import { validarSenha } from '../../utils/password'

/** Tempo mostrando o sucesso antes de ir para o login. */
const ATRASO_REDIRECIONAR = 1800

export function CadastroPage() {
  const navigate = useNavigate()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (!sucesso) {
      return
    }

    const timer = setTimeout(() => navigate('/login'), ATRASO_REDIRECIONAR)

    return () => clearTimeout(timer)
  }, [sucesso, navigate])

  function mostrarErro(texto: string) {
    setMensagem(texto)
    setSucesso(false)
  }

  async function aoEnviar(event: FormEvent) {
    event.preventDefault()

    const nomeTrim = nome.trim()
    const emailTrim = email.trim()
    const senhaTrim = senha.trim()

    if (!nomeTrim || !emailTrim || !senhaTrim) {
      mostrarErro('Preencha todos os campos.')
      return
    }

    const erroSenha = validarSenha(senhaTrim)

    if (erroSenha) {
      mostrarErro(erroSenha)
      return
    }

    setEnviando(true)
    setMensagem('')

    try {
      await cadastrarUsuario({ nome: nomeTrim, email: emailTrim, senha: senhaTrim })

      setMensagem('Conta criada com sucesso! Redirecionando para o login...')
      setSucesso(true)
      setNome('')
      setEmail('')
      setSenha('')
    } catch (erro) {
      mostrarErro(
        erro instanceof ApiError ? erro.message : 'Erro ao conectar com o servidor.',
      )
      setEnviando(false)
    }
  }

  return (
    <AuthLayout
      selo="Gratuito e simples"
      titulo="Comece a controlar"
      destaque="suas finanças."
      texto="Registre cada entrada e saída e entenda para onde vai o seu dinheiro."
      recursos={[
        { icone: 'carteira', texto: 'Saldo atual calculado automaticamente' },
        { icone: 'grafico', texto: 'Gráficos mensais, de saída e de investimento' },
        { icone: 'escudo', texto: 'Senha criptografada e sessão segura' },
      ]}
    >
      <h1 className="auth-titulo">Crie sua conta</h1>
      <p className="auth-subtitulo">Comece a controlar suas finanças</p>

      <form id="formCadastro" onSubmit={aoEnviar} noValidate>
        <div className="campo">
          <label htmlFor="nome" className="campo__rotulo">Nome completo</label>

          <input
            type="text"
            id="nome"
            className="entrada"
            placeholder="Digite seu nome"
            autoComplete="name"
            autoCorrect="off"
            spellCheck={false}
            required
            value={nome}
            onChange={(event) => setNome(event.target.value)}
          />
        </div>

        <div className="campo">
          <label htmlFor="email" className="campo__rotulo">E-mail</label>

          <input
            type="email"
            id="email"
            className="entrada"
            placeholder="voce@email.com"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="campo">
          <label htmlFor="senha" className="campo__rotulo">Senha</label>

          <CampoSenha
            id="senha"
            placeholder="Crie uma senha numérica"
            autoComplete="new-password"
            required
            minLength={5}
            maxLength={10}
            inputMode="numeric"
            aria-describedby="regrasSenha"
            value={senha}
            onChange={(event) => setSenha(event.target.value.replace(/\D/g, ''))}
          />

          <RegrasSenha id="regrasSenha" senha={senha} />
        </div>

        <button
          type="submit"
          className="botao botao--primario botao--bloco auth-enviar"
          disabled={enviando}
        >
          {enviando ? <span className="spinner" aria-hidden="true" /> : null}
          {enviando ? 'Criando conta...' : 'Criar conta'}
        </button>

        <Mensagem id="mensagem" texto={mensagem} tipo={sucesso ? 'sucesso' : 'erro'} />
      </form>

      <p className="auth-rodape">
        Já possui uma conta? <Link to="/login">Faça login</Link>
      </p>
    </AuthLayout>
  )
}
