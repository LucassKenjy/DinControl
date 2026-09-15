import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styles from './Anotacoes.module.css'
import { LayoutAnotacoes } from '../../components/anotacoes/LayoutAnotacoes'
import { IconeLapis, IconeVoltar } from '../../components/anotacoes/Icones'
import { useFeedback } from '../../utils/useFeedback'
import { ApiError } from '../../api/client'
import { atualizarAnotacao, buscarAnotacao } from '../../api/notes'

/** Tempo de espera antes do salvamento automático do conteúdo. */
const ATRASO_AUTOSALVAMENTO = 1500

type Situacao = 'salvo' | 'pendente' | 'salvando' | 'erro'

const TEXTO_SITUACAO: Record<Situacao, string> = {
  salvo: 'Tudo salvo',
  pendente: 'Alterações não salvas',
  salvando: 'Salvando...',
  erro: 'Não foi possível salvar',
}

/**
 * Anotação aberta: título editável e uma única área de texto livre,
 * pautada como o restante do card. O conteúdo é salvo automaticamente
 * pouco depois da digitação parar e também pelo botão "Salvar".
 */
export function NotaPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const notaId = Number(id)

  const { feedback, mostrarSucesso, mostrarErro, mostrarErroApi } = useFeedback()

  const [titulo, setTitulo] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [indisponivel, setIndisponivel] = useState(false)
  const [situacao, setSituacao] = useState<Situacao>('salvo')

  const [editandoTitulo, setEditandoTitulo] = useState(false)
  const [tituloEditado, setTituloEditado] = useState('')

  /** Último conteúdo confirmado pelo servidor. */
  const [conteudoSalvo, setConteudoSalvo] = useState('')

  /** Espelhos usados apenas fora da renderização (salvar ao sair). */
  const refSalvo = useRef('')
  const refAtual = useRef('')

  useEffect(() => {
    refAtual.current = conteudo
  }, [conteudo])

  useEffect(() => {
    refSalvo.current = conteudoSalvo
  }, [conteudoSalvo])

  useEffect(() => {
    let ativo = true

    async function carregar() {
      if (!Number.isInteger(notaId) || notaId <= 0) {
        setIndisponivel(true)
        setCarregando(false)
        return
      }

      try {
        const resultado = await buscarAnotacao(notaId)

        if (!ativo) {
          return
        }

        setTitulo(resultado.anotacao.title)
        setConteudo(resultado.anotacao.content)
        setConteudoSalvo(resultado.anotacao.content)
        refSalvo.current = resultado.anotacao.content
        refAtual.current = resultado.anotacao.content
      } catch (erro) {
        if (!ativo) {
          return
        }

        if (erro instanceof ApiError && erro.status === 401) {
          navigate('/login')
          return
        }

        console.error('Erro ao carregar anotação:', erro)
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
  }, [notaId, navigate])

  const salvarConteudo = useCallback(
    async (texto: string, avisar: boolean) => {
      if (texto === refSalvo.current) {
        return
      }

      setSituacao('salvando')

      try {
        const resultado = await atualizarAnotacao(notaId, { content: texto })

        refSalvo.current = resultado.anotacao.content
        setConteudoSalvo(resultado.anotacao.content)
        setSituacao('salvo')

        if (avisar) {
          mostrarSucesso('Anotação salva com sucesso!')
        }
      } catch (erro) {
        console.error('Erro ao salvar anotação:', erro)
        setSituacao('erro')
        mostrarErroApi(erro, 'Erro ao salvar a anotação.')
      }
    },
    [notaId, mostrarSucesso, mostrarErroApi],
  )

  // Salvamento automático: dispara quando a digitação para.
  useEffect(() => {
    if (carregando || indisponivel) {
      return
    }

    if (conteudo === conteudoSalvo) {
      return
    }

    const timer = setTimeout(() => {
      salvarConteudo(conteudo, false)
    }, ATRASO_AUTOSALVAMENTO)

    return () => clearTimeout(timer)
  }, [conteudo, conteudoSalvo, carregando, indisponivel, salvarConteudo])

  // Salva o que ficou pendente ao sair da página.
  useEffect(() => {
    return () => {
      if (refAtual.current !== refSalvo.current && Number.isInteger(notaId) && notaId > 0) {
        atualizarAnotacao(notaId, { content: refAtual.current }).catch((erro) => {
          console.error('Erro ao salvar anotação ao sair:', erro)
        })
      }
    }
  }, [notaId])

  async function salvarTitulo() {
    const novoTitulo = tituloEditado.trim()

    setEditandoTitulo(false)

    if (!novoTitulo) {
      mostrarErro('O título da anotação não pode ficar vazio.')
      return
    }

    if (novoTitulo === titulo) {
      return
    }

    try {
      const resultado = await atualizarAnotacao(notaId, { title: novoTitulo })
      setTitulo(resultado.anotacao.title)
      mostrarSucesso('Anotação renomeada com sucesso!')
    } catch (erro) {
      console.error('Erro ao renomear anotação:', erro)
      mostrarErroApi(erro, 'Erro ao renomear a anotação.')
    }
  }

  const pendente = conteudo !== conteudoSalvo

  /**
   * "pendente" vem da comparação com o que o servidor confirmou;
   * "salvando"/"erro" vêm da última requisição.
   */
  const situacaoExibida: Situacao =
    situacao === 'salvando' || situacao === 'erro'
      ? situacao
      : pendente
        ? 'pendente'
        : 'salvo'

  return (
    <LayoutAnotacoes feedback={feedback} colunaUnica>
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
              {carregando
                ? 'Carregando...'
                : indisponivel
                  ? 'Anotação não encontrada'
                  : titulo}
            </h1>
          )}

          {!editandoTitulo && !carregando && !indisponivel ? (
            <button
              type="button"
              className={styles['botao-icone']}
              aria-label="Renomear anotação"
              onClick={() => {
                setTituloEditado(titulo)
                setEditandoTitulo(true)
              }}
            >
              <IconeLapis />
            </button>
          ) : null}
        </div>

        {indisponivel ? (
          <p className={styles['mensagem-vazia']}>
            Esta anotação não existe ou não pertence a você.
          </p>
        ) : carregando ? (
          <p className={styles['mensagem-vazia']}>Carregando...</p>
        ) : (
          <>
            <textarea
              className={styles['editor-nota']}
              value={conteudo}
              maxLength={20000}
              placeholder="Escreva aqui..."
              aria-label="Conteúdo da anotação"
              onChange={(evento) => setConteudo(evento.target.value)}
            />

            <div className={styles['rodape-nota']}>
              <span className={styles['situacao-nota']}>{TEXTO_SITUACAO[situacaoExibida]}</span>

              <button
                type="button"
                className={styles['botao-salvar']}
                disabled={!pendente || situacao === 'salvando'}
                onClick={() => salvarConteudo(conteudo, true)}
              >
                Salvar
              </button>
            </div>
          </>
        )}
      </section>
    </LayoutAnotacoes>
  )
}
