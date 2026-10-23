import type { ReactNode } from 'react'
import styles from './AuthLayout.module.css'
import { Icone } from '../ui/Icone'
import type { NomeIcone } from '../ui/Icone'

export interface RecursoMarca {
  icone: NomeIcone
  texto: string
}

interface AuthLayoutProps {
  /** Selo curto acima da chamada ("Controle financeiro pessoal"). */
  selo: string
  /** Primeira linha da chamada. */
  titulo: string
  /** Segunda linha, com o gradiente da marca. */
  destaque: string
  texto: string
  recursos?: RecursoMarca[]
  children: ReactNode
}

/**
 * Moldura das telas antes do login: marca, chamada e mascote à
 * esquerda; o cartão branco com o formulário à direita. No celular
 * sobra só o logo e o cartão.
 */
export function AuthLayout({ selo, titulo, destaque, texto, recursos = [], children }: AuthLayoutProps) {
  return (
    <div className={styles.auth}>
      <aside className={styles.marca}>
        <img src="/assets/Logo.png" alt="DinControl" className={styles.logo} />

        <div className={styles.chamada}>
          <span className={styles.selo}>{selo}</span>

          <h2 className={styles.titulo}>
            {titulo}
            <br />
            <span>{destaque}</span>
          </h2>

          <p className={styles.texto}>{texto}</p>

          {recursos.length > 0 ? (
            <ul className={styles.recursos}>
              {recursos.map((recurso) => (
                <li key={recurso.texto}>
                  <Icone nome={recurso.icone} />
                  {recurso.texto}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <img src="/assets/Coin.png" alt="" className={styles.mascote} />
      </aside>

      <main className={styles.painel}>
        <img src="/assets/Logo.png" alt="DinControl" className={styles['logo-celular']} />

        <div className={`${styles.cartao} claro`}>{children}</div>

        <p className={styles.creditos}>© DinControl · Seu dinheiro, seu controle.</p>
      </main>
    </div>
  )
}
