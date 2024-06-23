self.addEventListener('message', async event => {
  const { type, payload } = extractData(event)

  if (type === 'checkFile') {
    const promises = payload.map(v => checkFileStatus(v))
    const result = await Promise.all(promises)
    self.postMessage(createMessage('checkFileReply', result))
  }
})
