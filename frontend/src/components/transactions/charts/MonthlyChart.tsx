import { useEffect, useRef } from 'react'
import type { ChartConfiguration } from 'chart.js'
import { Chart } from '../../../utils/chartSetup'
import type { Transaction } from '../../../types/transaction'
import { MESES } from '../../../utils/constants'
import { calcularLimiteMaximo, CORES_GRAFICO, opcoesBarras } from '../../../utils/chartOptions'
import { dataDoAnoAtual } from '../../../utils/totals'

function obterMovimentacaoMensal(transacoes: Transaction[]) {
  const entradas = Array(12).fill(0)
  const saidas = Array(12).fill(0)

  transacoes.forEach((transacao) => {
    const data = dataDoAnoAtual(transacao)

    if (!data) {
      return
    }

    const mes = data.getMonth()
    const valor = Number(transacao.valor) || 0

    if (transacao.tipo === 'ENTRADA') {
      entradas[mes] += valor
    }

    if (transacao.tipo === 'SAIDA') {
      saidas[mes] += valor
    }
  })

  return { entradas, saidas }
}

interface MonthlyChartProps {
  transacoes: Transaction[]
}

export function MonthlyChart({ transacoes }: MonthlyChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart<'bar'> | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    chartRef.current?.destroy()

    const { entradas, saidas } = obterMovimentacaoMensal(transacoes)
    const limiteMaximo = calcularLimiteMaximo([...entradas, ...saidas])

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: MESES,
        datasets: [
          {
            label: 'Entrada',
            data: entradas,
            backgroundColor: CORES_GRAFICO.entrada,
            borderRadius: 5,
            maxBarThickness: 18,
          },
          {
            label: 'Saída',
            data: saidas,
            backgroundColor: CORES_GRAFICO.saida,
            borderRadius: 5,
            maxBarThickness: 18,
          },
        ],
      },
      options: opcoesBarras(limiteMaximo),
    }

    chartRef.current = new Chart(canvas, config)

    return () => {
      chartRef.current?.destroy()
      chartRef.current = null
    }
  }, [transacoes])

  return (
    <canvas
      id="graficoMensal"
      ref={canvasRef}
      role="img"
      aria-label="Gráfico de entradas e saídas por mês"
    />
  )
}
