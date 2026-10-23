import type { ChartOptions } from 'chart.js'
import { formatarEixoMoeda, formatarMoeda } from './formatters'

export const CORES_GRAFICO = {
  entrada: '#22c55e',
  saida: '#f5475a',
  investimento: '#8b9bff',
  texto: '#9fb0d6',
  grade: 'rgba(148, 177, 255, 0.08)',
}

export function calcularLimiteMaximo(valores: number[]): number {
  const maiorValor = Math.max(...valores)

  if (maiorValor === 0) {
    return 5000
  }

  const limite = Math.ceil(maiorValor / 1000) * 1000

  return Math.max(limite, 1000)
}

/** Opções compartilhadas pelos gráficos de barras (mensal e investimento). */
export function opcoesBarras(limiteMaximo: number): ChartOptions<'bar'> {
  const celular = window.innerWidth < 560

  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 500 },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label(context) {
            return ` ${context.dataset.label}: ${formatarMoeda(Number(context.raw))}`
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          maxRotation: 0,
          autoSkip: false,
          font: { size: celular ? 10 : 12 },
        },
      },
      y: {
        beginAtZero: true,
        max: limiteMaximo,
        border: { display: false },
        grid: { color: CORES_GRAFICO.grade },
        ticks: {
          stepSize: limiteMaximo / 5,
          callback: (valor) =>
            formatarEixoMoeda(Number(valor), Math.abs(Number(valor)) >= 10000),
        },
      },
    },
  }
}
