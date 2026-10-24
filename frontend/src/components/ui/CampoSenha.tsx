import { useState } from 'react'
import type { InputHTMLAttributes } from 'react'
import { Icone } from './Icone'

type CampoSenhaProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'>

/** Campo de senha com o botão de mostrar/ocultar. */
export function CampoSenha(props: CampoSenhaProps) {
  const [visivel, setVisivel] = useState(false)

  return (
    <div className="entrada-grupo">
      <input {...props} type={visivel ? 'text' : 'password'} className="entrada" />

      <button
        type="button"
        className="entrada-grupo__acao"
        aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
        onClick={() => setVisivel((valor) => !valor)}
      >
        <Icone nome={visivel ? 'olho-fechado' : 'olho'} />
      </button>
    </div>
  )
}
