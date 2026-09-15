/** Uma lista do usuário logado (sem os itens). */
export interface ListaResumo {
  id: number
  name: string
  created_at: string
  updated_at: string
}

/** Item que pertence a uma lista. */
export interface ItemLista {
  id: number
  list_id: number
  text: string
  completed: boolean
  created_at: string
  updated_at: string
}
