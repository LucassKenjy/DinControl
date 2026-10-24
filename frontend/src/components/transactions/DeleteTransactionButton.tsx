import { useState } from 'react'
import { excluirTransacao } from '../../api/transactions'
import { ApiError } from '../../api/client'
import { Modal } from '../ui/Modal'
import modalStyles from '../ui/Modal.module.css'
import { Icone } from '../ui/Icone'

interface DeleteTransactionButtonProps {
  className?: string
  transactionId: number
  /** Resumo da transação mostrado na confirmação. */
  descricao: string
  onDeleted: (id: number) => void
}

export function DeleteTransactionButton({
  className,
  transactionId,
  descricao,
  onDeleted,
}: DeleteTransactionButtonProps) {
  const [confirmando, setConfirmando] = useState(false)
  const [excluindo, setExcluindo] = useState(false)
  const [erro, setErro] = useState('')

  function fechar() {
    setConfirmando(false)
    setErro('')
  }

  async function aoConfirmar() {
    setExcluindo(true)
    setErro('')

    try {
      await excluirTransacao(transactionId)
      setConfirmando(false)
      onDeleted(transactionId)
    } catch (erroRequisicao) {
      console.error('Erro ao excluir transação:', erroRequisicao)
      setErro(
        erroRequisicao instanceof ApiError
          ? erroRequisicao.message
          : 'Erro ao conectar com o servidor.',
      )
    } finally {
      setExcluindo(false)
    }
  }

  return (
    <>
      <button
        type="button"
        className={['botao-icone botao-icone--perigo', className].filter(Boolean).join(' ')}
        aria-label="Excluir transação"
        title="Excluir transação"
        onClick={() => setConfirmando(true)}
      >
        <Icone nome="lixeira" />
      </button>

      {confirmando ? (
        <Modal
          titulo="Excluir transação?"
          textoConfirmar={excluindo ? 'Excluindo...' : 'Excluir'}
          perigo
          confirmarDesabilitado={excluindo}
          onConfirmar={aoConfirmar}
          onCancelar={fechar}
        >
          <p className={modalStyles['texto-modal']}>
            Tem certeza que deseja excluir esta transação? {descricao}
          </p>

          {erro ? <p className={modalStyles['erro-modal']}>{erro}</p> : null}
        </Modal>
      ) : null}
    </>
  )
}
