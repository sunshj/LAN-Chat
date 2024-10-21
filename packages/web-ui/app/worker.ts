import { Marked } from 'marked'
import markedShiki from 'marked-shiki'
import MessageEventEmitter from 'mevem'
import { bundledLanguages, getSingletonHighlighter } from 'shiki'
import { formatFileUrl } from './utils'
import type { ClientEventsMap, WorkerEventsMap } from './utils/types'

const marked = new Marked()

getSingletonHighlighter({
  langs: Object.values(bundledLanguages),
  themes: ['github-light-default']
}).then(highlighter => {
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
})

async function parseMarkdown(md: ParsedMarkdown): Promise<ParsedMarkdown> {
  const { id, value } = md
  try {
    const html = await marked.parse(value)
    return { id, value: html }
  } catch {
    return {
      id,
      value,
      error: 'parse markdown failed'
    }
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

const worker = new MessageEventEmitter<WorkerEventsMap, ClientEventsMap>({
  on: fn => self.addEventListener('message', fn),
  post: data => self.postMessage(data),
  deserialize: ({ data }) => data
})

worker.on('check-file', async payload => {
  const promises = payload.map(v => checkFileStatus(v))
  const result = await Promise.all(promises)
  worker.emit('check-file-reply', result)
})

worker.on('parse-markdown', async payload => {
  const result = await parseMarkdown(payload)

  worker.emit('parse-markdown-reply', result)
})
