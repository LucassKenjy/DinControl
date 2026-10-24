import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { CampoSenha } from '../../components/ui/CampoSenha'
import { Mensagem } from '../../components/ui/Mensagem'
import type { TipoMensagem } from '../../components/ui/Mensagem'
import { RegrasSenha } from '../../components/ui/RegrasSenha'
import { redefinirSenha } from '../../api/auth'
import { ApiError } from '../../api/client'
import { validarSenha } from '../../utils/password'

export function RedefinirSenhaPage() {
  const navigate = useNavigate()

  const [dadosValidos, setDadosValidos] = useState(false)
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [concluido, setConcluido] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [tipoMensagem, setTipoMensagem] = useState<TipoMensagem>('info')

  useEffect(() => {
    const email = sessionStorage.getItem('emailRecuperacao')
    const resetToken = sessionStorage.getItem('resetToken')

    if (!email || !resetToken) {
      navigate('/redefinir', { replace: true })
      return
    }

    setDadosValidos(true)
  }, [navigate])

  function mostrarMensagem(texto: string, tipo: TipoMensagem) {
    setMensagem(texto)
    setTipoMensagem(tipo)
  }

  async function aoRedefinir(event: FormEvent) {
    event.preventDefault()

    const email = sessionStorage.getItem('emailRecuperacao')
    const resetToken = sessionStorage.getItem('resetToken')

    if (!email || !resetToken) {
      navigate('/redefinir', { replace: true })
      return
    }

    const novaSenhaTrim = novaSenha.trim()
    const confirmarSenhaTrim = confirmarSenha.trim()

    if (!novaSenhaTrim || !confirmarSenhaTrim) {
      mostrarMensagem('Preencha os dois campos.', 'erro')
      return
    }

    const erroSenha = validarSenha(novaSenhaTrim)

    if (erroSenha) {
      mostrarMensagem(erroSenha, 'erro')
      return
    }

    if (novaSenhaTrim !== confirmarSenhaTrim) {
      mostrarMensagem('As senhas não são iguais.', 'erro')
      return
    }

    setEnviando(true)
    setMensagem('')

    try {
      await redefinirSenha(email, resetToken, novaSenhaTrim)

      mostrarMensagem('Senha redefinida com sucesso! Redirecionando para o login...', 'sucesso')
      setConcluido(true)

      sessionStorage.removeItem('emailRecuperacao')
      sessionStorage.removeItem('resetToken')

      setTimeout(() => navigate('/login'), 1500)
    } catch (erro) {
      mostrarMensagem(
        erro instanceof ApiError ? erro.message : 'Erro ao conectar com o servidor.',
        'erro',
      )
    } finally {
      setEnviando(false)
    }
  }

  if (!dadosValidos) {
    return null
  }

  return (
    <AuthLayout
      selo="Código verificado"
      titulo="Quase lá!"
      destaque="Crie sua nova senha."
      texto="Depois de redefinir, você será levado ao login para entrar com a nova senha."
    >
      <h1 className="auth-titulo">Redefina sua senha</h1>
      <p className="auth-subtitulo">Escolha uma nova senha para acessar sua conta.</p>

      <form id="formRedefinirSenha" onSubmit={aoRedefinir} noValidate>
        <div className="campo">
          <label htmlFor="novaSenha" className="campo__rotulo">Insira sua nova senha</label>

          <CampoSenha
            id="novaSenha"
            placeholder="Nova senha numérica"
            inputMode="numeric"
            autoComplete="new-password"
            aria-describedby="regrasSenha"
            value={novaSenha}
            onChange={(event) => setNovaSenha(event.target.value.replace(/\D/g, ''))}
          />

          <RegrasSenha id="regrasSenha" senha={novaSenha} />
        </div>

        <div className="campo">
          <label htmlFor="confirmarSenha" className="campo__rotulo">Confirme sua senha</label>

          <CampoSenha
            id="confirmarSenha"
            placeholder="Repita a nova senha"
            inputMode="numeric"
            autoComplete="new-password"
            value={confirmarSenha}
            onChange={(event) => setConfirmarSenha(event.target.value.replace(/\D/g, ''))}
          />
        </div>

        <button
          type="submit"
          id="btnRedefinirSenha"
          className="botao botao--primario botao--bloco auth-enviar"
          disabled={enviando || concluido}
        >
          {enviando ? <span className="spinner" aria-hidden="true" /> : null}
          {enviando ? 'Redefinindo...' : 'Redefinir senha'}
        </button>

        <Mensagem id="mensagem" texto={mensagem} tipo={tipoMensagem} />
      </form>
    </AuthLayout>
  )
}
