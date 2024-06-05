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
