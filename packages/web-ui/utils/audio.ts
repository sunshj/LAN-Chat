import { parseBlob } from 'music-metadata'

interface AudioInfo {
  title: string
  artist: string
  pic: string
}

export async function getAudioFileInfo(file: File) {
  const { common } = await parseBlob(file)
  const info: AudioInfo = {
    title: '',
    artist: '',
    pic: ''
  }

  const filename = file.name.slice(0, file.name.lastIndexOf('.'))
  const coverName = `${file?.name}-cover.jpg`

  info.title = common.title || filename.includes('-') ? filename.split('-')[1] : filename
  info.artist = common.artist || filename.includes('-') ? filename.split('-')[0] : ''

  if (common.picture && common.picture.length > 0) {
    const [pic] = common.picture
    const coverFile = new File([pic.data], coverName, { type: pic.format })
    const res = await uploadFile(coverFile)
    info.pic = res.data.newFilename
  }

  return info
}
