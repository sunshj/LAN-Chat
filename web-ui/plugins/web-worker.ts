import FileWorker from '@/worker/file.worker?worker'
import MdWorker from '@/worker/md.worker?worker'

export default defineNuxtPlugin(() => {
  const fileWorker = new FileWorker()
  const mdWorker = new MdWorker()

  return {
    provide: {
      fileWorker,
      mdWorker
    }
  }
})
