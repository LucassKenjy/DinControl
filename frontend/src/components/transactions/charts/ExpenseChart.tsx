import { useEffect, useMemo, useRef } from 'react'
import type { ChartConfiguration } from 'chart.js'
import { Chart } from '../../../utils/chartSetup'
import type { Transaction } from '../../../types/transaction'
import { formatarMoeda } from '../../../utils/formatters'
import {
  obterCoresCategoriasSaida,
  obterSaidasPorCategoria,
  formatarRotuloCategoriaSaida,
} from '../../../utils/expenseCategories'
import styles from './ExpenseChart.module.css'

interface ExpenseChartProps {
  transacoes: Transaction[]
}

/** Rosca de saídas por categoria, com o total no centro e a legenda ao lado. */
export function ExpenseChart({ transacoes }: ExpenseChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart<'doughnut'> | null>(null)

  const categorias = useMemo(() => {
    const totais = obterSaidasPorCategoria(transacoes)
    const chaves = [...totais.keys()]
    const cores = obterCoresCategoriasSaida(chaves)

    return chaves.map((chave, indice) => ({
      chave,
      rotulo: formatarRotuloCategoriaSaida(chave),
      valor: totais.get(chave) ?? 0,
      cor: cores[indice],
    }))
  }, [transacoes])

  const total = categorias.reduce((soma, categoria) => soma + categoria.valor, 0)

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    chartRef.current?.destroy()

    const temSaidas = total > 0

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: categorias.map((categoria) => categoria.rotulo),
        datasets: [
          {
            // Sem saídas, mostra só um anel vazio
            data: temSaidas ? categorias.map((categoria) => categoria.valor) : [1],
            backgroundColor: temSaidas
              ? categorias.map((categoria) => categoria.cor)
              : ['rgba(148, 177, 255, 0.12)'],
            borderWidth: 0,
            hoverOffset: temSaidas ? 6 : 0,
            spacing: temSaidas ? 2 : 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '74%',
        layout: { padding: 6 },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: temSaidas,
            callbacks: {
              label(context) {
                const valor = Number(context.raw)
                const porcentagem = ((valor / total) * 100).toFixed(1)

                return ` ${formatarMoeda(valor)} (${porcentagem}%)`
              },
            },
          },
        },
      },
    }

    chartRef.current = new Chart(canvas, config)

    return () => {
      chartRef.current?.destroy()
      chartRef.current = null
    }
  }, [categorias, total])

  return (
    <>
      <div className={styles.rosca}>
        <canvas
          id="graficoSaida"
          ref={canvasRef}
          role="img"
          aria-label="Gráfico de saídas por categoria"
        />

        <div className={styles.centro}>
          <span>Total</span>
          <strong className="numero">{formatarMoeda(total)}</strong>
        </div>
      </div>

      <ul className={styles.legenda}>
        {categorias.map((categoria) => (
          <li key={categoria.chave}>
            <span className={styles.cor} style={{ background: categoria.cor }} />
            <span className={styles.nome}>{categoria.rotulo}</span>
            <span className={`${styles.porcentagem} numero`}>
              {total > 0 ? Math.round((categoria.valor / total) * 100) : 0}%
            </span>
            <span className={`${styles.valor} numero`}>{formatarMoeda(categoria.valor)}</span>
          </li>
        ))}
      </ul>
    </>
  )
}
