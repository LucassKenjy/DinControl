import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { CampoSenha } from '../../components/ui/CampoSenha'
import { Mensagem } from '../../components/ui/Mensagem'
import { login } from '../../api/auth'
import { ApiError } from '../../api/client'
import { useAuth } from '../../context/AuthContext'

export function LoginPage() {
  const navigate = useNavigate()
  const { definirUsuario } = useAuth()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function aoEnviar(event: FormEvent) {
    event.preventDefault()
    setMensagem('')

    if (!email.trim() || !senha.trim()) {
      setMensagem('Preencha e-mail e senha.')
      return
    }

    setEnviando(true)

    try {
      const resultado = await login({
        email: email.trim(),
        senha: senha.trim(),
      })

      definirUsuario(resultado.usuario)
      navigate('/principal')
    } catch (erro) {
      setMensagem(
        erro instanceof ApiError ? erro.message : 'Erro ao conectar com o servidor.',
      )
      setEnviando(false)
    }
  }

  return (
    <AuthLayout
      selo="Controle financeiro pessoal"
      titulo="Seu dinheiro,"
      destaque="seu controle."
      texto="Acompanhe entradas, saídas e investimentos em um só lugar."
      recursos={[
        { icone: 'grafico', texto: 'Saldo e gráficos sempre atualizados' },
        { icone: 'lista', texto: 'Listas e anotações junto com suas finanças' },
        { icone: 'escudo', texto: 'Senha criptografada e sessão segura' },
      ]}
    >
      <h1 className="auth-titulo">Seja bem-vindo(a)</h1>
      <p className="auth-subtitulo">Faça login para continuar</p>

      <form id="formLogin" onSubmit={aoEnviar} noValidate>
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
          <div className="campo__topo">
            <label htmlFor="senha" className="campo__rotulo">Senha</label>
            <Link to="/redefinir" className="campo__link">Esqueceu sua senha?</Link>
          </div>

          <CampoSenha
            id="senha"
            placeholder="Digite sua senha"
            autoComplete="current-password"
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
          />
        </div>

        <button
          type="submit"
          className="botao botao--primario botao--bloco auth-enviar"
          disabled={enviando}
        >
          {enviando ? <span className="spinner" aria-hidden="true" /> : null}
          {enviando ? 'Entrando...' : 'Entrar'}
        </button>

        <Mensagem id="mensagem" texto={mensagem} tipo="erro" />
      </form>

      <p className="auth-rodape">
        Não possui uma conta? <Link to="/cadastro">Cadastre-se</Link>
      </p>
    </AuthLayout>
  )
}
