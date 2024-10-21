import type { UploadFile, UploadProgressEvent } from 'element-plus'

interface FileUploaderOptions {
  onSuccess?: () => void
}

export function useFileUploader(options: FileUploaderOptions = {}) {
  const appStore = useAppStore()
  const fileStore = useFileStore()
  const { $socket } = useNuxtApp()

  const percentage = ref(0)
  const remainPercent = computed(() => `${100 - percentage.value}%`)

  function onUploadProgress(evt: UploadProgressEvent) {
    percentage.value = Number.parseFloat(evt.percent.toFixed(2))
    if (evt.percent === 100) {
      percentage.value = 0
    }
  }

  async function onUploadSuccess(res: UploadFileResult, file: UploadFile) {
    const { newFilename, mimetype } = res.data
    const type = getMessageType(mimetype!)

    const payload: MessagePayload = {}
    payload.video = type === 'video' ? await getVideoCover(newFilename) : undefined
    payload.audio = type === 'audio' ? await getAudioFileInfo(file.raw!) : undefined
    payload.image = type === 'image' ? await getImageThumbnail(file.raw!) : undefined

    const msg = appStore.addMessage(newFilename, { type, payload })
    fileStore.fileStatus.push({ file: msg.content, download: true })
    $socket.emit('$new-message', msg)

    options.onSuccess?.()
  }

  return {
    percentage,
    remainPercent,
    onUploadProgress,
    onUploadSuccess
  }
}
