import { fromHighlighter } from '@shikijs/markdown-it'
import MarkdownIt from 'markdown-it'
import { createHighlighterCore } from 'shiki/core'
import getWasm from 'shiki/wasm'

export default defineNuxtPlugin(async () => {
  const md = MarkdownIt({
    linkify: true
  })

  const highlighter = await createHighlighterCore({
    themes: [import('shiki/themes/github-light-default.mjs')],
    langs: [
      import('shiki/langs/javascript.mjs'),
      import('shiki/langs/typescript.mjs'),
      import('shiki/langs/html.mjs'),
      import('shiki/langs/css.mjs'),
      import('shiki/langs/vue.mjs'),
      import('shiki/langs/bash.mjs'),
      import('shiki/langs/json.mjs'),
      import('shiki/langs/jsx.mjs'),
      import('shiki/langs/tsx.mjs'),
      import('shiki/langs/markdown.mjs')
    ],
    loadWasm: getWasm
  })

  md.use(
    fromHighlighter(highlighter as any, {
      themes: {
        light: 'github-light-default'
      },
      fallbackLanguage: 'markdown'
    })
  )

  return {
    provide: {
      md
    }
  }
})
