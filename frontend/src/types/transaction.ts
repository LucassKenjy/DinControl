export type TransactionType = 'ENTRADA' | 'SAIDA'

/**
 * Mirrors the `Transac` table exactly as returned by the API
 * (GET/POST/PUT/DELETE /transactions). `data` is a single ISO timestamp
 * that carries both date and time — there is no separate description field
 * in the current data model.
 */
export interface Transaction {
  id: number
  tipo: TransactionType
  valor: number
  categoria: string
  data: string
  user_id: number
}

export interface NewTransactionPayload {
  data: string
  tipo: TransactionType
  valor: number
  categoria: string
}
