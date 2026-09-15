import { apiRequest } from './client'
import type { Anotacao, AnotacaoResumo } from '../types/note'

export function buscarAnotacoes() {
  return apiRequest<AnotacaoResumo[]>('/notes')
}

export function buscarAnotacao(id: number) {
  return apiRequest<{ anotacao: Anotacao }>(`/notes/${id}`)
}

export function criarAnotacao(title: string) {
  return apiRequest<{ mensagem: string; anotacao: Anotacao }>('/notes', {
    method: 'POST',
    body: { title },
  })
}

export function atualizarAnotacao(
  id: number,
  dados: { title?: string; content?: string },
) {
  return apiRequest<{ mensagem: string; anotacao: Anotacao }>(`/notes/${id}`, {
    method: 'PUT',
    body: dados,
  })
}

export function excluirAnotacao(id: number) {
  return apiRequest<{ mensagem: string; anotacao: AnotacaoResumo }>(`/notes/${id}`, {
    method: 'DELETE',
  })
}
