export type WorkerEventsMap = {
  'check-file': string[]
  'parse-markdown': ParsedMarkdown[]
}

export type ReplyEventsMap = {
  'check-file-reply': FileStatus[]
  'parse-markdown-reply': ParsedMarkdown[]
}

export type WorkerEventData<T> = {
  [K in keyof T]: { type: K; payload: T[K] }
}[keyof T]

export class WorkerClient<WorkerEvents = WorkerEventsMap, ReplyEvents = ReplyEventsMap> {
  constructor(public worker: Worker) {}

  /**
   * Handle worker event
   * @param name event name
   * @param listener event listener
   * @return remove listener function
   */
  handle<K extends keyof ReplyEvents>(name: K, listener: (payload: ReplyEvents[K]) => void) {
    const messageHandler = (event: MessageEvent) => {
      const { type, payload } = WorkerClient.parse<ReplyEvents>(event)
      if (type === name) {
        listener(payload as ReplyEvents[K])
      }
    }

    this.worker.addEventListener('message', messageHandler)

    return () => {
      this.worker.removeEventListener('message', messageHandler)
    }
  }

  /**
   *  Invoke worker event
   * @param type  event type
   * @param payload  event payload
   */
  invoke<K extends keyof WorkerEvents>(type: K, payload: WorkerEvents[K]) {
    this.worker.postMessage({ type, payload })
  }

  static parse<T = WorkerEventsMap>(event: MessageEvent<WorkerEventData<T>>) {
    return event.data
  }

  static replyFormat<K extends keyof ReplyEventsMap>(type: K, payload: ReplyEventsMap[K]) {
    return { type, payload }
  }
}
