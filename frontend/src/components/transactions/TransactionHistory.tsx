import type { Transaction } from '../../types/transaction'
import { chaveData, tituloDaData } from '../../utils/formatters'
import { TransactionRow } from './TransactionRow'

interface TransactionHistoryProps {
  styles: Record<string, string>
  transacoes: Transaction[]
  onDeleted: (id: number) => void
}

/** Transações agrupadas por dia, do mais recente para o mais antigo. */
export function TransactionHistory({ styles, transacoes, onDeleted }: TransactionHistoryProps) {
  const grupos = new Map<string, Transaction[]>()

  transacoes.forEach((transacao) => {
    const chave = chaveData(transacao.data)
    const grupo = grupos.get(chave) ?? []
    grupo.push(transacao)
    grupos.set(chave, grupo)
  })

  const chavesOrdenadas = [...grupos.keys()].sort().reverse()

  return (
    <div className={styles['lista-transacoes']} id="listaTransacoes">
      {chavesOrdenadas.map((chave) => {
        const transacoesDoGrupo = [...(grupos.get(chave) ?? [])].sort(
          (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime(),
        )

        return (
          <div className={styles['grupo-data']} key={chave}>
            <div className={styles['titulo-data']}>
              {tituloDaData(transacoesDoGrupo[0].data)}
            </div>

            {transacoesDoGrupo.map((transacao) => (
              <TransactionRow
                key={transacao.id}
                styles={styles}
                transacao={transacao}
                onDeleted={onDeleted}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}
