import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../api/client'

export interface Feedback {
  texto: string
  tipo: 'sucesso' | 'erro'
}

const DURACAO = 3200

/**
 * Mensagens curtas de sucesso/erro exibidas dentro da interface
 * (o projeto já usa esse padrão em "mensagem-sucesso"/"mensagem-erro"
 * nas telas de Perfil e Nova Transação).
 */
export function useFeedback() {
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  useEffect(() => {
    if (!feedback) {
      return
    }

    const timer = setTimeout(() => setFeedback(null), DURACAO)

    return () => clearTimeout(timer)
  }, [feedback])

  const mostrarSucesso = useCallback((texto: string) => {
    setFeedback({ texto, tipo: 'sucesso' })
  }, [])

  const mostrarErro = useCallback((texto: string) => {
    setFeedback({ texto, tipo: 'erro' })
  }, [])

  /** Traduz uma falha de requisição na mensagem que veio da API. */
  const mostrarErroApi = useCallback(
    (erro: unknown, padrao: string) => {
      setFeedback({
        texto: erro instanceof ApiError ? erro.message : padrao,
        tipo: 'erro',
      })
    },
    [],
  )

  return { feedback, mostrarSucesso, mostrarErro, mostrarErroApi }
}
