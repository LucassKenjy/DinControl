import { Chart } from 'chart.js/auto'
import { CORES_GRAFICO } from './chartOptions'

// Tema padrão de todos os gráficos do DinControl
Chart.defaults.font.family = '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
Chart.defaults.font.size = 12
Chart.defaults.color = CORES_GRAFICO.texto

Object.assign(Chart.defaults.plugins.tooltip, {
  backgroundColor: '#0c1a3d',
  borderColor: 'rgba(148, 177, 255, 0.22)',
  borderWidth: 1,
  titleColor: '#eaf0ff',
  bodyColor: '#eaf0ff',
  padding: 10,
  cornerRadius: 8,
  boxPadding: 4,
  usePointStyle: true,
})

export { Chart }
