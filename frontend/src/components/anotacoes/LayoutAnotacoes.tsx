import type { ReactNode } from 'react'
import styles from '../../pages/Anotacoes/Anotacoes.module.css'
import { AppLayout } from '../layout/AppLayout'
import type { Feedback } from '../../utils/useFeedback'

interface LayoutAnotacoesProps {
  titulo: ReactNode
  subtitulo?: ReactNode
  voltar?: { para: string; texto: string }
  /** Botões ao lado do título (criar, renomear, adicionar item). */
  acoes?: ReactNode
  /** Uma coluna (lista/anotação aberta) ou duas (visão geral). */
  colunaUnica?: boolean
  feedback: Feedback | null
  children: ReactNode
}

/**
 * Moldura compartilhada pelas três telas da seção: mesmo cabeçalho,
 * navegação e perfil das demais páginas logadas, mudando só os cards.
 */
export function LayoutAnotacoes({
  titulo,
  subtitulo,
  voltar,
  acoes,
  colunaUnica = false,
  feedback,
  children,
}: LayoutAnotacoesProps) {
  return (
    <AppLayout titulo={titulo} subtitulo={subtitulo} voltar={voltar} acoes={acoes} feedback={feedback}>
      <div className={[styles['area-cards'], colunaUnica && styles.unica].filter(Boolean).join(' ')}>
        {children}
      </div>
    </AppLayout>
  )
}
