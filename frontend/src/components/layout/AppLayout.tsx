import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import styles from './AppLayout.module.css'
import { Icone } from '../ui/Icone'
import type { NomeIcone } from '../ui/Icone'
import { useAuth } from '../../context/AuthContext'
import { useFotoPerfil } from '../../utils/useFotoPerfil'
import type { Feedback } from '../../utils/useFeedback'

interface PaginaMenu {
  para: string
  texto: string
  icone: NomeIcone
  /** Prefixos de rota que também deixam o item ativo. */
  prefixos: string[]
}

const PAGINAS: PaginaMenu[] = [
  { para: '/principal', texto: 'Início', icone: 'inicio', prefixos: ['/principal'] },
  { para: '/historico', texto: 'Histórico', icone: 'historico', prefixos: ['/historico'] },
  {
    para: '/anotacoes',
    texto: 'Listas e Anotações',
    icone: 'lista',
    prefixos: ['/anotacoes', '/listas'],
  },
]

interface AppLayoutProps {
  titulo: ReactNode
  subtitulo?: ReactNode
  /** Botões à direita do título (ex.: "Nova transação"). */
  acoes?: ReactNode
  /** Link "voltar" acima do título. */
  voltar?: { para: string; texto: string }
  /** Mensagem curta exibida no canto da tela. */
  feedback?: Feedback | null
  children: ReactNode
}

/**
 * Moldura das telas logadas: cabeçalho com logo, navegação e perfil,
 * título da página e o conteúdo.
 */
export function AppLayout({ titulo, subtitulo, acoes, voltar, feedback, children }: AppLayoutProps) {
  const { pathname } = useLocation()
  const { usuario } = useAuth()
  const { fotoSrc } = useFotoPerfil(usuario?.id ?? null)
  const [menuAberto, setMenuAberto] = useState(false)

  // Fecha o menu do celular ao clicar fora ou apertar Esc
  useEffect(() => {
    if (!menuAberto) {
      return
    }

    const fechar = () => setMenuAberto(false)

    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === 'Escape') {
        fechar()
      }
    }

    document.addEventListener('click', fechar)
    document.addEventListener('keydown', aoTeclar)

    return () => {
      document.removeEventListener('click', fechar)
      document.removeEventListener('keydown', aoTeclar)
    }
  }, [menuAberto])

  return (
    <>
      <header className={styles.cabecalho}>
        <div className={`${styles.container} ${styles['cabecalho-conteudo']}`}>
          <Link to="/principal" className={styles.logo}>
            <img src="/assets/Logo.png" alt="DinControl" />
          </Link>

          <nav
            id="menuPaginas"
            aria-label="Páginas"
            className={[styles.navegacao, menuAberto && styles.aberto].filter(Boolean).join(' ')}
            onClick={(evento) => evento.stopPropagation()}
          >
            {PAGINAS.map((pagina) => {
              const ativa = pagina.prefixos.some((prefixo) => pathname.startsWith(prefixo))

              return (
                <Link
                  key={pagina.para}
                  to={pagina.para}
                  className={[styles.link, ativa && styles.ativo].filter(Boolean).join(' ')}
                  aria-current={ativa ? 'page' : undefined}
                  onClick={() => setMenuAberto(false)}
                >
                  <Icone nome={pagina.icone} />
                  {pagina.texto}
                </Link>
              )
            })}
          </nav>

          <div className={styles.acoes}>
            <Link
              to="/perfil"
              className={styles.usuario}
              title="Meu perfil"
              aria-current={pathname.startsWith('/perfil') ? 'page' : undefined}
            >
              <span className={styles['usuario-nome']}>{usuario?.nome ?? 'Usuário'}</span>
              <img src={fotoSrc} alt="Foto de perfil" className={styles.avatar} />
            </Link>

            <button
              type="button"
              className={`botao-icone ${styles['botao-menu']}`}
              aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
              aria-controls="menuPaginas"
              aria-expanded={menuAberto}
              onClick={(evento) => {
                evento.stopPropagation()
                setMenuAberto((valor) => !valor)
              }}
            >
              <Icone nome={menuAberto ? 'fechar' : 'menu'} />
            </button>
          </div>
        </div>
      </header>

      <main className={`${styles.container} ${styles.principal}`}>
        <div className={styles['cabecalho-pagina']}>
          <div className={styles['cabecalho-pagina-texto']}>
            {voltar ? (
              <Link to={voltar.para} className={styles.voltar}>
                <Icone nome="seta-esquerda" />
                {voltar.texto}
              </Link>
            ) : null}

            <h1 className={styles.titulo}>{titulo}</h1>
            {subtitulo ? <p className={styles.subtitulo}>{subtitulo}</p> : null}
          </div>

          {acoes ? <div className={styles['acoes-pagina']}>{acoes}</div> : null}
        </div>

        {children}
      </main>

      {feedback ? (
        <div
          className={[styles.toast, feedback.tipo === 'erro' ? styles['toast-erro'] : styles['toast-sucesso']].join(' ')}
          role="status"
        >
          <Icone nome={feedback.tipo === 'erro' ? 'info' : 'circulo-check'} />
          {feedback.texto}
        </div>
      ) : null}
    </>
  )
}
