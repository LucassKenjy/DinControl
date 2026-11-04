import { useEffect, useRef } from 'react'
import type { ChartConfiguration } from 'chart.js'
import { Chart } from '../../../utils/chartSetup'
import type { Transaction } from '../../../types/transaction'
import { normalizarTexto } from '../../../utils/formatters'
import { calcularLimiteMaximo, CORES_GRAFICO, opcoesBarras } from '../../../utils/chartOptions'
import { chaveData } from '../../../utils/formatters'

function obterInvestimentosMensais(transacoes: Transaction[], mes: string): number[] {
  const investimentos = Array(new Date(Number(mes.slice(0, 4)), Number(mes.slice(5)), 0).getDate()).fill(0)

  transacoes.forEach((transacao) => {
    if (normalizarTexto(transacao.categoria) !== 'investimento') {
      return
    }

    const data = new Date(transacao.data)
    const valor = Number(transacao.valor)

    if (chaveData(data).slice(0, 7) !== mes || isNaN(valor)) {
      return
    }

    investimentos[data.getDate() - 1] += valor
  })

  return investimentos
}

interface InvestmentChartProps {
  transacoes: Transaction[]
  mes: string
}

export function InvestmentChart({ transacoes, mes }: InvestmentChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart<'bar'> | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    chartRef.current?.destroy()

    const investimentos = obterInvestimentosMensais(transacoes, mes)
    const limiteMaximo = calcularLimiteMaximo(investimentos)

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: Array.from({ length: new Date(Number(mes.slice(0, 4)), Number(mes.slice(5)), 0).getDate() }, (_, i) => String(i + 1)),
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
  }, [transacoes, mes])

  return (
    <canvas
      id="graficoInvestimento"
      ref={canvasRef}
      role="img"
      aria-label="Gráfico de investimentos por dia do mês selecionado"
    />
  )
}
