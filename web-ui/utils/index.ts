import axios from 'axios'
import parser from 'ua-parser-js'

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

export function getFileExtension(filename: string) {
  return filename.slice(filename.lastIndexOf('.') + 1)
}

export function getFileContent(url: string) {
  return fetch(url).then(res => res.text())
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

export async function createAbsoluteUrl(relativePath?: string) {
  if (!relativePath) return ''
  try {
    const { data: buffer } = await axios.get(formatFileUrl(relativePath), {
      responseType: 'arraybuffer'
    })
    return URL.createObjectURL(new Blob([buffer]))
  } catch {
    return ''
  }
}

export async function compressImage(file: File, quality = 1) {
  const imageBitmap = await createImageBitmap(file)

  const canvas = document.createElement('canvas')
  canvas.width = imageBitmap.width
  canvas.height = imageBitmap.height
  const ctx = canvas.getContext('2d')
  ctx?.drawImage(imageBitmap, 0, 0)

  return await new Promise<Blob>(resolve =>
    canvas.toBlob(blob => resolve(blob!), file.type, quality)
  )
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
