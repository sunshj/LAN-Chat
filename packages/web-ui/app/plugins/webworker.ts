import { WorkerEmitter } from 'worker-emitter'
import FileWorker from '../worker?worker'

export default defineNuxtPlugin(() => {
  const worker = new WorkerEmitter<ClientEventsMap, WorkerEventsMap>(new FileWorker())

  return {
    provide: {
      worker
    }
  }
})
