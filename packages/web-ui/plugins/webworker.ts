import FileWorker from '@/worker/file.worker?worker'
import MdWorker from '@/worker/md.worker?worker'

export default defineNuxtPlugin(() => {
  const fileWorker = new WorkerClient(new FileWorker())
  const mdWorker = new WorkerClient(new MdWorker())

  return {
    provide: {
      fileWorker,
      mdWorker
    }
  }
})
