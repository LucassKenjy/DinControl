import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styles from './Anotacoes.module.css'
import { LayoutAnotacoes } from '../../components/anotacoes/LayoutAnotacoes'
import {
  IconeCheck,
  IconeLapis,
  IconeLixeira,
  IconeVoltar,
} from '../../components/anotacoes/Icones'
import { Modal } from '../../components/ui/Modal'
import modalStyles from '../../components/ui/Modal.module.css'
import { useFeedback } from '../../utils/useFeedback'
import { ApiError } from '../../api/client'
import {
  atualizarItem,
  buscarLista,
  criarItem,
  excluirItem,
  renomearLista,
} from '../../api/lists'
import type { ItemLista } from '../../types/list'

/**
 * Lista aberta: título editável, itens com check e o "+" criando
 * um novo item dentro desta lista.
 */
export function ListaPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const listaId = Number(id)

  const { feedback, mostrarSucesso, mostrarErro, mostrarErroApi } = useFeedback()

  const [nome, setNome] = useState('')
  const [itens, setItens] = useState<ItemLista[]>([])
  const [carregando, setCarregando] = useState(true)
  const [indisponivel, setIndisponivel] = useState(false)

  const [editandoTitulo, setEditandoTitulo] = useState(false)
  const [tituloEditado, setTituloEditado] = useState('')

  const [itemEditando, setItemEditando] = useState<number | null>(null)
  const [textoEditado, setTextoEditado] = useState('')

  const [criandoItem, setCriandoItem] = useState(false)
  const [textoNovoItem, setTextoNovoItem] = useState('')
  const [erroModal, setErroModal] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    let ativo = true

    async function carregar() {
      if (!Number.isInteger(listaId) || listaId <= 0) {
        setIndisponivel(true)
        setCarregando(false)
        return
      }

      try {
        const resultado = await buscarLista(listaId)

        if (!ativo) {
          return
        }

        setNome(resultado.lista.name)
        setItens(resultado.itens)
      } catch (erro) {
        if (!ativo) {
          return
        }

        if (erro instanceof ApiError && erro.status === 401) {
          navigate('/login')
          return
        }

        console.error('Erro ao carregar lista:', erro)
        setIndisponivel(true)
      } finally {
        if (ativo) {
          setCarregando(false)
        }
      }
    }

    carregar()

    return () => {
      ativo = false
    }
  }, [listaId, navigate])

  async function salvarTitulo() {
    const novoNome = tituloEditado.trim()

    setEditandoTitulo(false)

    if (!novoNome) {
      mostrarErro('O nome da lista não pode ficar vazio.')
      return
    }

    if (novoNome === nome) {
      return
    }

    try {
      const resultado = await renomearLista(listaId, novoNome)
      setNome(resultado.lista.name)
      mostrarSucesso('Lista renomeada com sucesso!')
    } catch (erro) {
      console.error('Erro ao renomear lista:', erro)
      mostrarErroApi(erro, 'Erro ao renomear a lista.')
    }
  }

  async function alternarConcluido(item: ItemLista) {
    const desejado = !item.completed

    setItens((estado) =>
      estado.map((atual) =>
        atual.id === item.id ? { ...atual, completed: desejado } : atual,
      ),
    )

    try {
      await atualizarItem(item.id, { completed: desejado })
    } catch (erro) {
      console.error('Erro ao atualizar item:', erro)

      setItens((estado) =>
        estado.map((atual) =>
          atual.id === item.id ? { ...atual, completed: item.completed } : atual,
        ),
      )

      mostrarErroApi(erro, 'Erro ao atualizar o item.')
    }
  }

  async function salvarTextoItem(item: ItemLista) {
    const novoTexto = textoEditado.trim()

    setItemEditando(null)

    if (!novoTexto) {
      mostrarErro('O nome do item não pode ficar vazio.')
      return
    }

    if (novoTexto === item.text) {
      return
    }

    try {
      const resultado = await atualizarItem(item.id, { text: novoTexto })

      setItens((estado) =>
        estado.map((atual) => (atual.id === item.id ? resultado.item : atual)),
      )

      mostrarSucesso('Item atualizado com sucesso!')
    } catch (erro) {
      console.error('Erro ao atualizar item:', erro)
      mostrarErroApi(erro, 'Erro ao atualizar o item.')
    }
  }

  async function removerItem(item: ItemLista) {
    try {
      await excluirItem(item.id)
      setItens((estado) => estado.filter((atual) => atual.id !== item.id))
      mostrarSucesso('Item excluído com sucesso!')
    } catch (erro) {
      console.error('Erro ao excluir item:', erro)
      mostrarErroApi(erro, 'Erro ao excluir o item.')
    }
  }

  async function confirmarNovoItem() {
    const texto = textoNovoItem.trim()

    if (!texto) {
      setErroModal('Digite o nome do item.')
      return
    }

    setSalvando(true)

    try {
      const resultado = await criarItem(listaId, texto)

      setItens((estado) => [...estado, resultado.item])
      setTextoNovoItem('')
      setErroModal('')
      setCriandoItem(false)
      mostrarSucesso('Item adicionado com sucesso!')
    } catch (erro) {
      console.error('Erro ao adicionar item:', erro)
      setErroModal(
        erro instanceof ApiError ? erro.message : 'Erro ao conectar com o servidor.',
      )
    } finally {
      setSalvando(false)
    }
  }

  return (
    <>
      <LayoutAnotacoes
        feedback={feedback}
        colunaUnica
        acoes={
          indisponivel ? null : (
            <button
              type="button"
              className={styles['botao-acao']}
              aria-label="Adicionar item"
              onClick={() => {
                setTextoNovoItem('')
                setErroModal('')
                setCriandoItem(true)
              }}
            >
              +
            </button>
          )
        }
      >
        <section className={styles.card}>
          <div className={styles['cabecalho-card']}>
            <button
              type="button"
              className={styles['botao-icone']}
              aria-label="Voltar para Listas e Anotações"
              onClick={() => navigate('/anotacoes')}
            >
              <IconeVoltar />
            </button>

            {editandoTitulo ? (
              <input
                className={styles['campo-titulo']}
                type="text"
                maxLength={120}
                autoFocus
                value={tituloEditado}
                onChange={(evento) => setTituloEditado(evento.target.value)}
                onBlur={salvarTitulo}
                onKeyDown={(evento) => {
                  if (evento.key === 'Enter') {
                    evento.currentTarget.blur()
                  }

                  if (evento.key === 'Escape') {
                    setEditandoTitulo(false)
                  }
                }}
              />
            ) : (
              <h1 className={styles['titulo-card']}>
                {carregando ? 'Carregando...' : indisponivel ? 'Lista não encontrada' : nome}
              </h1>
            )}

            {!editandoTitulo && !carregando && !indisponivel ? (
              <button
                type="button"
                className={styles['botao-icone']}
                aria-label="Renomear lista"
                onClick={() => {
                  setTituloEditado(nome)
                  setEditandoTitulo(true)
                }}
              >
                <IconeLapis />
              </button>
            ) : null}
          </div>

          <div className={styles['corpo-card']}>
            {indisponivel ? (
              <p className={styles['mensagem-vazia']}>
                Esta lista não existe ou não pertence a você.
              </p>
            ) : carregando ? (
              <p className={styles['mensagem-vazia']}>Carregando...</p>
            ) : (
              <>
                {itens.length === 0 ? (
                  <p className={styles['mensagem-vazia']}>Adicione seu primeiro item.</p>
                ) : (
                  itens.map((item) => (
                    <div key={item.id} className={styles['linha-registro']}>
                      {itemEditando === item.id ? (
                        <input
                          className={styles['campo-item']}
                          type="text"
                          maxLength={255}
                          autoFocus
                          value={textoEditado}
                          onChange={(evento) => setTextoEditado(evento.target.value)}
                          onBlur={() => salvarTextoItem(item)}
                          onKeyDown={(evento) => {
                            if (evento.key === 'Enter') {
                              evento.currentTarget.blur()
                            }

                            if (evento.key === 'Escape') {
                              setItemEditando(null)
                            }
                          }}
                        />
                      ) : (
                        <span
                          className={[styles['texto-item'], item.completed && styles.concluido]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          {item.text}
                        </span>
                      )}

                      {itemEditando === item.id ? null : (
                        <>
                          <button
                            type="button"
                            className={styles['botao-icone']}
                            aria-label={`Editar ${item.text}`}
                            onClick={() => {
                              setTextoEditado(item.text)
                              setItemEditando(item.id)
                            }}
                          >
                            <IconeLapis />
                          </button>

                          <button
                            type="button"
                            className={[styles['botao-icone'], styles.excluir].join(' ')}
                            aria-label={`Excluir ${item.text}`}
                            onClick={() => removerItem(item)}
                          >
                            <IconeLixeira />
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        className={[
                          styles['botao-icone'],
                          styles.check,
                          item.completed && styles.marcado,
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        aria-label={
                          item.completed
                            ? `Desmarcar ${item.text}`
                            : `Marcar ${item.text} como concluído`
                        }
                        aria-pressed={item.completed}
                        onClick={() => alternarConcluido(item)}
                      >
                        <IconeCheck marcado={item.completed} />
                      </button>
                    </div>
                  ))
                )}

                <div className={styles.pauta}></div>
              </>
            )}
          </div>
        </section>
      </LayoutAnotacoes>

      {criandoItem ? (
        <Modal
          titulo="Adicionar item"
          textoConfirmar="Adicionar"
          confirmarDesabilitado={salvando}
          onConfirmar={confirmarNovoItem}
          onCancelar={() => setCriandoItem(false)}
        >
          <label className={modalStyles['rotulo-modal']} htmlFor="nomeNovoItem">
            Nome do item:
          </label>

          <input
            id="nomeNovoItem"
            className={modalStyles['campo-modal']}
            type="text"
            maxLength={255}
            autoFocus
            value={textoNovoItem}
            onChange={(evento) => {
              setTextoNovoItem(evento.target.value)
              setErroModal('')
            }}
            onKeyDown={(evento) => {
              if (evento.key === 'Enter') {
                confirmarNovoItem()
              }
            }}
          />

          {erroModal ? <p className={modalStyles['erro-modal']}>{erroModal}</p> : null}
        </Modal>
      ) : null}
    </>
  )
}
