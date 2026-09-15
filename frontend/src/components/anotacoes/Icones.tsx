/**
 * Ícones das telas de Listas e Anotações. Mesmo traço do ícone de
 * excluir já usado no Histórico (stroke currentColor, 2px).
 */

const propsBase = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
} as const

export function IconeLixeira() {
  return (
    <svg {...propsBase}>
      <path d="M4 7h16" strokeLinecap="round" />
      <path d="M9 7V4h6v3" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 11v6M14 11v6" strokeLinecap="round" />
    </svg>
  )
}

export function IconeLapis() {
  return (
    <svg {...propsBase}>
      <path
        d="M4 20h4l10-10a2.1 2.1 0 0 0-3-3L5 17v3z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M13.5 6.5l4 4" strokeLinecap="round" />
    </svg>
  )
}

export function IconeVoltar() {
  return (
    <svg {...propsBase}>
      <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconeCheck({ marcado }: { marcado: boolean }) {
  return (
    <svg {...propsBase}>
      <circle cx="12" cy="12" r="9" />
      {marcado ? (
        <path d="M8 12.2l2.7 2.8L16 9.5" strokeLinecap="round" strokeLinejoin="round" />
      ) : null}
    </svg>
  )
}
