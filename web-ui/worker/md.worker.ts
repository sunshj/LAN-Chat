import { Marked } from 'marked'
import { bundledLanguages } from 'shiki/bundle/web'
import githubLightDefaultTheme from 'shiki/themes/github-light-default.mjs'
import { getHighlighterCore } from 'shiki/core'
import loadWasm from 'shiki/wasm'
import markedShiki from 'marked-shiki'

async function markdownParser(value: string) {
  const highlighter = await getHighlighterCore({
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

  return html
}

self.addEventListener('message', async event => {
  const { type, payload } = extractData(event)

  if (type === 'markdownParse') {
    const result = await markdownParser(payload)
    self.postMessage(createMessage('markdownParseReply', result))
  }
})
