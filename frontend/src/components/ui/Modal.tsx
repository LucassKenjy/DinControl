import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'
import styles from './Modal.module.css'
import { Icone } from './Icone'

interface ModalProps {
  titulo: string
  /** Texto de apoio logo abaixo do título. */
  descricao?: string
  children?: ReactNode
  /** Texto do botão de confirmação. Omitido quando o modal só oferece opções. */
  textoConfirmar?: string
  textoCancelar?: string
  confirmarDesabilitado?: boolean
  /** Deixa o botão de confirmação vermelho (exclusões). */
  perigo?: boolean
  onConfirmar?: () => void
  onCancelar: () => void
}

/**
 * Caixa de diálogo do DinControl: fundo escurecido, cartão centralizado
 * e botões Cancelar/confirmar. Usada em Nova transação, exclusões,
 * Sair da conta e nas telas de Listas e Anotações.
 *
 * É renderizada em um portal no <body> para que a centralização não
 * dependa de ancestrais com transform/position.
 */
export function Modal({
  titulo,
  descricao,
  children,
  textoConfirmar,
  textoCancelar = 'Cancelar',
  confirmarDesabilitado = false,
  perigo = false,
  onConfirmar,
  onCancelar,
}: ModalProps) {
  useEffect(() => {
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === 'Escape') {
        onCancelar()
      }
    }

    document.addEventListener('keydown', aoTeclar)

    return () => document.removeEventListener('keydown', aoTeclar)
  }, [onCancelar])

  // Impede a página de rolar por trás do modal
  useEffect(() => {
    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = overflowAnterior
    }
  }, [])

  return createPortal(
    <div
      className={styles['fundo-modal']}
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) {
          onCancelar()
        }
      }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label={titulo}>
        <div className={styles['cabecalho-modal']}>
          <div>
            <p className={styles['titulo-modal']}>{titulo}</p>
            {descricao ? <p className={styles['descricao-modal']}>{descricao}</p> : null}
          </div>

          <button
            type="button"
            className={`botao-icone ${styles['fechar-modal']}`}
            aria-label="Fechar"
            onClick={onCancelar}
          >
            <Icone nome="fechar" />
          </button>
        </div>

        {children ? <div className={styles['corpo-modal']}>{children}</div> : null}

        {textoConfirmar ? (
          <div className={styles['acoes-modal']}>
            <button type="button" className="botao botao--secundario" onClick={onCancelar}>
              {textoCancelar}
            </button>

            <button
              type="button"
              className={`botao ${perigo ? 'botao--perigo-solido' : 'botao--primario'}`}
              disabled={confirmarDesabilitado}
              onClick={onConfirmar}
            >
              {textoConfirmar}
            </button>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
