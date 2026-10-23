import styles from './BalanceCard.module.css'
import { Icone } from '../ui/Icone'
import { formatarMoeda } from '../../utils/formatters'

interface BalanceCardProps {
  saldo: number
  /** Saídas maiores que as entradas. */
  negativo: boolean
  className?: string
}

/** Destaque do saldo atual, com o mascote do DinControl. */
export function BalanceCard({ saldo, negativo, className }: BalanceCardProps) {
  return (
    <section className={['cartao', styles.saldo, className].filter(Boolean).join(' ')}>
      <div className={styles.info}>
        <div className={styles.rotulo}>
          <Icone nome="carteira" />
          Saldo atual
        </div>

        <div
          className={[styles.valor, saldo < 0 && styles.negativo, 'numero'].filter(Boolean).join(' ')}
          id="valorSaldo"
        >
          {formatarMoeda(saldo)}
        </div>

        <span className={`selo ${negativo ? 'selo--saida' : 'selo--entrada'}`} id="indicadorSaldo">
          <span className="ponto" />
          {negativo ? 'Saídas acima das entradas' : 'Entradas acima das saídas'}
        </span>
      </div>

      <img src="/assets/Coin.png" alt="Mascote DinControl" className={styles.mascote} />
    </section>
  )
}
