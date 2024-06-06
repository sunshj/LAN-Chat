// @ts-check
import { Marked } from 'marked'
import { bundledLanguages } from 'shiki/bundle/web'
import { getHighlighterCore } from 'shiki/core'
import loadWasm from 'shiki/wasm'
import markedShiki from 'marked-shiki'

const formatFileUrl = filename => `/api/download/${filename}`

async function checkFileStatus(file) {
  try {
    const response = await fetch(formatFileUrl(file), {
      method: 'HEAD'
    })
    return {
      file,
      download: response.ok
    }
  } catch {
    return {
      file,
      download: false
    }
  }
}

async function safeMarkdownParse(value) {
  const highlighter = await getHighlighterCore({
    langs: Object.values(bundledLanguages),
    loadWasm
  })

  await highlighter.loadTheme(import('shiki/themes/github-light-default.mjs'))

  const marked = new Marked()

  marked.use(
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
  const html = await marked.parse(value)

  return html
}

onmessage = async event => {
  const { type, payload } = event.data

  if (type === 'check-file') {
    const promises = payload.map(v => checkFileStatus(v))
    const result = await Promise.all(promises)
    postMessage({ type: 'check-file-reply', payload: result })
  }

  if (type === 'markdown-parse') {
    const result = await safeMarkdownParse(payload)
    postMessage({ type: 'markdown-parse-reply', payload: result })
  }
}