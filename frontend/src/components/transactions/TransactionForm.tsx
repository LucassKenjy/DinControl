import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Icone } from '../ui/Icone'
import { Mensagem } from '../ui/Mensagem'
import formStyles from './TransactionForm.module.css'
import { CategorySelector } from './CategorySelector'
import { CustomCategoryInput } from './CustomCategoryInput'
import { CATEGORIAS_ENTRADA, CATEGORIAS_SAIDA, CATEGORIA_PERSONALIZADA } from '../../types/category'
import type { TransactionType } from '../../types/transaction'
import { cadastrarTransacao } from '../../api/transactions'
import { ApiError } from '../../api/client'

interface TransactionFormProps {
  onTransactionCreated: () => void | Promise<void>
}

interface FormState {
  tipo: TransactionType
  valor: string
  categoria: string
  categoriaPersonalizada: string
}

const ESTADO_INICIAL: FormState = {
  tipo: 'ENTRADA',
  valor: '',
  categoria: '',
  categoriaPersonalizada: '',
}

/** Tempo mostrando o sucesso antes de fechar o modal. */
const ATRASO_FECHAR = 700

/** Botão "Nova transação" e o modal de cadastro. */
export function TransactionForm({ onTransactionCreated }: TransactionFormProps) {
  const [aberto, setAberto] = useState(false)
  const [dados, setDados] = useState<FormState>(ESTADO_INICIAL)
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState(false)
  const [salvando, setSalvando] = useState(false)

  function atualizar<K extends keyof FormState>(campo: K, valor: FormState[K]) {
    setDados((estado) => ({ ...estado, [campo]: valor }))
    setMensagem('')
  }

  function trocarTipo(tipo: TransactionType) {
    // As categorias de entrada e saída são diferentes
    setDados((estado) => ({ ...estado, tipo, categoria: '', categoriaPersonalizada: '' }))
    setMensagem('')
  }

  /** Fecha o modal sem criar nem alterar nenhuma transação. */
  function fechar() {
    setAberto(false)
    setDados(ESTADO_INICIAL)
    setMensagem('')
  }

  function abrir() {
    setDados(ESTADO_INICIAL)
    setMensagem('')
    setSalvando(false)
    setAberto(true)
  }

  function mostrarErro(texto: string) {
    setMensagem(texto)
    setErro(true)
  }

  function categoriaResolvida(): string {
    return dados.categoria === CATEGORIA_PERSONALIZADA
      ? dados.categoriaPersonalizada.trim()
      : dados.categoria
  }

  function validar(): string | null {
    const valor = dados.valor.trim()
    const entrada = dados.tipo === 'ENTRADA'

    if (!valor) {
      return `Digite um valor de ${entrada ? 'entrada' : 'saída'}.`
    }

    if (Number(valor) <= 0) {
      return `Digite um valor de ${entrada ? 'entrada' : 'saída'} válido.`
    }

    if (!categoriaResolvida()) {
      return dados.categoria === CATEGORIA_PERSONALIZADA
        ? 'Digite o nome da categoria personalizada.'
        : `Selecione uma categoria para a ${entrada ? 'entrada' : 'saída'}.`
    }

    return null
  }

  async function aoConfirmar() {
    setMensagem('')

    const erroValidacao = validar()

    if (erroValidacao) {
      mostrarErro(erroValidacao)
      return
    }

    setSalvando(true)

    try {
      await cadastrarTransacao({
        tipo: dados.tipo,
        valor: Number(dados.valor.trim()),
        categoria: categoriaResolvida(),
      })

      setMensagem('Transação cadastrada com sucesso!')
      setErro(false)
      await onTransactionCreated()
      setTimeout(fechar, ATRASO_FECHAR)
    } catch (erroRequisicao) {
      console.error('Erro ao cadastrar:', erroRequisicao)
      mostrarErro(
        erroRequisicao instanceof ApiError
          ? erroRequisicao.message
          : 'Erro ao cadastrar transação.',
      )
      setSalvando(false)
    }
  }

  const opcoes = dados.tipo === 'ENTRADA' ? CATEGORIAS_ENTRADA : CATEGORIAS_SAIDA

  return (
    <>
      <button className="botao botao--primario" id="abrirTransacao" type="button" onClick={abrir}>
        <Icone nome="mais" />
        Nova transação
      </button>

      {aberto ? (
        <Modal
          titulo="Nova transação"
          descricao="Registre uma entrada ou uma saída."
          textoConfirmar={salvando ? 'Salvando...' : 'Confirmar'}
          confirmarDesabilitado={salvando}
          onConfirmar={aoConfirmar}
          onCancelar={fechar}
        >
          <form
            onSubmit={(evento) => {
              evento.preventDefault()
              aoConfirmar()
            }}
          >
            <div className={formStyles.segmentado} role="radiogroup" aria-label="Tipo da transação">
              {(['ENTRADA', 'SAIDA'] as const).map((tipo) => (
                <label
                  key={tipo}
                  className={[
                    formStyles.opcao,
                    tipo === 'ENTRADA' ? formStyles.entrada : formStyles.saida,
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    name="tipo"
                    value={tipo}
                    checked={dados.tipo === tipo}
                    onChange={() => trocarTipo(tipo)}
                  />
                  <span>
                    <Icone nome={tipo === 'ENTRADA' ? 'seta-entrada' : 'seta-saida'} />
                    {tipo === 'ENTRADA' ? 'Entrada' : 'Saída'}
                  </span>
                </label>
              ))}
            </div>

            <div className="campo">
              <label htmlFor="valorTransacao" className="campo__rotulo">Valor</label>

              <div className="entrada-grupo">
                <span className="entrada-grupo__prefixo">R$</span>
                <input
                  type="number"
                  id="valorTransacao"
                  className="entrada numero"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  inputMode="decimal"
                  autoFocus
                  value={dados.valor}
                  onChange={(event) => atualizar('valor', event.target.value)}
                />
              </div>
            </div>

            <div className="campo">
              <label htmlFor="categoriaTransacao" className="campo__rotulo">Categoria</label>

              <CategorySelector
                id="categoriaTransacao"
                value={dados.categoria}
                options={opcoes}
                onChange={(valor) => atualizar('categoria', valor)}
              />

              <CustomCategoryInput
                id="categoriaPersonalizada"
                visible={dados.categoria === CATEGORIA_PERSONALIZADA}
                value={dados.categoriaPersonalizada}
                onChange={(valor) => atualizar('categoriaPersonalizada', valor)}
              />
            </div>

            <Mensagem id="mensagemTransacao" texto={mensagem} tipo={erro ? 'erro' : 'sucesso'} />

            {/* Permite confirmar com Enter */}
            <button type="submit" hidden aria-hidden="true" tabIndex={-1} />
          </form>
        </Modal>
      ) : null}
    </>
  )
}
