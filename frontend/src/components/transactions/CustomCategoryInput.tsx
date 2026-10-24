interface CustomCategoryInputProps {
  id: string
  className?: string
  visible: boolean
  value: string
  onChange: (value: string) => void
}

export function CustomCategoryInput({ id, className = 'entrada', visible, value, onChange }: CustomCategoryInputProps) {
  return (
    <input
      type="text"
      id={id}
      className={className}
      placeholder="Digite o nome da categoria"
      aria-label="Nome da categoria personalizada"
      maxLength={30}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
      hidden={!visible}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}
