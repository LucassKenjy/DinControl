import type { CategoryOption } from '../../types/category'

interface CategorySelectorProps {
  id: string
  className?: string
  value: string
  options: CategoryOption[]
  onChange: (value: string) => void
}

export function CategorySelector({ id, className = 'entrada', value, options, onChange }: CategorySelectorProps) {
  return (
    <select id={id} className={className} value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">Selecione uma categoria</option>

      {options.map((opcao) => (
        <option key={opcao.value} value={opcao.value}>
          {opcao.label}
        </option>
      ))}
    </select>
  )
}
