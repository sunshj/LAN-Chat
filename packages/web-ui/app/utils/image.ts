export async function compressImage(file: File, quality = 1) {
  const { promise, resolve } = withResolvers<Blob>()
  const imageBitmap = await createImageBitmap(file)

  const canvas = document.createElement('canvas')
  canvas.width = imageBitmap.width
  canvas.height = imageBitmap.height
  const ctx = canvas.getContext('2d')
  ctx?.drawImage(imageBitmap, 0, 0)

  canvas.toBlob(blob => resolve(blob!), file.type, quality)

  return promise
}

export async function getImageThumbnail(file: File) {
  if (file.size < 1024 * 1024 * 3) return
  const thumbnailName = `${file.name}-thumbnail.jpg`

  const imageBlob = await compressImage(file, 0.1)
  const thumbnailFile = new File([imageBlob], thumbnailName, { type: file.type })
  const res = await uploadFile(thumbnailFile)
  return { thumbnail: res.data.newFilename }
}
