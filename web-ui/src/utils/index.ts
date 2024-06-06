import parser from 'ua-parser-js'
import { marked } from 'marked'
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
