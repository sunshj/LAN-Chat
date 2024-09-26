import { formatFileUrl } from '../utils/shared'
import { WorkerClient } from '../utils/worker'

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

self.addEventListener('message', async event => {
  const { type, payload } = WorkerClient.parse(event)

  if (type === 'check-file') {
    const promises = payload.map(v => checkFileStatus(v))
    const result = await Promise.all(promises)
    self.postMessage(WorkerClient.replyFormat('check-file-reply', result))
  }
})
