import { Marked } from 'marked'
import markedShiki from 'marked-shiki'
import { bundledLanguages } from 'shiki/bundle/web'
import { createHighlighterCore } from 'shiki/core'
import githubLightDefaultTheme from 'shiki/themes/github-light-default.mjs'
import loadWasm from 'shiki/wasm'
import { formatFileUrl, WorkerServer } from './utils'

async function markdownParser(id: string, value: string) {
  const highlighter = await createHighlighterCore({
    langs: Object.values(bundledLanguages),
    themes: [githubLightDefaultTheme],
    loadWasm
  })

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

  return {
    id,
    value: html
  }
}

async function checkFileStatus(file: string) {
  try {
    const response = await fetch(formatFileUrl(file), {
      method: 'HEAD'
    })
    return {
      file,
      download: response.ok
    }
  } catch (error) {
    console.error('checkFileStatus error:', error)
    return {
      file,
      download: false
    }
  }
}

const server = new WorkerServer(self)

server.on('check-file', async payload => {
  const promises = payload.map(v => checkFileStatus(v))
  const result = await Promise.all(promises)
  server.emit('check-file-reply', result)
})

server.on('parse-markdown', async payload => {
  const promises = payload.map(({ id, value }) => markdownParser(id, value))
  const data = await Promise.allSettled(promises)

  const result = data.map((item, index) => {
    if (item.status === 'fulfilled') return item.value
    return { ...payload[index], error: '无法解析为 Markdown' }
  })

  server.emit('parse-markdown-reply', result)
})
