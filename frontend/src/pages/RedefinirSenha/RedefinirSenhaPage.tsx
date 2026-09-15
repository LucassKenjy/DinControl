import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './RedefinirSenhaPage.module.css'
import { AuthLogo } from '../../components/layout/AuthLogo'
import { AuthCoin } from '../../components/layout/AuthCoin'
import { redefinirSenha } from '../../api/auth'
import { ApiError } from '../../api/client'
import { validarSenha } from '../../utils/password'

type TipoMensagem = 'erro' | 'sucesso' | 'normal'

export function RedefinirSenhaPage() {
  const navigate = useNavigate()

  const [dadosValidos, setDadosValidos] = useState(false)
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [novaSenhaVisivel, setNovaSenhaVisivel] = useState(false)
  const [confirmarSenhaVisivel, setConfirmarSenhaVisivel] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [tipoMensagem, setTipoMensagem] = useState<TipoMensagem>('normal')

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

  async function aoRedefinir() {
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
    mostrarMensagem('Alterando sua senha...', 'normal')

    try {
      await redefinirSenha(email, resetToken, novaSenhaTrim)

      mostrarMensagem('Senha redefinida com sucesso!', 'sucesso')

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

  const corMensagem =
    tipoMensagem === 'erro' ? '#e63946' : tipoMensagem === 'sucesso' ? '#159447' : '#555555'

  return (
    <div className={styles['conteudo-redefinirsenha']}>
      <AuthLogo />

      <div className={styles.redefinirsenha}>
        <h1 className={styles.titulo}>Redefina sua senha</h1>

        <p className={styles.SubTitulo}>
          • A senha deve conter somente números <br />
          • Deve conter no mínimo 5 números <br />
          • Não use sequências óbvias (ex: 1234, 4321)
        </p>

        <form
          id="formRedefinirSenha"
          className={styles.formRedefinirSenha}
          onSubmit={(event) => event.preventDefault()}
        >
          <label htmlFor="novaSenha">Insira sua nova senha</label>

          <div className={styles.CampoSenha}>
            <input
              type={novaSenhaVisivel ? 'text' : 'password'}
              id="novaSenha"
              className={styles.campoSenhaInput}
              inputMode="numeric"
              autoComplete="new-password"
              value={novaSenha}
              onChange={(event) => setNovaSenha(event.target.value.replace(/\D/g, ''))}
            />

            <button
              type="button"
              className={styles['botao-olho']}
              onClick={() => setNovaSenhaVisivel((valor) => !valor)}
            >
              <img src="/assets/olho.png" alt="Mostrar senha" />
            </button>
          </div>

          <label htmlFor="confirmarSenha">Confirme sua senha</label>

          <div className={styles.CampoSenha}>
            <input
              type={confirmarSenhaVisivel ? 'text' : 'password'}
              id="confirmarSenha"
              className={styles.campoSenhaInput}
              inputMode="numeric"
              autoComplete="new-password"
              value={confirmarSenha}
              onChange={(event) => setConfirmarSenha(event.target.value.replace(/\D/g, ''))}
            />

            <button
              type="button"
              className={styles['botao-olho']}
              onClick={() => setConfirmarSenhaVisivel((valor) => !valor)}
            >
              <img src="/assets/olho.png" alt="Mostrar senha" />
            </button>
          </div>

          <button
            type="button"
            id="btnRedefinirSenha"
            className={styles.btnRedefinirSenha}
            disabled={enviando}
            onClick={aoRedefinir}
          >
            {enviando ? 'Redefinindo...' : 'Redefinir sua senha'}
          </button>

          <p id="mensagem" className={styles.mensagem} style={{ color: corMensagem }}>
            {mensagem}
          </p>
        </form>
      </div>

      <AuthCoin />
    </div>
  )
}
