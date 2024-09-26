import type { WorkerEmitterTarget, WorkerEventData } from './types'

export class WorkerEmitter<T extends WorkerEmitterTarget, WorkerEvents, ClientEvents> {
  constructor(private target: T) {}

  on<K extends keyof ClientEvents>(name: K, listener: (payload: ClientEvents[K]) => void) {
    const messageHandler = (event: MessageEvent) => {
      const { type, payload } = this.parse<ClientEvents>(event)
      if (type === name) {
        listener(payload as ClientEvents[K])
      }
    }

    this.target.addEventListener('message', messageHandler)

    return () => {
      this.target.removeEventListener('message', messageHandler)
    }
  }

  emit<K extends keyof WorkerEvents>(type: K, payload: WorkerEvents[K]) {
    this.target.postMessage({ type, payload })
  }

  private parse<T>(event: MessageEvent<WorkerEventData<T>>) {
    return event.data
  }
}
