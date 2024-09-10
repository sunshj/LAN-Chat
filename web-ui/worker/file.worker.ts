import { createMessage, extractData } from '../utils/worker'
import { formatFileUrl } from '../utils/shared'

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
    console.log('checkFileStatus error:', error)
    return {
      file,
      download: false
    }
  }
}

self.addEventListener('message', async event => {
  const { type, payload } = extractData(event)

  if (type === 'checkFile') {
    const promises = payload.map(v => checkFileStatus(v))
    const result = await Promise.all(promises)
    self.postMessage(createMessage('checkFileReply', result))
  }
})
