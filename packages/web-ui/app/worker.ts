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

async function markdownParser(id: string, value: string) {
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
  const promises = payload.map(({ id, value }) => markdownParser(id, value))
  const data = await Promise.allSettled(promises)

  const result = data.map((item, index) => {
    if (item.status === 'fulfilled') return item.value
    return { ...payload[index]!, error: 'parse markdown failed' }
  })

  worker.emit('parse-markdown-reply', result)
})
