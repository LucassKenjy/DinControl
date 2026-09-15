import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'
import styles from './Modal.module.css'

interface ModalProps {
  titulo: string
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
 * Caixa de diálogo do DinControl: fundo escurecido, caixa azul
 * centralizada na tela e botões Cancelar/confirmar. Usada nas telas de
 * Listas e Anotações e no "Nova Transação" da tela Principal.
 *
 * É renderizada em um portal no <body> para que a centralização não
 * dependa de ancestrais com transform/position.
 */
export function Modal({
  titulo,
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
        <p className={styles['titulo-modal']}>{titulo}</p>

        {children ? <div className={styles['corpo-modal']}>{children}</div> : null}

        <div className={styles['acoes-modal']}>
          <button type="button" className={styles['botao-cancelar']} onClick={onCancelar}>
            {textoCancelar}
          </button>

          {textoConfirmar ? (
            <button
              type="button"
              className={[styles['botao-confirmar'], perigo && styles.perigo]
                .filter(Boolean)
                .join(' ')}
              disabled={confirmarDesabilitado}
              onClick={onConfirmar}
            >
              {textoConfirmar}
            </button>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  )
}
