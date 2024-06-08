import parser from 'ua-parser-js'
import { marked } from 'marked'
import id3Parser from 'id3-parser'
import { convertFileToBuffer } from 'id3-parser/lib/util'
import type { Socket } from 'socket.io-client'

export const socketKey = Symbol('socket') as InjectionKey<Socket>

export function getDeviceName(ua: string) {
  const { os, browser } = parser(ua)
  const osName = os.name?.replace('macOS', 'Mac').replace('Windows', 'Win') ?? ''
  const version = os.version ?? ''
  const browserName = browser.name

  return `${osName} ${version} ${browserName}`
}

export const formatFileUrl = (filename: string) => `/api/download/${filename}`

export function randomId(n = 6) {
  return Math.random().toString(32).slice(n)
}

export function getOriginalFilename(filename: string) {
  return filename.slice(filename.indexOf('-') + 1)
}

export function isMarkdownValue(value: string) {
  const tokenTypes: string[] = []

  marked(value, {
    walkTokens: token => {
      tokenTypes.push(token.type)
    }
  })

  const isMarkdown = [
    'space',
    'code',
    'fences',
    'heading',
    'hr',
    'link',
    'blockquote',
    'list',
    'html',
    'def',
    'table',
    'lheading',
    'escape',
    'tag',
    'reflink',
    'strong',
    'codespan',
    'url'
  ].some(tokenType => tokenTypes.includes(tokenType))

  return isMarkdown
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

export function getVideoCover(url: string, sec = 1) {
  return new Promise<string>((resolve, reject) => {
    const video = document.createElement('video')
    video.src = url
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
      resolve(canvas.toDataURL())
    })
    video.addEventListener('error', error => {
      reject(error)
    })
  })
}

function arrayBufferToBase64(arrayBuffer?: ArrayLike<number>) {
  if (!arrayBuffer) return ''
  let data = ''
  const bytes = new Uint8Array(arrayBuffer)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    data += String.fromCharCode(bytes[i])
  }
  return window.btoa(data)
}

export function base64ToBinary(base64?: string) {
  const binary = atob(base64 ?? '')
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new Blob([bytes])
}

export async function getAudioFileInfo(file: File) {
  const tags = await convertFileToBuffer(file).then(id3Parser)

  if (tags && tags.title) {
    const title = tags.title ?? ''
    const artist = tags.artist ?? ''
    return {
      pic: arrayBufferToBase64(tags?.image?.data),
      title,
      artist
    }
  }

  const filename = file.name.slice(0, file.name.lastIndexOf('.'))
  return {
    pic: '',
    title: filename.includes('-') ? filename.split('-')[1] : filename,
    artist: filename.includes('-') ? filename.split('-')[0] : ''
  }
}

export function compressImageFile(file: File, quality = 0.25) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.addEventListener('load', event => {
      const image = new Image()

      image.addEventListener('load', () => {
        const canvas = document.createElement('canvas')
        canvas.width = Math.floor(image.width * quality)
        canvas.height = Math.floor(image.height * quality)
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(image, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL())
      })

      image.addEventListener('error', error => {
        reject(error)
      })
      image.src = event?.target?.result as string
    })

    reader.readAsDataURL(file)
  })
}
