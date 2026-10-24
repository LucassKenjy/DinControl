import type { Transaction } from '../types/transaction'
import { normalizarTexto } from './formatters'

export interface Totais {
  entradas: number
  saidas: number
  investimentos: number
}

export function calcularTotais(transacoes: Transaction[]): Totais {
  let entradas = 0
  let saidas = 0
  let investimentos = 0

  transacoes.forEach((transacao) => {
    const valor = Number(transacao.valor) || 0

    if (transacao.tipo === 'ENTRADA') {
      entradas += valor
    }

    if (transacao.tipo === 'SAIDA') {
      saidas += valor
    }

    if (normalizarTexto(transacao.categoria) === 'investimento') {
      investimentos += valor
    }
  })

  return { entradas, saidas, investimentos }
}

/**
 * Data da transação, se ela for do ano atual. Os gráficos mensais
 * mostram Jan–Dez do ano corrente, sem somar meses de anos anteriores.
 */
export function dataDoAnoAtual(transacao: Transaction): Date | null {
  if (!transacao.data) {
    return null
  }

  const data = new Date(transacao.data)

  if (isNaN(data.getTime()) || data.getFullYear() !== new Date().getFullYear()) {
    return null
  }

  return data
}
