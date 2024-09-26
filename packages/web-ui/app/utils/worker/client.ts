import { WorkerEmitter } from './emitter'
import type { ClientEventsMap, WorkerEventsMap } from './types'

export class WorkerClient extends WorkerEmitter<Worker, WorkerEventsMap, ClientEventsMap> {
  constructor(worker: Worker) {
    super(worker)
  }
}
