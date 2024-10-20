import axios from 'axios'
import parser from 'ua-parser-js'

export const GROUP_CHAT_ID = 'group'

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
  filename = decodeURIComponent(filename)
  return filename.slice(filename.indexOf('-') + 1)
}

export function getFileExtension(filename: string) {
  return filename.slice(filename.lastIndexOf('.') + 1)
}

export async function readFileContent(url: string) {
  return await fetch(url).then(res => res.text())
}

export function getMessageType(mimetype: string): MessageType {
  if (mimetype.includes('image')) return 'image'
  if (mimetype.includes('video')) return 'video'
  if (mimetype.includes('audio')) return 'audio'
  return 'file'
}

export function downloadFile(url: string, filename: string) {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
}

export function downloadMsgFile(msg: Message) {
  const url = formatFileUrl(msg.content)
  const filename = getOriginalFilename(msg.content)
  downloadFile(url, filename)
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

export function unique<T, K extends keyof T>(array: T[], getKey?: K | ((item: T) => T[K])) {
  const result: T[] = []
  const keys = new Set()

  array.forEach(item => {
    const key = getKey ? (typeof getKey === 'function' ? getKey(item) : item[getKey]) : item
    if (!keys.has(key)) {
      keys.add(key)
      result.push(item)
    }
  })

  return result
}

export function withResolvers<T>() {
  let resolve: (value: T) => void
  let reject: (reason?: any) => void

  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve
    reject = _reject
  })

  return {
    promise,
    resolve: resolve!,
    reject: reject!
  }
}
