export type TipoMensagem = 'erro' | 'sucesso' | 'info'

interface MensagemProps {
  texto: string
  tipo: TipoMensagem
  id?: string
}

/** Alerta de erro/sucesso/informação exibido abaixo dos formulários. */
export function Mensagem({ texto, tipo, id }: MensagemProps) {
  if (!texto) {
    return null
  }

  return (
    <p id={id} className={`alerta alerta--${tipo}`} role={tipo === 'erro' ? 'alert' : 'status'}>
      {texto}
    </p>
  )
}
