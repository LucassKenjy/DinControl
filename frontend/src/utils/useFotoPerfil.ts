import { useEffect, useState } from 'react'

const FOTO_PADRAO = '/assets/perfil.png'

/** Lado (px) da foto salva; reduzir evita estourar o limite do localStorage. */
const TAMANHO_FOTO = 256

function chaveFoto(usuarioId: number | null): string | null {
  return usuarioId ? `fotoPerfil_${usuarioId}` : null
}

/** Recorta a imagem em um quadrado central e reduz para TAMANHO_FOTO. */
export function reduzirImagem(arquivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(arquivo)
    const imagem = new Image()

    imagem.onload = () => {
      const lado = Math.min(imagem.width, imagem.height)
      const canvas = document.createElement('canvas')

      canvas.width = TAMANHO_FOTO
      canvas.height = TAMANHO_FOTO

      canvas.getContext('2d')?.drawImage(
        imagem,
        (imagem.width - lado) / 2,
        (imagem.height - lado) / 2,
        lado,
        lado,
        0,
        0,
        TAMANHO_FOTO,
        TAMANHO_FOTO,
      )

      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.88))
    }

    imagem.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Imagem inválida'))
    }

    imagem.src = url
  })
}

export function useFotoPerfil(usuarioId: number | null) {
  const [fotoSrc, setFotoSrc] = useState(FOTO_PADRAO)

  useEffect(() => {
    const chave = chaveFoto(usuarioId)

    if (!chave) {
      setFotoSrc(FOTO_PADRAO)
      return
    }

    const fotoSalva = localStorage.getItem(chave)
    setFotoSrc(fotoSalva || FOTO_PADRAO)
  }, [usuarioId])

  function salvarFoto(dataUrl: string) {
    const chave = chaveFoto(usuarioId)

    if (!chave) {
      return
    }

    localStorage.setItem(chave, dataUrl)
    setFotoSrc(dataUrl)

    // Avisa as outras partes da tela (ex.: o cabeçalho) que a foto mudou
    window.dispatchEvent(new CustomEvent('fotoPerfilAtualizada', { detail: chave }))
  }

  useEffect(() => {
    const chave = chaveFoto(usuarioId)

    function aoAtualizar(evento: Event) {
      if (chave && (evento as CustomEvent<string>).detail === chave) {
        setFotoSrc(localStorage.getItem(chave) || FOTO_PADRAO)
      }
    }

    window.addEventListener('fotoPerfilAtualizada', aoAtualizar)

    return () => window.removeEventListener('fotoPerfilAtualizada', aoAtualizar)
  }, [usuarioId])

  return { fotoSrc, salvarFoto }
}
