export type WorkerEventsMap = {
  'check-file': string[]
  'parse-markdown': ParsedMarkdown[]
}

export type ClientEventsMap = {
  'check-file-reply': FileStatus[]
  'parse-markdown-reply': ParsedMarkdown[]
}

export type WorkerEventData<T> = {
  [K in keyof T]: { type: K; payload: T[K] }
}[keyof T]

export interface WorkerEmitterTarget {
  addEventListener: (name: string, listener: (event: MessageEvent) => void) => void
  removeEventListener: (name: string, listener: (event: MessageEvent) => void) => void
  postMessage: (message: any) => void
}
