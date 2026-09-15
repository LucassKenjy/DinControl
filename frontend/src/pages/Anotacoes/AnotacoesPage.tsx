import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Anotacoes.module.css'
import { LayoutAnotacoes } from '../../components/anotacoes/LayoutAnotacoes'
import { IconeLixeira } from '../../components/anotacoes/Icones'
import { Modal } from '../../components/ui/Modal'
import modalStyles from '../../components/ui/Modal.module.css'
import { useFeedback } from '../../utils/useFeedback'
import { ApiError } from '../../api/client'
import { buscarListas, criarLista, excluirLista } from '../../api/lists'
import { buscarAnotacoes, criarAnotacao, excluirAnotacao } from '../../api/notes'
import type { ListaResumo } from '../../types/list'
import type { AnotacaoResumo } from '../../types/note'

type Etapa = 'escolha' | 'lista' | 'nota'

interface Exclusao {
  tipo: 'lista' | 'nota'
  id: number
  nome: string
}

interface Registro {
  id: number
  nome: string
}

interface CardRegistrosProps {
  titulo: string
  registros: Registro[]
  mensagemVazia: string
  carregando: boolean
  onAbrir: (id: number) => void
  onExcluir: (registro: Registro) => void
  rotuloExcluir: string
}

function CardRegistros({
  titulo,
  registros,
  mensagemVazia,
  carregando,
  onAbrir,
  onExcluir,
  rotuloExcluir,
}: CardRegistrosProps) {
  return (
    <section className={styles.card}>
      <div className={styles['cabecalho-card']}>
        <h1 className={styles['titulo-card']}>{titulo}</h1>
      </div>

      <div className={styles['corpo-card']}>
        {carregando ? (
          <p className={styles['mensagem-vazia']}>Carregando...</p>
        ) : registros.length === 0 ? (
          <p className={styles['mensagem-vazia']}>{mensagemVazia}</p>
        ) : (
          registros.map((registro) => (
            <div key={registro.id} className={styles['linha-registro']}>
              <button
                type="button"
                className={styles['nome-registro']}
                onClick={() => onAbrir(registro.id)}
              >
                {registro.nome}
              </button>

              <button
                type="button"
                className={[styles['botao-icone'], styles.excluir].join(' ')}
                aria-label={`${rotuloExcluir} ${registro.nome}`}
                onClick={() => onExcluir(registro)}
              >
                <IconeLixeira />
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  )
}

/**
 * Visão geral da seção: listas à esquerda, anotações à direita.
 * O "+" desta tela pergunta o que criar antes de pedir o nome.
 */
export function AnotacoesPage() {
  const navigate = useNavigate()
  const { feedback, mostrarSucesso, mostrarErro, mostrarErroApi } = useFeedback()

  const [listas, setListas] = useState<ListaResumo[]>([])
  const [anotacoes, setAnotacoes] = useState<AnotacaoResumo[]>([])
  const [carregando, setCarregando] = useState(true)

  const [etapa, setEtapa] = useState<Etapa | null>(null)
  const [nomeNovo, setNomeNovo] = useState('')
  const [erroModal, setErroModal] = useState('')
  const [salvando, setSalvando] = useState(false)

  const [exclusao, setExclusao] = useState<Exclusao | null>(null)

  useEffect(() => {
    let ativo = true

    async function carregar() {
      try {
        const [listasSalvas, anotacoesSalvas] = await Promise.all([
          buscarListas(),
          buscarAnotacoes(),
        ])

        if (!ativo) {
          return
        }

        setListas(listasSalvas)
        setAnotacoes(anotacoesSalvas)
      } catch (erro) {
        if (!ativo) {
          return
        }

        if (erro instanceof ApiError && erro.status === 401) {
          navigate('/login')
          return
        }

        console.error('Erro ao carregar listas e anotações:', erro)
        mostrarErro('Erro ao carregar listas e anotações.')
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
  }, [navigate, mostrarErro])

  function fecharCriacao() {
    setEtapa(null)
    setNomeNovo('')
    setErroModal('')
  }

  async function confirmarCriacao() {
    const nome = nomeNovo.trim()

    if (!nome) {
      setErroModal(
        etapa === 'lista'
          ? 'Digite o nome da lista.'
          : 'Digite o título da anotação.',
      )
      return
    }

    setSalvando(true)

    try {
      if (etapa === 'lista') {
        const resultado = await criarLista(nome)
        setListas((estado) => [...estado, resultado.lista])
        mostrarSucesso('Lista criada com sucesso!')
      } else {
        const resultado = await criarAnotacao(nome)

        setAnotacoes((estado) => [
          ...estado,
          {
            id: resultado.anotacao.id,
            title: resultado.anotacao.title,
            created_at: resultado.anotacao.created_at,
            updated_at: resultado.anotacao.updated_at,
          },
        ])

        mostrarSucesso('Anotação criada com sucesso!')
      }

      fecharCriacao()
    } catch (erro) {
      console.error('Erro ao criar registro:', erro)
      setErroModal(
        erro instanceof ApiError ? erro.message : 'Erro ao conectar com o servidor.',
      )
    } finally {
      setSalvando(false)
    }
  }

  async function confirmarExclusao() {
    if (!exclusao) {
      return
    }

    setSalvando(true)

    try {
      if (exclusao.tipo === 'lista') {
        await excluirLista(exclusao.id)
        setListas((estado) => estado.filter((lista) => lista.id !== exclusao.id))
        mostrarSucesso('Lista excluída com sucesso!')
      } else {
        await excluirAnotacao(exclusao.id)
        setAnotacoes((estado) => estado.filter((nota) => nota.id !== exclusao.id))
        mostrarSucesso('Anotação excluída com sucesso!')
      }

      setExclusao(null)
    } catch (erro) {
      console.error('Erro ao excluir registro:', erro)
      setExclusao(null)
      mostrarErroApi(erro, 'Erro ao excluir.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <>
      <LayoutAnotacoes
        feedback={feedback}
        acoes={
          <button
            type="button"
            className={styles['botao-acao']}
            aria-label="Criar lista ou anotação"
            onClick={() => {
              setNomeNovo('')
              setErroModal('')
              setEtapa('escolha')
            }}
          >
            +
          </button>
        }
      >
        <CardRegistros
          titulo="Listas:"
          registros={listas.map((lista) => ({ id: lista.id, nome: lista.name }))}
          mensagemVazia="Você ainda não possui listas."
          carregando={carregando}
          rotuloExcluir="Excluir lista"
          onAbrir={(id) => navigate(`/listas/${id}`)}
          onExcluir={(registro) =>
            setExclusao({ tipo: 'lista', id: registro.id, nome: registro.nome })
          }
        />

        <CardRegistros
          titulo="Anotações:"
          registros={anotacoes.map((nota) => ({ id: nota.id, nome: nota.title }))}
          mensagemVazia="Você ainda não possui anotações."
          carregando={carregando}
          rotuloExcluir="Excluir anotação"
          onAbrir={(id) => navigate(`/anotacoes/${id}`)}
          onExcluir={(registro) =>
            setExclusao({ tipo: 'nota', id: registro.id, nome: registro.nome })
          }
        />
      </LayoutAnotacoes>

      {etapa === 'escolha' ? (
        <Modal titulo="O que deseja criar?" onCancelar={fecharCriacao}>
          <button
            type="button"
            className={modalStyles['opcao-modal']}
            onClick={() => setEtapa('lista')}
          >
            Nova Lista
          </button>

          <button
            type="button"
            className={modalStyles['opcao-modal']}
            onClick={() => setEtapa('nota')}
          >
            Nova Anotação
          </button>
        </Modal>
      ) : null}

      {etapa === 'lista' || etapa === 'nota' ? (
        <Modal
          titulo={etapa === 'lista' ? 'Nova Lista' : 'Nova Anotação'}
          textoConfirmar="Criar"
          confirmarDesabilitado={salvando}
          onConfirmar={confirmarCriacao}
          onCancelar={fecharCriacao}
        >
          <label className={modalStyles['rotulo-modal']} htmlFor="nomeNovoRegistro">
            {etapa === 'lista' ? 'Nome da lista:' : 'Título:'}
          </label>

          <input
            id="nomeNovoRegistro"
            className={modalStyles['campo-modal']}
            type="text"
            maxLength={120}
            autoFocus
            value={nomeNovo}
            onChange={(evento) => {
              setNomeNovo(evento.target.value)
              setErroModal('')
            }}
            onKeyDown={(evento) => {
              if (evento.key === 'Enter') {
                confirmarCriacao()
              }
            }}
          />

          {erroModal ? <p className={modalStyles['erro-modal']}>{erroModal}</p> : null}
        </Modal>
      ) : null}

      {exclusao ? (
        <Modal
          titulo={
            exclusao.tipo === 'lista'
              ? 'Tem certeza que deseja excluir esta lista?'
              : 'Tem certeza que deseja excluir esta anotação?'
          }
          textoConfirmar="Excluir"
          perigo
          confirmarDesabilitado={salvando}
          onConfirmar={confirmarExclusao}
          onCancelar={() => setExclusao(null)}
        >
          <p className={modalStyles['texto-modal']}>
            {exclusao.tipo === 'lista'
              ? `"${exclusao.nome}" e todos os seus itens serão excluídos.`
              : `"${exclusao.nome}" será excluída permanentemente.`}
          </p>
        </Modal>
      ) : null}
    </>
  )
}
