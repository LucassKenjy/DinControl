import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './PerfilPage.module.css'
import { AppLayout } from '../../components/layout/AppLayout'
import { CampoSenha } from '../../components/ui/CampoSenha'
import { Icone } from '../../components/ui/Icone'
import { Mensagem } from '../../components/ui/Mensagem'
import { Modal } from '../../components/ui/Modal'
import { useAuth } from '../../context/AuthContext'
import { reduzirImagem, useFotoPerfil } from '../../utils/useFotoPerfil'
import { atualizarUsuario } from '../../api/auth'
import { ApiError } from '../../api/client'

export function PerfilPage() {
  const navigate = useNavigate()
  const { usuario, definirUsuario, sair } = useAuth()
  const { fotoSrc, salvarFoto } = useFotoPerfil(usuario?.id ?? null)

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [confirmandoSaida, setConfirmandoSaida] = useState(false)
  const [saindo, setSaindo] = useState(false)

  const inputFotoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (usuario) {
      setNome(usuario.nome || '')
      setEmail(usuario.email || '')
    }
  }, [usuario])

  function mostrarErro(texto: string) {
    setMensagem(texto)
    setErro(true)
  }

  function mostrarSucesso(texto: string) {
    setMensagem(texto)
    setErro(false)
  }

  async function aoSalvar(event: FormEvent) {
    event.preventDefault()

    const novoNome = nome.trim()
    const novoEmail = email.trim()
    const senhaAtual = senha.trim()

    if (!novoNome || !novoEmail) {
      mostrarErro('Nome e e-mail são obrigatórios.')
      return
    }

    if (!senhaAtual) {
      mostrarErro('Digite sua senha para salvar as alterações.')
      return
    }

    setSalvando(true)
    setMensagem('')

    try {
      const resultado = await atualizarUsuario({
        nome: novoNome,
        email: novoEmail,
        senha: senhaAtual,
      })

      definirUsuario(resultado.usuario)
      setNome(resultado.usuario.nome)
      setEmail(resultado.usuario.email)
      setSenha('')

      mostrarSucesso('Perfil atualizado com sucesso!')
    } catch (erroRequisicao) {
      if (erroRequisicao instanceof ApiError && erroRequisicao.status === 401) {
        if (erroRequisicao.message === 'Senha incorreta.') {
          mostrarErro(erroRequisicao.message)
          return
        }

        navigate('/login')
        return
      }

      mostrarErro(
        erroRequisicao instanceof ApiError ? erroRequisicao.message : 'Erro ao atualizar perfil.',
      )
    } finally {
      setSalvando(false)
    }
  }

  async function aoSair() {
    setSaindo(true)
    await sair()
    navigate('/login')
  }

  async function aoEscolherFoto() {
    const arquivo = inputFotoRef.current?.files?.[0]

    if (inputFotoRef.current) {
      inputFotoRef.current.value = ''
    }

    if (!arquivo) {
      return
    }

    if (!arquivo.type.startsWith('image/')) {
      mostrarErro('Selecione uma imagem válida.')
      return
    }

    if (!usuario) {
      mostrarErro('Não foi possível identificar o usuário.')
      return
    }

    try {
      salvarFoto(await reduzirImagem(arquivo))
      mostrarSucesso('Foto atualizada!')
    } catch (erroFoto) {
      console.error('Erro ao salvar foto:', erroFoto)
      mostrarErro('Não foi possível usar esta imagem.')
    }
  }

  return (
    <AppLayout
      titulo="Meu perfil"
      subtitulo="Gerencie suas informações pessoais e sua foto."
      voltar={{ para: '/principal', texto: 'Voltar para o início' }}
    >
      <div className={styles.grade}>
        <aside className={`cartao ${styles.resumo}`}>
          <div className={styles.foto}>
            <img src={fotoSrc} alt="Foto de perfil" id="fotoPerfil" />

            <label htmlFor="inputFoto" className={styles['foto-botao']} title="Escolher foto">
              <Icone nome="camera" />
              <span className="sr-only">Escolher foto</span>
            </label>

            <input
              type="file"
              id="inputFoto"
              accept="image/png, image/jpeg, image/webp"
              hidden
              ref={inputFotoRef}
              onChange={aoEscolherFoto}
            />
          </div>

          <h2 className={styles.nome}>{usuario?.nome}</h2>
          <p className={styles.email}>{usuario?.email}</p>

          <label htmlFor="inputFoto" className="botao botao--secundario botao--sm botao--bloco">
            <Icone nome="camera" />
            Escolher foto
          </label>

          <p className={styles.dica}>
            <Icone nome="info" />
            A foto fica salva neste dispositivo.
          </p>

          <div className={styles.divisor} />

          <button
            type="button"
            className="botao botao--perigo botao--bloco"
            id="sairConta"
            onClick={() => setConfirmandoSaida(true)}
          >
            <Icone nome="sair" />
            Sair da conta
          </button>
        </aside>

        <section className={`cartao ${styles.dados}`}>
          <div className="cartao__cabecalho">
            <div>
              <h2 className="cartao__titulo">Dados da conta</h2>
              <p className="cartao__descricao">Para salvar alterações, confirme com a sua senha.</p>
            </div>
          </div>

          <form id="formPerfil" onSubmit={aoSalvar} noValidate>
            <div className={styles.linha}>
              <div className="campo">
                <label htmlFor="nome" className="campo__rotulo">Nome</label>
                <input
                  type="text"
                  id="nome"
                  className="entrada"
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
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            </div>

            <div className="campo">
              <label htmlFor="senha" className="campo__rotulo">Senha necessária para alteração</label>
              <CampoSenha
                id="senha"
                placeholder="Digite sua senha atual"
                autoComplete="current-password"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
              />
            </div>

            <Mensagem id="mensagemPerfil" texto={mensagem} tipo={erro ? 'erro' : 'sucesso'} />

            <div className={styles.acoes}>
              <button type="submit" className="botao botao--primario" disabled={salvando}>
                {salvando ? <span className="spinner" aria-hidden="true" /> : null}
                {salvando ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </form>

          <div className={styles.aviso}>
            <img src="/assets/Coin.png" alt="Mascote DinControl" className={styles['aviso-mascote']} />

            <div>
              <p className={styles['aviso-titulo']}>Esqueceu a senha?</p>
              <p className={styles['aviso-texto']}>
                Saia da conta e use “Esqueceu sua senha?” na tela de login para receber um código por e-mail.
              </p>
            </div>
          </div>
        </section>
      </div>

      {confirmandoSaida ? (
        <Modal
          titulo="Sair da conta?"
          descricao="Deseja realmente sair da conta? Você precisará fazer login novamente."
          textoConfirmar={saindo ? 'Saindo...' : 'Sair da conta'}
          perigo
          confirmarDesabilitado={saindo}
          onConfirmar={aoSair}
          onCancelar={() => setConfirmandoSaida(false)}
        />
      ) : null}
    </AppLayout>
  )
}
