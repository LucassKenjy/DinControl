import type { Transaction } from '../../types/transaction'
import { formatarCategoria } from '../../types/category'
import { formatarHorario, formatarMoeda, nomeTipo, normalizarTipo } from '../../utils/formatters'
import { DeleteTransactionButton } from './DeleteTransactionButton'
import { Icone } from '../ui/Icone'

interface TransactionRowProps {
  styles: Record<string, string>
  transacao: Transaction
  onDeleted: (id: number) => void
}

export function TransactionRow({ styles, transacao, onDeleted }: TransactionRowProps) {
  const entrada = normalizarTipo(transacao.tipo) === 'entrada'
  const sinal = entrada ? '+' : '-'
  const variante = entrada ? 'entrada' : 'saida'
  const categoria = formatarCategoria(transacao.categoria)
  const valor = `${sinal} ${formatarMoeda(transacao.valor)}`

  return (
    <div className={styles['linha-historico']}>
      <span className={styles.categoria}>
        <span className={`${styles.icone} ${styles[`icone-${variante}`]}`}>
          <Icone nome={entrada ? 'seta-entrada' : 'seta-saida'} />
        </span>
        <span className={styles['nome-categoria']}>{categoria}</span>
      </span>

      <span className={styles.tipo}>
        <span className={`selo selo--${variante}`}>{nomeTipo(transacao.tipo)}</span>
      </span>

      <span className={`${styles.horario} numero`}>{formatarHorario(transacao.data)}</span>

      <span className={`${styles['valor-transacao']} ${styles[`valor-${variante}`]} numero`}>
        {valor}
      </span>

      <DeleteTransactionButton
        className={styles['botao-excluir-transacao']}
        transactionId={transacao.id}
        descricao={`${categoria}: ${valor}.`}
        onDeleted={onDeleted}
      />
    </div>
  )
}
