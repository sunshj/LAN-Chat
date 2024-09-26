import { WorkerEmitter } from './emitter'
import type { ClientEventsMap, WorkerEventsMap } from './types'

export class WorkerServer extends WorkerEmitter<
  typeof globalThis,
  ClientEventsMap,
  WorkerEventsMap
> {
  constructor(self: typeof globalThis) {
    super(self)
  }
}
