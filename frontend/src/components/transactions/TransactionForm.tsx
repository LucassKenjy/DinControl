import { useState } from 'react'
import { Modal } from '../ui/Modal'
import modalStyles from '../ui/Modal.module.css'
import formStyles from './TransactionForm.module.css'
import { CategorySelector } from './CategorySelector'
import { CustomCategoryInput } from './CustomCategoryInput'
import { CATEGORIAS_ENTRADA, CATEGORIAS_SAIDA, CATEGORIA_PERSONALIZADA } from '../../types/category'
import { cadastrarTransacao } from '../../api/transactions'
import { ApiError } from '../../api/client'

interface TransactionFormProps {
  styles: Record<string, string>
  onTransactionCreated: () => void | Promise<void>
}

interface FormState {
  valorEntrada: string
  valorSaida: string
  categoriaEntrada: string
  categoriaSaida: string
  categoriaEntradaPersonalizada: string
  categoriaSaidaPersonalizada: string
}

const ESTADO_INICIAL: FormState = {
  valorEntrada: '',
  valorSaida: '',
  categoriaEntrada: '',
  categoriaSaida: '',
  categoriaEntradaPersonalizada: '',
  categoriaSaidaPersonalizada: '',
}

export function TransactionForm({ styles, onTransactionCreated }: TransactionFormProps) {
  const [aberto, setAberto] = useState(false)
  const [dados, setDados] = useState<FormState>(ESTADO_INICIAL)
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState<boolean | null>(null)

  function atualizar<K extends keyof FormState>(campo: K, valor: FormState[K]) {
    setDados((estado) => ({ ...estado, [campo]: valor }))
  }

  function limparMensagem() {
    setMensagem('')
    setErro(null)
  }

  /** Fecha o modal sem criar nem alterar nenhuma transação. */
  function fechar() {
    setAberto(false)
    setDados(ESTADO_INICIAL)
    limparMensagem()
  }

  function abrir() {
    setDados(ESTADO_INICIAL)
    limparMensagem()
    setAberto(true)
  }

  function mostrarErro(texto: string) {
    setMensagem(texto)
    setErro(true)
  }

  function mostrarSucesso(texto: string) {
    setMensagem(texto)
    setErro(false)
  }

  function categoriaResolvida(selecionada: string, personalizada: string): string {
    return selecionada === CATEGORIA_PERSONALIZADA ? personalizada.trim() : selecionada
  }

  function validar(): string | null {
    const entrada = dados.valorEntrada.trim()
    const saida = dados.valorSaida.trim()
    const categoriaEntrada = categoriaResolvida(dados.categoriaEntrada, dados.categoriaEntradaPersonalizada)
    const categoriaSaida = categoriaResolvida(dados.categoriaSaida, dados.categoriaSaidaPersonalizada)

    if (!entrada && !saida) {
      return 'Digite um valor de entrada ou saída.'
    }

    if (entrada && saida) {
      return 'Preencha apenas entrada ou saída.'
    }

    if (entrada && Number(entrada) <= 0) {
      return 'Digite um valor de entrada válido.'
    }

    if (saida && Number(saida) <= 0) {
      return 'Digite um valor de saída válido.'
    }

    if (entrada && !categoriaEntrada) {
      return dados.categoriaEntrada === CATEGORIA_PERSONALIZADA
        ? 'Digite o nome da categoria personalizada.'
        : 'Selecione uma categoria para a entrada.'
    }

    if (saida && !categoriaSaida) {
      return dados.categoriaSaida === CATEGORIA_PERSONALIZADA
        ? 'Digite o nome da categoria personalizada.'
        : 'Selecione uma categoria para a saída.'
    }

    return null
  }

  async function aoConfirmar() {
    limparMensagem()

    const erroValidacao = validar()

    if (erroValidacao) {
      mostrarErro(erroValidacao)
      return
    }

    const entrada = dados.valorEntrada.trim()
    const saida = dados.valorSaida.trim()

    try {
      if (entrada) {
        await cadastrarTransacao({
          tipo: 'ENTRADA',
          valor: Number(entrada),
          categoria: categoriaResolvida(dados.categoriaEntrada, dados.categoriaEntradaPersonalizada),
        })
      }

      if (saida) {
        await cadastrarTransacao({
          tipo: 'SAIDA',
          valor: Number(saida),
          categoria: categoriaResolvida(dados.categoriaSaida, dados.categoriaSaidaPersonalizada),
        })
      }

      mostrarSucesso('Transação cadastrada com sucesso!')
      setDados(ESTADO_INICIAL)
      await onTransactionCreated()
    } catch (erroRequisicao) {
      console.error('Erro ao cadastrar:', erroRequisicao)
      mostrarErro(
        erroRequisicao instanceof ApiError
          ? erroRequisicao.message
          : 'Erro ao cadastrar transação.',
      )
    }
  }

  return (
    <>
      <button
        className={styles['botao-adicionar']}
        id="abrirTransacao"
        type="button"
        onClick={() => (aberto ? fechar() : abrir())}
      >
        +
      </button>

      {aberto ? (
        <Modal
          titulo="Nova Transação"
          textoConfirmar="CONFIRMAR"
          textoCancelar="Cancelar"
          onConfirmar={aoConfirmar}
          onCancelar={fechar}
        >
          <div className={formStyles['linha-transacao']}>
            <span className={[formStyles.bolinha, formStyles['entrada-cor']].join(' ')}></span>
            <span className={formStyles.cifrao}>R$:</span>

            <input
              type="number"
              id="valorEntrada"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={dados.valorEntrada}
              onChange={(event) => atualizar('valorEntrada', event.target.value)}
            />

            <CategorySelector
              id="categoriaEntrada"
              value={dados.categoriaEntrada}
              options={CATEGORIAS_ENTRADA}
              onChange={(valor) => atualizar('categoriaEntrada', valor)}
            />
          </div>

          <CustomCategoryInput
            id="categoriaEntradaPersonalizada"
            className={formStyles['campo-categoria-personalizada']}
            visible={dados.categoriaEntrada === CATEGORIA_PERSONALIZADA}
            value={dados.categoriaEntradaPersonalizada}
            onChange={(valor) => atualizar('categoriaEntradaPersonalizada', valor)}
          />

          <div className={formStyles['linha-transacao']}>
            <span className={[formStyles.bolinha, formStyles['saida-cor']].join(' ')}></span>
            <span className={formStyles.cifrao}>R$:</span>

            <input
              type="number"
              id="valorSaida"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={dados.valorSaida}
              onChange={(event) => atualizar('valorSaida', event.target.value)}
            />

            <CategorySelector
              id="categoriaSaida"
              value={dados.categoriaSaida}
              options={CATEGORIAS_SAIDA}
              onChange={(valor) => atualizar('categoriaSaida', valor)}
            />
          </div>

          <CustomCategoryInput
            id="categoriaSaidaPersonalizada"
            className={formStyles['campo-categoria-personalizada']}
            visible={dados.categoriaSaida === CATEGORIA_PERSONALIZADA}
            value={dados.categoriaSaidaPersonalizada}
            onChange={(valor) => atualizar('categoriaSaidaPersonalizada', valor)}
          />

          {mensagem ? (
            <p
              id="mensagemTransacao"
              className={[
                formStyles['mensagem-transacao'],
                erro === true && modalStyles['erro-modal'],
                erro === false && formStyles['mensagem-sucesso'],
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {mensagem}
            </p>
          ) : null}
        </Modal>
      ) : null}
    </>
  )
}
