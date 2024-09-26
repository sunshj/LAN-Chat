import FileWorker from '../worker?worker'

export default defineNuxtPlugin(() => {
  const worker = new WorkerClient(new FileWorker())

  return {
    provide: {
      worker
    }
  }
})
