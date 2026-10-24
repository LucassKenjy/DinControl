import type { Transaction } from '../types/transaction'
import { formatarCategoria } from '../types/category'
import { normalizarTexto } from './formatters'

const CATEGORIAS_SAIDA_BASE = [
  'Alimentacao',
  'Locomocao',
  'Investimento',
  'Lazer',
  'Educacao',
]

const CORES_CATEGORIA_SAIDA_BASE: Record<string, string> = {
  Alimentacao: '#ff6b6b',
  Locomocao: '#fbbf24',
  Investimento: '#8b9bff',
  Lazer: '#34d399',
  Educacao: '#f472b6',
  Outros: '#60a5fa',
}

/**
 * Groups SAIDA transactions by category for the expense pie chart.
 * Built dynamically (instead of a fixed set of keys) so custom
 * categories get their own slice while the 5 predefined categories plus
 * "Outros" keep their original, stable insertion order/colors.
 */
export function obterSaidasPorCategoria(transacoes: Transaction[]): Map<string, number> {
  const totais = new Map<string, number>()

  CATEGORIAS_SAIDA_BASE.forEach((categoria) => totais.set(categoria, 0))

  let outros = 0

  transacoes.forEach((transacao) => {
    if (transacao.tipo !== 'SAIDA') {
      return
    }

    const valor = Number(transacao.valor) || 0
    const categoriaOriginal = transacao.categoria || 'Outros'
    const categoriaNormalizada = normalizarTexto(categoriaOriginal)

    const chaveBase = CATEGORIAS_SAIDA_BASE.find(
      (categoria) => normalizarTexto(categoria) === categoriaNormalizada,
    )

    if (chaveBase) {
      totais.set(chaveBase, (totais.get(chaveBase) ?? 0) + valor)
      return
    }

    if (categoriaNormalizada === 'outros') {
      outros += valor
      return
    }

    const chaveExistente = [...totais.keys()].find(
      (chave) => normalizarTexto(chave) === categoriaNormalizada,
    )

    if (chaveExistente) {
      totais.set(chaveExistente, (totais.get(chaveExistente) ?? 0) + valor)
    } else {
      totais.set(categoriaOriginal, valor)
    }
  })

  totais.set('Outros', outros)

  return totais
}

export function obterCoresCategoriasSaida(chaves: string[]): string[] {
  let contadorPersonalizadas = 0

  return chaves.map((chave) => {
    const corBase = CORES_CATEGORIA_SAIDA_BASE[chave]

    if (corBase) {
      return corBase
    }

    const matiz = (280 + contadorPersonalizadas * 47) % 360
    contadorPersonalizadas += 1

    return `hsl(${matiz}, 70%, 62%)`
  })
}

export function formatarRotuloCategoriaSaida(categoria: string): string {
  return formatarCategoria(categoria)
}
