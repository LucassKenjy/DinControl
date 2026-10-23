import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Anotacoes.module.css'
import { LayoutAnotacoes } from '../../components/anotacoes/LayoutAnotacoes'
import { Icone } from '../../components/ui/Icone'
import type { NomeIcone } from '../../components/ui/Icone'
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
  atualizadoEm: string
}

function formatarAtualizacao(data: string): string {
  const momento = new Date(data)

  if (isNaN(momento.getTime())) {
    return ''
  }

  return `Atualizado em ${momento.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })}`
}

interface CardRegistrosProps {
  titulo: string
  icone: NomeIcone
  registros: Registro[]
  mensagemVazia: string
  carregando: boolean
  onAbrir: (id: number) => void
  onExcluir: (registro: Registro) => void
  rotuloExcluir: string
}

function CardRegistros({
  titulo,
  icone,
  registros,
  mensagemVazia,
  carregando,
  onAbrir,
  onExcluir,
  rotuloExcluir,
}: CardRegistrosProps) {
  return (
    <section className={`cartao ${styles.card}`}>
      <div className={styles['cabecalho-card']}>
        <span className={styles['icone-card']}>
          <Icone nome={icone} />
        </span>

        <h2 className={styles['titulo-card']}>{titulo}</h2>

        {!carregando ? <span className={styles.contador}>{registros.length}</span> : null}
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
                <strong>{registro.nome}</strong>
                <small>{formatarAtualizacao(registro.atualizadoEm)}</small>
              </button>

              <div className={styles['acoes-linha']}>
                <button
                  type="button"
                  className="botao-icone botao-icone--perigo"
                  aria-label={`${rotuloExcluir} ${registro.nome}`}
                  title={rotuloExcluir}
                  onClick={() => onExcluir(registro)}
                >
                  <Icone nome="lixeira" />
                </button>
              </div>
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
        titulo="Listas e Anotações"
        subtitulo="Organize suas compras, metas e ideias junto com suas finanças."
        feedback={feedback}
        acoes={
          <button
            type="button"
            className="botao botao--primario"
            onClick={() => {
              setNomeNovo('')
              setErroModal('')
              setEtapa('escolha')
            }}
          >
            <Icone nome="mais" />
            Criar nova
          </button>
        }
      >
        <CardRegistros
          titulo="Listas"
          icone="lista"
          registros={listas.map((lista) => ({
            id: lista.id,
            nome: lista.name,
            atualizadoEm: lista.updated_at,
          }))}
          mensagemVazia="Você ainda não possui listas."
          carregando={carregando}
          rotuloExcluir="Excluir lista"
          onAbrir={(id) => navigate(`/listas/${id}`)}
          onExcluir={(registro) =>
            setExclusao({ tipo: 'lista', id: registro.id, nome: registro.nome })
          }
        />

        <CardRegistros
          titulo="Anotações"
          icone="nota"
          registros={anotacoes.map((nota) => ({
            id: nota.id,
            nome: nota.title,
            atualizadoEm: nota.updated_at,
          }))}
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
            <Icone nome="lista" />
            <span>
              Nova lista
              <small>Itens com marcação de concluído</small>
            </span>
          </button>

          <button
            type="button"
            className={modalStyles['opcao-modal']}
            onClick={() => setEtapa('nota')}
          >
            <Icone nome="nota" />
            <span>
              Nova anotação
              <small>Texto livre, salvo automaticamente</small>
            </span>
          </button>
        </Modal>
      ) : null}

      {etapa === 'lista' || etapa === 'nota' ? (
        <Modal
          titulo={etapa === 'lista' ? 'Nova lista' : 'Nova anotação'}
          textoConfirmar={salvando ? 'Criando...' : 'Criar'}
          confirmarDesabilitado={salvando}
          onConfirmar={confirmarCriacao}
          onCancelar={fecharCriacao}
        >
          <label className={modalStyles['rotulo-modal']} htmlFor="nomeNovoRegistro">
            {etapa === 'lista' ? 'Nome da lista' : 'Título'}
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
              ? 'Excluir lista?'
              : 'Excluir anotação?'
          }
          textoConfirmar={salvando ? 'Excluindo...' : 'Excluir'}
          perigo
          confirmarDesabilitado={salvando}
          onConfirmar={confirmarExclusao}
          onCancelar={() => setExclusao(null)}
        >
          <p className={modalStyles['texto-modal']}>
            {exclusao.tipo === 'lista'
              ? `Tem certeza? "${exclusao.nome}" e todos os seus itens serão excluídos.`
              : `Tem certeza? "${exclusao.nome}" será excluída permanentemente.`}
          </p>
        </Modal>
      ) : null}
    </>
  )
}
