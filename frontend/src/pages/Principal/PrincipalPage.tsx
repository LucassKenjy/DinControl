import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './PrincipalPage.module.css'
import { AppLayout } from '../../components/layout/AppLayout'
import { LoadingScreen } from '../../components/layout/LoadingScreen'
import { Icone } from '../../components/ui/Icone'
import type { NomeIcone } from '../../components/ui/Icone'
import { TransactionForm } from '../../components/transactions/TransactionForm'
import { BalanceCard } from '../../components/transactions/BalanceCard'
import { MonthlyChart } from '../../components/transactions/charts/MonthlyChart'
import { ExpenseChart } from '../../components/transactions/charts/ExpenseChart'
import { InvestmentChart } from '../../components/transactions/charts/InvestmentChart'
import { useAuth } from '../../context/AuthContext'
import { buscarTransacoes } from '../../api/transactions'
import { calcularTotais } from '../../utils/totals'
import { formatarMoeda } from '../../utils/formatters'
import { formatarCategoria } from '../../types/category'
import type { Transaction } from '../../types/transaction'

const QUANTIDADE_ULTIMAS = 5

function primeiroNome(nome: string | undefined): string {
  return String(nome || '').trim().split(/\s+/)[0] || ''
}

function dataDeHoje(): string {
  const texto = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

interface IndicadorProps {
  rotulo: string
  valor: number
  icone: NomeIcone
  variante: 'entrada' | 'saida' | 'investimento'
  id: string
}

function Indicador({ rotulo, valor, icone, variante, id }: IndicadorProps) {
  return (
    <article className={`cartao ${styles.indicador}`}>
      <span className={`${styles['indicador-icone']} ${styles[variante]}`}>
        <Icone nome={icone} />
      </span>

      <div>
        <p className={styles['indicador-rotulo']}>{rotulo}</p>
        <p className={`${styles['indicador-valor']} numero`} id={id}>
          {formatarMoeda(valor)}
        </p>
      </div>
    </article>
  )
}

export function PrincipalPage() {
  const { usuario } = useAuth()

  const [transacoes, setTransacoes] = useState<Transaction[]>([])
  const [carregando, setCarregando] = useState(true)

  const carregarDashboard = useCallback(async () => {
    try {
      const resultado = await buscarTransacoes()
      setTransacoes(resultado)
    } catch (erro) {
      console.error('Erro ao carregar dashboard:', erro)
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregarDashboard()
  }, [carregarDashboard])

  const { entradas, saidas, investimentos } = calcularTotais(transacoes)
  const saldo = entradas - saidas

  const ultimas = useMemo(
    () =>
      [...transacoes]
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
        .slice(0, QUANTIDADE_ULTIMAS),
    [transacoes],
  )

  const nome = primeiroNome(usuario?.nome)

  return (
    <>
      {carregando ? <LoadingScreen /> : null}

      <AppLayout
        titulo={nome ? `Olá, ${nome}` : 'Olá!'}
        subtitulo={`${dataDeHoje()} · Resumo das suas finanças`}
        acoes={<TransactionForm onTransactionCreated={carregarDashboard} />}
      >
        <div className={styles.grade}>
          <BalanceCard className={styles['area-saldo']} saldo={saldo} negativo={saidas > entradas} />

          <section className={styles['area-resumo']} aria-label="Entrada e saída">
            <Indicador id="totalEntrada" rotulo="Entradas" valor={entradas} icone="seta-entrada" variante="entrada" />
            <Indicador id="totalSaida" rotulo="Saídas" valor={saidas} icone="seta-saida" variante="saida" />
            <Indicador
              id="totalInvestimento"
              rotulo="Investimentos"
              valor={investimentos}
              icone="cofrinho"
              variante="investimento"
            />
          </section>

          <section className={`cartao ${styles['area-mensal']}`}>
            <div className="cartao__cabecalho">
              <div>
                <h2 className="cartao__titulo">Gráfico mensal</h2>
                <p className="cartao__descricao">Entradas e saídas por mês em {new Date().getFullYear()}</p>
              </div>

              <div className={styles.legenda}>
                <span><span className="ponto texto-entrada" />Entrada</span>
                <span><span className="ponto texto-saida" />Saída</span>
              </div>
            </div>

            <div className={styles.barras}>
              <MonthlyChart transacoes={transacoes} />
            </div>
          </section>

          <section className={`cartao ${styles['area-saida']}`}>
            <div className="cartao__cabecalho">
              <div>
                <h2 className="cartao__titulo">Gráfico de saída</h2>
                <p className="cartao__descricao">Gastos por categoria</p>
              </div>
            </div>

            <ExpenseChart transacoes={transacoes} />
          </section>

          <section className={`cartao ${styles['area-investimento']}`}>
            <div className="cartao__cabecalho">
              <div>
                <h2 className="cartao__titulo">Investimento</h2>
                <p className="cartao__descricao">Valor investido por mês em {new Date().getFullYear()}</p>
              </div>
            </div>

            <div className={styles.barras}>
              <InvestmentChart transacoes={transacoes} />
            </div>
          </section>

          <section className={`cartao ${styles['area-ultimas']}`}>
            <div className="cartao__cabecalho">
              <div>
                <h2 className="cartao__titulo">Últimas transações</h2>
                <p className="cartao__descricao">Movimentações mais recentes</p>
              </div>

              <Link to="/historico" className={styles['ver-tudo']}>
                Ver tudo
                <Icone nome="seta-direita" />
              </Link>
            </div>

            {ultimas.length === 0 ? (
              <p className={styles.vazio}>
                Nenhuma transação ainda. Clique em <strong>Nova transação</strong> para começar.
              </p>
            ) : (
              <ul className={styles.lista}>
                {ultimas.map((transacao) => {
                  const entrada = transacao.tipo === 'ENTRADA'

                  return (
                    <li key={transacao.id}>
                      <span className={`${styles['lista-icone']} ${entrada ? styles.entrada : styles.saida}`}>
                        <Icone nome={entrada ? 'seta-entrada' : 'seta-saida'} />
                      </span>

                      <div className={styles['lista-texto']}>
                        <p className={styles['lista-categoria']}>{formatarCategoria(transacao.categoria)}</p>
                        <p className={styles['lista-data']}>
                          {new Date(transacao.data).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      <span className={`${styles['lista-valor']} numero ${entrada ? 'texto-entrada' : 'texto-saida'}`}>
                        {entrada ? '+' : '-'} {formatarMoeda(transacao.valor)}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>
      </AppLayout>
    </>
  )
}
