import { apiRequest } from './client'
import type { ItemLista, ListaResumo } from '../types/list'

export function buscarListas() {
  return apiRequest<ListaResumo[]>('/lists')
}

export function buscarLista(id: number) {
  return apiRequest<{ lista: ListaResumo; itens: ItemLista[] }>(`/lists/${id}`)
}

export function criarLista(name: string) {
  return apiRequest<{ mensagem: string; lista: ListaResumo }>('/lists', {
    method: 'POST',
    body: { name },
  })
}

export function renomearLista(id: number, name: string) {
  return apiRequest<{ mensagem: string; lista: ListaResumo }>(`/lists/${id}`, {
    method: 'PUT',
    body: { name },
  })
}

export function excluirLista(id: number) {
  return apiRequest<{ mensagem: string; lista: ListaResumo }>(`/lists/${id}`, {
    method: 'DELETE',
  })
}

export function buscarItens(listaId: number) {
  return apiRequest<ItemLista[]>(`/lists/${listaId}/items`)
}

export function criarItem(listaId: number, text: string) {
  return apiRequest<{ mensagem: string; item: ItemLista }>(`/lists/${listaId}/items`, {
    method: 'POST',
    body: { text },
  })
}

export function atualizarItem(
  id: number,
  dados: { text?: string; completed?: boolean },
) {
  return apiRequest<{ mensagem: string; item: ItemLista }>(`/list-items/${id}`, {
    method: 'PUT',
    body: dados,
  })
}

export function excluirItem(id: number) {
  return apiRequest<{ mensagem: string; item: ItemLista }>(`/list-items/${id}`, {
    method: 'DELETE',
  })
}
