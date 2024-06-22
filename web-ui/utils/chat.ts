import { type TokensList, marked } from 'marked'
import id3Parser from 'id3-parser'
import { convertFileToBuffer } from 'id3-parser/lib/util'

export function getMessageType(mimetype: string): MessageType {
  if (mimetype.includes('image')) return 'image'
  if (mimetype.includes('video')) return 'video'
  if (mimetype.includes('audio')) return 'audio'
  return 'file'
}

export function isMarkdownValue(value: string) {
  function containsNonTextTokens(tokens: TokensList) {
    return tokens.some(token => {
      if (token.type !== 'text' && token.type !== 'paragraph') return true
      // @ts-expect-error
      if (token.tokens && containsNonTextTokens(token.tokens)) return true
      return false
    })
  }
  const tokens = marked.lexer(value)
  return containsNonTextTokens(tokens)
}

export async function getMarkdownPlainText(value: string) {
  const htmlString = await marked(value)
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlString, 'text/html')
  const walker = document.createTreeWalker(doc, NodeFilter.SHOW_TEXT)

  const textList = []
  let currentNode = walker.currentNode

  while (currentNode) {
    textList.push(currentNode.textContent)
    currentNode = walker.nextNode()!
  }

  return textList.filter(Boolean).join('')
}

export function getVideoCover(filename: string, sec = 1) {
  return new Promise<{ cover: string }>(resolve => {
    const video = document.createElement('video')
    video.src = formatFileUrl(filename)
    video.addEventListener('loadedmetadata', () => {
      video.currentTime = Math.min(
        Math.max(0, (sec < 0 ? video.duration : 0) + sec),
        video.duration
      )
    })
    video.addEventListener('seeked', () => {
      const canvas = document.createElement('canvas')
      canvas.height = video.videoHeight
      canvas.width = video.videoWidth
      const ctx = canvas.getContext('2d')
      // 压缩
      canvas.height = Math.floor(canvas.height / 2)
      canvas.width = Math.floor(canvas.width / 2)
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(async blob => {
        const file = new File([blob!], `${getOriginalFilename(filename)}-cover.jpg`, {
          type: blob?.type
        })
        const res = await uploadFile(file)
        resolve({ cover: res.data.filename })
      })
    })
  })
}

export async function getAudioFileInfo(file: File) {
  const tags = await convertFileToBuffer(file).then(id3Parser)

  if (tags && tags.title) {
    const { title, artist = '' } = tags
    const coverName = `${file?.name}-cover.jpg`
    let picUrl = ''
    if (tags?.image?.data) {
      const blob = new Uint8Array(tags.image.data!)
      const coverFile = new File([blob], coverName, { type: tags.image.type })
      const res = await uploadFile(coverFile)
      picUrl = res.data.filename
    }

    return {
      pic: picUrl,
      title,
      artist
    }
  }

  const filename = file.name.slice(0, file.name.lastIndexOf('.'))
  return {
    pic: '',
    title: filename.includes('-') ? filename.split('-')[1] : filename,
    artist: filename.includes('-') ? filename.split('-')[0] : ''
  }
}

export async function getImageThumbnail(file: File) {
  if (file.size < 1024 * 1024 * 3) return
  const thumbnailName = `${file.name}-thumbnail.jpg`

  const imageBlob = await compressImage(file, 0.1)
  const thumbnailFile = new File([imageBlob], thumbnailName, { type: file.type })
  const res = await uploadFile(thumbnailFile)
  return { thumbnail: res.data.filename }
}
