function checkColorDiversity(canvas: HTMLCanvasElement, sampleSize = 300) {
  const colorSet = new Set<string>()

  const { width, height } = canvas
  const ctx = canvas.getContext('2d')
  const imageData = ctx!.getImageData(0, 0, width, height)
  const data = imageData.data

  let i = 0
  while (i < sampleSize) {
    const x = Math.floor(Math.random() * width)
    const y = Math.floor(Math.random() * height)
    const index = (y * width + x) * 4

    const r = data[index]
    const g = data[index + 1]
    const b = data[index + 2]

    colorSet.add(`${r},${g},${b}`)

    i++
  }
  return colorSet.size >= 2
}

function getVideoCoverOfSeconds(video: HTMLVideoElement, seconds: number = 1) {
  return new Promise<HTMLCanvasElement>(resolve => {
    video.addEventListener('loadedmetadata', () => {
      video.currentTime = Math.min(Math.floor(video.duration), seconds)

      video.addEventListener('seeked', () => {
        console.log('seeked:', seconds, video.currentTime)
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')!
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        /**
         * devOnly
         
        const screenshotUrl = canvas.toDataURL('image/png')
        const img = document.createElement('img')
        img.src = screenshotUrl
        img.width = 200
        img.border = '1px solid #ccc'
        document.querySelector('#screenshot')!.append(img)
        */
        resolve(canvas)
      })
    })
  })
}

const videoTimeMap = new Map<string, number>()

/**
 * 获取视频封面
 * 如果获取到封面色彩数过低，则向后移动一秒并重新获取封面，直到获取到色彩数较高的封面
 * @param videoUrl 视频地址
 * @param retryTimes 重试次数
 */
async function getColorfulVideoCover(
  videoUrl: string,
  retryTimes = 15
): Promise<HTMLCanvasElement> {
  const video = document.createElement('video')
  video.src = videoUrl

  const getSeconds = () => videoTimeMap.get(videoUrl) ?? 1

  const canvas = await getVideoCoverOfSeconds(video, getSeconds())

  const isColorful = checkColorDiversity(canvas)
  if (!isColorful && retryTimes > 0) {
    videoTimeMap.set(videoUrl, getSeconds() + 3)

    return getColorfulVideoCover(videoUrl, retryTimes - 1).finally(() => {
      videoTimeMap.delete(videoUrl)
    })
  } else {
    videoTimeMap.delete(videoUrl)
    return canvas
  }
}

export async function getVideoCover(filename: string) {
  const videoUrl = formatFileUrl(filename)
  const canvas = await getColorfulVideoCover(videoUrl)

  return new Promise<{ cover: string }>(resolve => {
    canvas.toBlob(async blob => {
      const file = new File([blob!], `${getOriginalFilename(filename)}-cover.jpg`, {
        type: blob!.type
      })
      const res = await uploadFile(file)
      resolve({ cover: res.data.filename })
    })
  })
}
