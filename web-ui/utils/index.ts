import parser from 'ua-parser-js'
import { type TokensList, marked } from 'marked'
import axios from 'axios'
import type { UploadFileResult } from './types'

export function getDeviceName(ua: string) {
  const { os, browser } = parser(ua)
  const osName = os.name?.replace('macOS', 'Mac').replace('Windows', 'Win') ?? ''
  const version = os.version ?? ''
  const browserName = browser.name

  return `${osName} ${version} ${browserName}`
}

export const formatFileUrl = (filename?: string) => `/api/download/${filename}`

export function randomId(n = 6) {
  return Math.random().toString(32).slice(n)
}

export function getOriginalFilename(filename: string) {
  return filename.slice(filename.indexOf('-') + 1)
}

export function isMarkdownValue(value: string) {
  function containsNonTextTokens(tokens: TokensList) {
    return tokens.some(token => {
      if (token.type !== 'text' && token.type !== 'paragraph') return true
      // @ts-expect-error
      if (token.tokens && containsNonTextTokens(token.tokens)) return true
      return false
    })
  }
  const tokens = marked.lexer(value)
  return containsNonTextTokens(tokens)
}

export async function getMarkdownPlainText(value: string) {
  const htmlString = await marked(value)
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlString, 'text/html')
  const walker = document.createTreeWalker(doc, NodeFilter.SHOW_TEXT)

  const textList = []
  let currentNode = walker.currentNode

  while (currentNode) {
    textList.push(currentNode.textContent)
    currentNode = walker.nextNode()!
  }

  return textList.filter(Boolean).join('')
}

export function downloadFile(url: string, filename: string) {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
}

export async function uploadFile(file: File, onProgress?: (e: any) => void) {
  const formData = new FormData()
  formData.append('file', file)
  const { data: res } = await axios.post<UploadFileResult>('/api/upload', formData, {
    onUploadProgress(e) {
      onProgress?.({ ...e, percent: (e.progress ?? 0) * 100 })
    },
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return res
}

export function getVideoCover(filename: string, sec = 1) {
  return new Promise<{ cover: string }>(resolve => {
    const video = document.createElement('video')
    video.src = formatFileUrl(filename)
    video.addEventListener('loadedmetadata', () => {
      video.currentTime = Math.min(
        Math.max(0, (sec < 0 ? video.duration : 0) + sec),
        video.duration
      )
    })
    video.addEventListener('seeked', () => {
      const canvas = document.createElement('canvas')
      canvas.height = video.videoHeight
      canvas.width = video.videoWidth
      const ctx = canvas.getContext('2d')
      // 压缩
      canvas.height = Math.floor(canvas.height / 2)
      canvas.width = Math.floor(canvas.width / 2)
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(async blob => {
        const file = new File([blob!], `${getOriginalFilename(filename)}-cover.jpg`, {
          type: blob?.type
        })
        const res = await uploadFile(file)
        resolve({ cover: res.data.filename })
      })
    })
  })
}

export async function createAbsoluteUrl(relativePath?: string) {
  if (!relativePath) return ''
  const { data: buffer } = await axios.get(formatFileUrl(relativePath), {
    responseType: 'arraybuffer'
  })

  return URL.createObjectURL(new Blob([buffer]))
}
