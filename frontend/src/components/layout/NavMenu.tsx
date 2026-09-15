import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

interface NavMenuProps {
  /** CSS module map from the page that renders this menu. */
  styles: Record<string, string>
  paginaAtiva: 'principal' | 'historico' | 'anotacoes'
}

/**
 * Hamburger nav shared by the Principal, Historico and Listas/Anotações
 * headers. Each page
 * supplies its own CSS module so the menu renders with that page's exact
 * original styling (including the fact that only Historico's stylesheet
 * defines a "pagina-ativa" highlight).
 */
export function NavMenu({ styles, paginaAtiva }: NavMenuProps) {
  const [aberto, setAberto] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!aberto) {
      return
    }

    const fechar = () => setAberto(false)
    document.addEventListener('click', fechar)

    return () => document.removeEventListener('click', fechar)
  }, [aberto])

  return (
    <div className={styles['area-menu']}>
      <button
        type="button"
        className={styles['botao-menu']}
        onClick={(event) => {
          event.stopPropagation()
          setAberto((valor) => !valor)
        }}
      >
        ☰
      </button>

      <div
        ref={menuRef}
        className={[styles['menu-paginas'], aberto && styles.ativo]
          .filter(Boolean)
          .join(' ')}
        onClick={(event) => event.stopPropagation()}
      >
        <Link
          to="/principal"
          className={[
            styles['item-menu'],
            paginaAtiva === 'principal' && styles['pagina-ativa'],
          ]
            .filter(Boolean)
            .join(' ')}
        >
          Início
        </Link>

        <Link
          to="/historico"
          className={[
            styles['item-menu'],
            paginaAtiva === 'historico' && styles['pagina-ativa'],
          ]
            .filter(Boolean)
            .join(' ')}
        >
          Histórico
        </Link>

        <Link
          to="/anotacoes"
          className={[
            styles['item-menu'],
            paginaAtiva === 'anotacoes' && styles['pagina-ativa'],
          ]
            .filter(Boolean)
            .join(' ')}
        >
          Listas e Anotações
        </Link>
      </div>
    </div>
  )
}
