import parser from 'ua-parser-js'
import { Marked, marked } from 'marked'
import DOMPurify from 'dompurify'
import * as shiki from 'shiki'
import markedShiki from 'marked-shiki'
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

export async function safeMarkdownParse(value: string) {
  const highlighter = await shiki.getHighlighter({
    langs: ['md', 'js', 'html', 'vue', 'ts', 'vue-html'],
    themes: ['github-light-default']
  })

  const md = new Marked()

  md.use(
    markedShiki({
      highlight(code, lang, props) {
        return highlighter.codeToHtml(code, {
          lang,
          theme: 'github-light-default',
          meta: { __raw: props.join(' '), 'data-lang': lang }
        })
      }
    })
  )
  const html = await md.parse(value)
  return DOMPurify.sanitize(html)
}
