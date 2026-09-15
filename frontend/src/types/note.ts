/** Uma anotação do usuário logado (sem o conteúdo). */
export interface AnotacaoResumo {
  id: number
  title: string
  created_at: string
  updated_at: string
}

/** Anotação completa, como vem de GET /notes/:id. */
export interface Anotacao extends AnotacaoResumo {
  content: string
}
