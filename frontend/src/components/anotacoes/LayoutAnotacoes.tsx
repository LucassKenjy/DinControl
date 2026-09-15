import type { ReactNode } from 'react'
import styles from '../../pages/Anotacoes/Anotacoes.module.css'
import { LoadingScreen } from '../layout/LoadingScreen'
import { AppLogo } from '../layout/AppLogo'
import { AppCoin } from '../layout/AppCoin'
import { NavMenu } from '../layout/NavMenu'
import { ProfileButton } from '../layout/ProfileButton'
import { useAuth } from '../../context/AuthContext'
import { useFotoPerfil } from '../../utils/useFotoPerfil'
import type { Feedback } from '../../utils/useFeedback'

interface LayoutAnotacoesProps {
  /** Botões extras ao lado do menu (o "+" das telas que criam algo). */
  acoes?: ReactNode
  /** Uma coluna (lista/anotação aberta) ou duas (visão geral). */
  colunaUnica?: boolean
  feedback: Feedback | null
  children: ReactNode
}

/**
 * Moldura compartilhada pelas três telas da seção: reaproveita o
 * fundo, o logo, o perfil, o menu e o mascote já usados nas demais
 * páginas autenticadas, mudando apenas o conteúdo dos cards.
 */
export function LayoutAnotacoes({
  acoes,
  colunaUnica = false,
  feedback,
  children,
}: LayoutAnotacoesProps) {
  const { usuario } = useAuth()
  const { fotoSrc } = useFotoPerfil(usuario?.id ?? null)

  return (
    <>
      <LoadingScreen atraso={0} estilizado={false} />

      <div className={styles['pagina-anotacoes']}>
        <AppLogo />

        <ProfileButton
          styles={styles}
          nome={usuario?.nome ?? 'Usuário'}
          fotoSrc={fotoSrc}
        />

        <div className={styles.conteudo}>
          <div
            className={[styles['area-cards'], colunaUnica && styles.unica]
              .filter(Boolean)
              .join(' ')}
          >
            {children}
          </div>

          <div className={styles['area-acoes']}>
            {acoes}

            <NavMenu styles={styles} paginaAtiva="anotacoes" />
          </div>
        </div>

        {feedback ? (
          <div
            className={[
              styles.feedback,
              feedback.tipo === 'erro' ? styles['feedback-erro'] : styles['feedback-sucesso'],
            ].join(' ')}
            role="status"
          >
            {feedback.texto}
          </div>
        ) : null}

        <AppCoin />
      </div>
    </>
  )
}
