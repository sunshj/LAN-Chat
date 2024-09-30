import MessageEventEmitter from 'mevem'
import FileWorker from '../worker?worker'

export default defineNuxtPlugin(() => {
  const fileWorker = new FileWorker()

  const worker = new MessageEventEmitter<ClientEventsMap, WorkerEventsMap>({
    on: fn => fileWorker.addEventListener('message', fn),
    post: data => fileWorker.postMessage(data),
    deserialize: ({ data }) => data
  })

  return {
    provide: {
      worker
    }
  }
})
