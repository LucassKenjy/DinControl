import { useEffect, useRef } from 'react'
import type { ChartConfiguration } from 'chart.js'
import { Chart } from '../../../utils/chartSetup'
import type { Transaction } from '../../../types/transaction'
import { MESES } from '../../../utils/constants'
import { normalizarTexto } from '../../../utils/formatters'
import { calcularLimiteMaximo, CORES_GRAFICO, opcoesBarras } from '../../../utils/chartOptions'
import { dataDoAnoAtual } from '../../../utils/totals'

function obterInvestimentosMensais(transacoes: Transaction[]): number[] {
  const investimentos = Array(12).fill(0)

  transacoes.forEach((transacao) => {
    if (normalizarTexto(transacao.categoria) !== 'investimento') {
      return
    }

    const data = dataDoAnoAtual(transacao)
    const valor = Number(transacao.valor)

    if (!data || isNaN(valor)) {
      return
    }

    investimentos[data.getMonth()] += valor
  })

  return investimentos
}

interface InvestmentChartProps {
  transacoes: Transaction[]
}

export function InvestmentChart({ transacoes }: InvestmentChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart<'bar'> | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    chartRef.current?.destroy()

    const investimentos = obterInvestimentosMensais(transacoes)
    const limiteMaximo = calcularLimiteMaximo(investimentos)

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: MESES,
        datasets: [
          {
            label: 'Investimento',
            data: investimentos,
            backgroundColor: CORES_GRAFICO.investimento,
            hoverBackgroundColor: '#a9b5ff',
            borderRadius: 5,
            maxBarThickness: 28,
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
      id="graficoInvestimento"
      ref={canvasRef}
      role="img"
      aria-label="Gráfico de investimentos por mês"
    />
  )
}
