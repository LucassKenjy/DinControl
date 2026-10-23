import { useEffect, useMemo, useState } from 'react'
import styles from './HistoricoPage.module.css'
import { AppLayout } from '../../components/layout/AppLayout'
import { LoadingScreen } from '../../components/layout/LoadingScreen'
import { HistoryFilters } from '../../components/transactions/HistoryFilters'
import type { HistoryFiltersValue } from '../../components/transactions/HistoryFilters'
import { TransactionHistory } from '../../components/transactions/TransactionHistory'
import { buscarTransacoes } from '../../api/transactions'
import { formatarMoeda, normalizarTipo } from '../../utils/formatters'
import type { Transaction } from '../../types/transaction'

export function HistoricoPage() {
  const [transacoes, setTransacoes] = useState<Transaction[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erroCarregamento, setErroCarregamento] = useState(false)
  const [filtros, setFiltros] = useState<HistoryFiltersValue>(() => ({
    tipo: 'todos',
    mes: String(new Date().getMonth()),
    categoria: 'todos',
  }))

  useEffect(() => {
    async function carregar() {
      try {
        const resultado = await buscarTransacoes()

        resultado.sort(
          (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime(),
        )

        setTransacoes(resultado)
      } catch (erro) {
        console.error('Erro ao carregar histórico:', erro)
        setErroCarregamento(true)
      } finally {
        setCarregando(false)
      }
    }

    carregar()
  }, [])

  const categoriasDisponiveis = useMemo(() => {
    const categorias = [
      ...new Set(transacoes.map((transacao) => transacao.categoria).filter(Boolean)),
    ]

    categorias.sort()
    return categorias
  }, [transacoes])

  const transacoesFiltradas = useMemo(() => {
    return transacoes.filter((transacao) => {
      const data = new Date(transacao.data)
      const tipoTransacao = normalizarTipo(transacao.tipo)

      if (filtros.tipo !== 'todos' && tipoTransacao !== filtros.tipo) {
        return false
      }

      if (filtros.mes !== 'todos' && data.getMonth() !== Number(filtros.mes)) {
        return false
      }

      if (filtros.categoria !== 'todos' && transacao.categoria !== filtros.categoria) {
        return false
      }

      return true
    })
  }, [transacoes, filtros])

  const resumo = useMemo(() => {
    let entrada = 0
    let saida = 0

    transacoesFiltradas.forEach((transacao) => {
      const valor = Number(transacao.valor)
      const tipo = normalizarTipo(transacao.tipo)

      if (tipo === 'entrada') {
        entrada += valor
      }

      if (tipo === 'saida' || tipo === 'saída') {
        saida += valor
      }
    })

    return { entrada, saida, saldo: entrada - saida }
  }, [transacoesFiltradas])

  function aoExcluir(id: number) {
    setTransacoes((estado) => estado.filter((transacao) => transacao.id !== id))
  }

  const vazio = !erroCarregamento && transacoesFiltradas.length === 0

  return (
    <>
      {carregando ? <LoadingScreen /> : null}

      <AppLayout
        titulo="Histórico"
        subtitulo="Todas as suas movimentações, organizadas por dia."
        acoes={
          <HistoryFilters
            className={styles.filtros}
            valor={filtros}
            categoriasDisponiveis={categoriasDisponiveis}
            onChange={setFiltros}
          />
        }
      >
        <section className={styles.resumo} aria-label="Resumo do período">
          <article className={`cartao ${styles['resumo-box']}`}>
            <span className={styles['resumo-titulo']}>Entrada</span>
            <strong className={`${styles['resumo-valor']} numero texto-entrada`} id="resumoEntrada">
              {formatarMoeda(resumo.entrada)}
            </strong>
          </article>

          <article className={`cartao ${styles['resumo-box']}`}>
            <span className={styles['resumo-titulo']}>Saída</span>
            <strong className={`${styles['resumo-valor']} numero texto-saida`} id="resumoSaida">
              {formatarMoeda(resumo.saida)}
            </strong>
          </article>

          <article className={`cartao ${styles['resumo-box']}`}>
            <span className={styles['resumo-titulo']}>Saldo</span>
            <strong
              className={`${styles['resumo-valor']} numero ${resumo.saldo >= 0 ? 'texto-entrada' : 'texto-saida'}`}
              id="resumoSaldo"
            >
              {formatarMoeda(resumo.saldo)}
            </strong>
          </article>
        </section>

        <section className={`cartao ${styles['card-historico']}`}>
          <div className={styles['cabecalho-tabela']} aria-hidden="true">
            <span>Categoria</span>
            <span>Tipo</span>
            <span>Horário</span>
            <span>Valor</span>
            <span />
          </div>

          {erroCarregamento || vazio ? (
            <div className={styles['sem-transacoes']}>
              <img src="/assets/Coin.png" alt="" className={styles.mascote} />
              <p className={styles['sem-transacoes-titulo']}>
                {erroCarregamento ? 'Erro ao carregar o histórico.' : 'Nenhuma transação encontrada.'}
              </p>
              <p className={styles['sem-transacoes-texto']}>
                {erroCarregamento
                  ? 'Verifique sua conexão e recarregue a página.'
                  : 'Tente mudar os filtros ou registre uma nova transação no início.'}
              </p>
            </div>
          ) : (
            <TransactionHistory styles={styles} transacoes={transacoesFiltradas} onDeleted={aoExcluir} />
          )}
        </section>
      </AppLayout>
    </>
  )
}
