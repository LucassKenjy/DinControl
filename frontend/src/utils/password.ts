export function possuiSequenciaNumerica(senha: string): boolean {
  const digitos = senha.split('').map(Number)

  for (let i = 0; i <= digitos.length - 3; i++) {
    const a = digitos[i]
    const b = digitos[i + 1]
    const c = digitos[i + 2]

    const crescente = b === a + 1 && c === b + 1
    const decrescente = b === a - 1 && c === b - 1

    if (crescente || decrescente) {
      return true
    }
  }

  return false
}

/** Regras exibidas ao vivo nos formulários de senha. */
export const REGRAS_SENHA = [
  { texto: 'Somente números', atende: (senha: string) => /^\d+$/.test(senha) },
  { texto: 'No mínimo 5 números', atende: (senha: string) => senha.length >= 5 },
  {
    texto: 'Sem sequências óbvias (ex: 1234, 4321)',
    atende: (senha: string) => senha.length > 0 && !possuiSequenciaNumerica(senha),
  },
]

export function validarSenha(senha: string): string | null {
  if (!/^\d+$/.test(senha)) {
    return 'A senha deve conter somente números.'
  }

  if (senha.length < 5) {
    return 'A senha deve conter no mínimo 5 números.'
  }

  if (possuiSequenciaNumerica(senha)) {
    return 'A senha não pode conter sequências numéricas óbvias (ex: 1234, 4321).'
  }

  return null
}
