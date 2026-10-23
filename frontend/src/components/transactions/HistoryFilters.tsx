import { formatarCategoria } from '../../types/category'

const MESES_FILTRO = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export interface HistoryFiltersValue {
  tipo: string
  mes: string
  categoria: string
}

interface HistoryFiltersProps {
  className?: string
  valor: HistoryFiltersValue
  categoriasDisponiveis: string[]
  onChange: (valor: HistoryFiltersValue) => void
}

export function HistoryFilters({ className, valor, categoriasDisponiveis, onChange }: HistoryFiltersProps) {
  return (
    <div className={className} role="group" aria-label="Filtros">
      <label className="sr-only" htmlFor="filtroTipo">Tipo</label>
      <select
        id="filtroTipo"
        className="entrada"
        value={valor.tipo}
        onChange={(event) => onChange({ ...valor, tipo: event.target.value })}
      >
        <option value="todos">Todos os tipos</option>
        <option value="entrada">Entrada</option>
        <option value="saida">Saída</option>
      </select>

      <label className="sr-only" htmlFor="filtroMes">Mês</label>
      <select
        id="filtroMes"
        className="entrada"
        value={valor.mes}
        onChange={(event) => onChange({ ...valor, mes: event.target.value })}
      >
        <option value="todos">Todos os meses</option>
        {MESES_FILTRO.map((mes, indice) => (
          <option key={mes} value={String(indice)}>
            {mes}
          </option>
        ))}
      </select>

      <label className="sr-only" htmlFor="filtroCategoria">Categoria</label>
      <select
        id="filtroCategoria"
        className="entrada"
        value={valor.categoria}
        onChange={(event) => onChange({ ...valor, categoria: event.target.value })}
      >
        <option value="todos">Todas as categorias</option>
        {categoriasDisponiveis.map((categoria) => (
          <option key={categoria} value={categoria}>
            {formatarCategoria(categoria)}
          </option>
        ))}
      </select>
    </div>
  )
}
