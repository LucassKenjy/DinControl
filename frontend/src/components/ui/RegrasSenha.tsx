import styles from './RegrasSenha.module.css'
import { REGRAS_SENHA } from '../../utils/password'

interface RegrasSenhaProps {
  senha: string
  id?: string
}

/** Lista das regras de senha, marcando as que já foram atendidas. */
export function RegrasSenha({ senha, id }: RegrasSenhaProps) {
  return (
    <ul className={styles.regras} id={id}>
      {REGRAS_SENHA.map((regra) => (
        <li key={regra.texto} className={regra.atende(senha) ? styles.ok : undefined}>
          {regra.texto}
        </li>
      ))}
    </ul>
  )
}
