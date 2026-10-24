import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from './RedefinirPage.module.css'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { Icone } from '../../components/ui/Icone'
import { Mensagem } from '../../components/ui/Mensagem'
import type { TipoMensagem } from '../../components/ui/Mensagem'
import { enviarCodigoRecuperacao, verificarCodigoRecuperacao } from '../../api/auth'
import { ApiError } from '../../api/client'

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const REGEX_CODIGO = /^\d{6}$/

export function RedefinirPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [emailBloqueado, setEmailBloqueado] = useState(false)
  const [codigo, setCodigo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [verificando, setVerificando] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [tipoMensagem, setTipoMensagem] = useState<TipoMensagem>('info')

  function mostrarMensagem(texto: string, tipo: TipoMensagem) {
    setMensagem(texto)
    setTipoMensagem(tipo)
  }

  async function aoEnviarCodigo() {
    const emailTrim = email.trim().toLowerCase()

    if (!emailTrim) {
      mostrarMensagem('Digite seu e-mail.', 'erro')
      return
    }

    if (!REGEX_EMAIL.test(emailTrim)) {
      mostrarMensagem('Digite um e-mail válido.', 'erro')
      return
    }

    setEnviando(true)
    setMensagem('')

    try {
      const resultado = await enviarCodigoRecuperacao(emailTrim)
      mostrarMensagem(resultado.mensagem || 'Código enviado para o seu e-mail.', 'sucesso')
      setEmailBloqueado(true)
    } catch (erro) {
      mostrarMensagem(
        erro instanceof ApiError ? erro.message : 'Erro ao conectar com o servidor.',
        'erro',
      )
    } finally {
      setEnviando(false)
    }
  }

  async function aoVerificarCodigo() {
    const emailTrim = email.trim().toLowerCase()
    const codigoTrim = codigo.trim()

    if (!emailTrim) {
      mostrarMensagem('Digite seu e-mail.', 'erro')
      return
    }

    if (!codigoTrim) {
      mostrarMensagem('Digite o código recebido no e-mail.', 'erro')
      return
    }

    if (!REGEX_CODIGO.test(codigoTrim)) {
      mostrarMensagem('O código deve possuir 6 números.', 'erro')
      return
    }

    setVerificando(true)
    setMensagem('')

    try {
      const resultado = await verificarCodigoRecuperacao(emailTrim, codigoTrim)

      sessionStorage.setItem('emailRecuperacao', emailTrim)
      sessionStorage.setItem('resetToken', resultado.resetToken)

      navigate('/redefinir-senha')
    } catch (erro) {
      mostrarMensagem(
        erro instanceof ApiError ? erro.message : 'Erro ao conectar com o servidor.',
        'erro',
      )
      setVerificando(false)
    }
  }

  return (
    <AuthLayout
      selo="Recuperação de acesso"
      titulo="Recupere sua conta"
      destaque="em poucos passos."
      texto="Enviaremos um código de 6 números para o e-mail cadastrado. Ele é válido por 10 minutos."
      recursos={[
        { icone: 'email', texto: 'Receba o código no seu e-mail' },
        { icone: 'escudo', texto: 'Confirme o código recebido' },
        { icone: 'cadeado', texto: 'Crie uma nova senha' },
      ]}
    >
      <Link to="/login" className="auth-voltar">
        <Icone nome="seta-esquerda" />
        Voltar para o login
      </Link>

      <h1 className="auth-titulo">Redefina sua senha</h1>
      <p className="auth-subtitulo">Informe seu e-mail para receber o código de verificação.</p>

      <form id="formRedef" onSubmit={(event) => event.preventDefault()} noValidate>
        <div className={styles.etapa}>
          <span className={styles.numero}>1</span>

          <label htmlFor="email" className={`campo__rotulo ${styles['titulo-etapa']}`}>
            Você receberá um código neste e-mail
          </label>

          <input
            type="email"
            id="email"
            className="entrada"
            placeholder="voce@email.com"
            autoComplete="email"
            value={email}
            readOnly={emailBloqueado}
            onChange={(event) => setEmail(event.target.value)}
          />

          <button
            type="button"
            id="btnEnviarCodigo"
            className="botao botao--primario botao--bloco"
            disabled={enviando}
            onClick={aoEnviarCodigo}
          >
            {enviando ? <span className="spinner" aria-hidden="true" /> : null}
            {enviando ? 'Enviando...' : emailBloqueado ? 'Reenviar código' : 'Enviar código'}
          </button>
        </div>

        <div className={styles.etapa}>
          <span className={styles.numero}>2</span>

          <label htmlFor="codigo" className={`campo__rotulo ${styles['titulo-etapa']}`}>
            Digite o código recebido no e-mail
          </label>

          <input
            type="text"
            id="codigo"
            className={`entrada ${styles.codigo}`}
            placeholder="000000"
            maxLength={6}
            inputMode="numeric"
            autoComplete="one-time-code"
            value={codigo}
            onChange={(event) => setCodigo(event.target.value.replace(/\D/g, '').slice(0, 6))}
          />

          <button
            type="button"
            id="btnVerificarCodigo"
            className="botao botao--primario botao--bloco"
            disabled={verificando}
            onClick={aoVerificarCodigo}
          >
            {verificando ? <span className="spinner" aria-hidden="true" /> : null}
            {verificando ? 'Verificando...' : 'Verificar código'}
          </button>
        </div>

        <Mensagem id="mensagem" texto={mensagem} tipo={tipoMensagem} />
      </form>
    </AuthLayout>
  )
}
