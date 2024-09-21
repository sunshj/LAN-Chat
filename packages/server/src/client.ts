import type { Message } from './types'

export type WebSocketClientToServerMessage = {
  '$user-online': string
  '$get-users': never
  '$new-message': Message
}

export type WebSocketServerToClientMessage = {
  unknown: string
  '$get-users': string[]
  '$new-message': Message
}

export type WebSocketMessageData<T> = {
  [K in keyof T]: {
    type: K
    payload: T[K]
  }
}[keyof T]

export function defineWsMessageHandler<M>() {
  function createWsMessage<T extends M, K extends keyof T = keyof T>(
    ...args: T[K] extends never
      ? Parameters<(type: K) => 0>
      : Parameters<(type: K, payload: T[K]) => 0>
  ) {
    return JSON.stringify(args)
  }

  function parseWsMessage<T = M>(message: any) {
    try {
      const [type, payload] = JSON.parse(message.toString())
      const data = { type, payload }
      return data as WebSocketMessageData<T>
    } catch {
      const data = { type: 'unknown', payload: message.toString() }
      return data as WebSocketMessageData<T>
    }
  }

  return { createWsMessage, parseWsMessage }
}
