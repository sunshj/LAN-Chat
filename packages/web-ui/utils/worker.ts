type EventData = {
  // file
  checkFile: string[]
  checkFileReply: FileStatus[]
  // markdown
  markdownParse: MarkdownParse[]
  markdownParseReply: MarkdownParse[]
}

export type WorkerEventData = {
  [K in keyof EventData]: {
    type: K
    payload: EventData[K]
  }
}[keyof EventData]

/**
 * 提取事件数据(类型安全)
 * @param event
 */
export function extractWorkerData(event: MessageEvent<WorkerEventData>) {
  return event.data
}

/**
 * 创建消息(类型安全)
 * @param type
 * @param payload
 */
export function createWorkerMessage<T extends keyof EventData>(type: T, payload: EventData[T]) {
  return { type, payload }
}
