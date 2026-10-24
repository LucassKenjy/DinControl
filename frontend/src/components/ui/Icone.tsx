export type NomeIcone =
  | 'olho'
  | 'olho-fechado'
  | 'inicio'
  | 'historico'
  | 'usuario'
  | 'sair'
  | 'mais'
  | 'menu'
  | 'fechar'
  | 'seta-esquerda'
  | 'seta-direita'
  | 'grafico'
  | 'escudo'
  | 'calendario'
  | 'carteira'
  | 'seta-entrada'
  | 'seta-saida'
  | 'cofrinho'
  | 'camera'
  | 'email'
  | 'cadeado'
  | 'vazio'
  | 'info'
  | 'lixeira'
  | 'lapis'
  | 'lista'
  | 'nota'
  | 'circulo'
  | 'circulo-check'

interface IconeProps {
  nome: NomeIcone
  className?: string
}

/** Ícone do sprite em /assets/icones.svg (traço herda a cor do texto). */
export function Icone({ nome, className = 'icone' }: IconeProps) {
  return (
    <svg className={className} aria-hidden="true">
      <use href={`/assets/icones.svg#${nome}`} />
    </svg>
  )
}
