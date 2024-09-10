import id3Parser from 'id3-parser'
import { convertFileToBuffer } from 'id3-parser/lib/util'

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
