import { useEffect, useRef } from 'react'
import type { ChartConfiguration } from 'chart.js'
import { Chart } from '../../../utils/chartSetup'
import type { Transaction } from '../../../types/transaction'
import { calcularLimiteMaximo, CORES_GRAFICO, opcoesBarras } from '../../../utils/chartOptions'
import { chaveData } from '../../../utils/formatters'

function obterMovimentacaoMensal(transacoes: Transaction[], mes: string) {
  const entradas = Array(new Date(Number(mes.slice(0, 4)), Number(mes.slice(5)), 0).getDate()).fill(0)
  const saidas = Array(new Date(Number(mes.slice(0, 4)), Number(mes.slice(5)), 0).getDate()).fill(0)

  transacoes.forEach((transacao) => {
    const data = new Date(transacao.data)

    if (chaveData(data).slice(0, 7) !== mes) {
      return
    }

    const dia = data.getDate() - 1
    const valor = Number(transacao.valor) || 0

    if (transacao.tipo === 'ENTRADA') {
      entradas[dia] += valor
    }

    if (transacao.tipo === 'SAIDA') {
      saidas[dia] += valor
    }
  })

  return { entradas, saidas }
}

interface MonthlyChartProps {
  transacoes: Transaction[]
  mes: string
}

export function MonthlyChart({ transacoes, mes }: MonthlyChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart<'bar'> | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    chartRef.current?.destroy()

    const { entradas, saidas } = obterMovimentacaoMensal(transacoes, mes)
    const limiteMaximo = calcularLimiteMaximo([...entradas, ...saidas])

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: Array.from({ length: new Date(Number(mes.slice(0, 4)), Number(mes.slice(5)), 0).getDate() }, (_, i) => String(i + 1)),
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
  }, [transacoes, mes])

  return (
    <canvas
      id="graficoMensal"
      ref={canvasRef}
      role="img"
      aria-label="Gráfico de entradas e saídas por dia do mês selecionado"
    />
  )
}
