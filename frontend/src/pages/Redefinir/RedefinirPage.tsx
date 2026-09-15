import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './RedefinirPage.module.css'
import { AuthLogo } from '../../components/layout/AuthLogo'
import { AuthCoin } from '../../components/layout/AuthCoin'
import { enviarCodigoRecuperacao, verificarCodigoRecuperacao } from '../../api/auth'
import { ApiError } from '../../api/client'

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const REGEX_CODIGO = /^\d{6}$/

type TipoMensagem = 'erro' | 'sucesso' | 'normal'

export function RedefinirPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [emailBloqueado, setEmailBloqueado] = useState(false)
  const [codigo, setCodigo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [verificando, setVerificando] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [tipoMensagem, setTipoMensagem] = useState<TipoMensagem>('normal')

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
    mostrarMensagem('Enviando código...', 'normal')

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
    mostrarMensagem('Verificando código...', 'normal')

    try {
      const resultado = await verificarCodigoRecuperacao(emailTrim, codigoTrim)

      mostrarMensagem('Código verificado com sucesso!', 'sucesso')

      sessionStorage.setItem('emailRecuperacao', emailTrim)
      sessionStorage.setItem('resetToken', resultado.resetToken)

      navigate('/redefinir-senha')
    } catch (erro) {
      mostrarMensagem(
        erro instanceof ApiError ? erro.message : 'Erro ao conectar com o servidor.',
        'erro',
      )
    } finally {
      setVerificando(false)
    }
  }

  const corMensagem =
    tipoMensagem === 'erro' ? '#e63946' : tipoMensagem === 'sucesso' ? '#159447' : '#555555'

  return (
    <div className={styles['conteudo-redefinir']}>
      <AuthLogo />

      <div className={styles.redefinir}>
        <h1 className={styles.titulo}>Redefina sua senha</h1>

        <form
          id="formRedef"
          className={styles.formRedef}
          onSubmit={(event) => event.preventDefault()}
        >
          <label htmlFor="email">Você receberá um código neste e-mail</label>

          <div className={styles.campo}>
            <input
              type="email"
              id="email"
              className={styles.email}
              placeholder="Digite seu e-mail"
              value={email}
              readOnly={emailBloqueado}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <button
            type="button"
            id="btnEnviarCodigo"
            className={styles.btnEnviarCodigo}
            disabled={enviando}
            onClick={aoEnviarCodigo}
          >
            {enviando ? 'Enviando...' : 'Enviar Código'}
          </button>

          <div className={styles.CampoC}>
            <label htmlFor="codigo">Digite o código recebido no e-mail</label>

            <div className={styles.campo}>
              <input
                type="text"
                id="codigo"
                className={styles.codigo}
                placeholder="Digite o código"
                maxLength={6}
                inputMode="numeric"
                value={codigo}
                onChange={(event) => setCodigo(event.target.value.replace(/\D/g, '').slice(0, 6))}
              />
            </div>

            <button
              type="button"
              id="btnVerificarCodigo"
              className={styles.btnVerificarCodigo}
              disabled={verificando}
              onClick={aoVerificarCodigo}
            >
              {verificando ? 'Verificando...' : 'Verificar código'}
            </button>
          </div>

          <p id="mensagem" className={styles.mensagem} style={{ color: corMensagem }}>
            {mensagem}
          </p>
        </form>
      </div>

      <AuthCoin />
    </div>
  )
}
