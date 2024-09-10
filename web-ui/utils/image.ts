export async function compressImage(file: File, quality = 1) {
  const imageBitmap = await createImageBitmap(file)

  const canvas = document.createElement('canvas')
  canvas.width = imageBitmap.width
  canvas.height = imageBitmap.height
  const ctx = canvas.getContext('2d')
  ctx?.drawImage(imageBitmap, 0, 0)

  return await new Promise<Blob>(resolve =>
    canvas.toBlob(blob => resolve(blob!), file.type, quality)
  )
}

export async function getImageThumbnail(file: File) {
  if (file.size < 1024 * 1024 * 3) return
  const thumbnailName = `${file.name}-thumbnail.jpg`

  const imageBlob = await compressImage(file, 0.1)
  const thumbnailFile = new File([imageBlob], thumbnailName, { type: file.type })
  const res = await uploadFile(thumbnailFile)
  return { thumbnail: res.data.filename }
}

export function imageDataToBlob(imageData: ImageData) {
  const w = imageData.width
  const h = imageData.height
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx?.putImageData(imageData, 0, 0, w, h, 0, 0)

  return new Promise<Blob>(resolve => {
    canvas.toBlob(blob => resolve(blob!))
  })
}
