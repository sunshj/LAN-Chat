import { Marked } from 'marked'
import markedShiki from 'marked-shiki'
import { bundledLanguages } from 'shiki/bundle/web'
import { createHighlighterCore } from 'shiki/core'
import githubLightDefaultTheme from 'shiki/themes/github-light-default.mjs'
import loadWasm from 'shiki/wasm'
import { WorkerClient } from '../utils/worker'

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

self.addEventListener('message', async event => {
  const { type, payload } = WorkerClient.parse(event)

  if (type === 'parse-markdown') {
    const promises = payload.map(({ id, value }) => markdownParser(id, value))
    const data = await Promise.allSettled(promises)

    const result = data.map((item, index) => {
      if (item.status === 'fulfilled') return item.value
      return { ...payload[index], error: '无法解析为 Markdown' }
    })

    self.postMessage(WorkerClient.replyFormat('parse-markdown-reply', result))
  }
})
