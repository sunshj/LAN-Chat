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

export function defineWsMessageHandler<ServerMessage, ClientMessage>() {
  function createWsMessage<T extends ServerMessage, K extends keyof T = keyof T>(
    ...args: T[K] extends never
      ? Parameters<(type: K) => 0>
      : Parameters<(type: K, payload: T[K]) => 0>
  ) {
    return JSON.stringify(args)
  }

  function parseWsMessage<T = ClientMessage>(message: any) {
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

export class WebSocketClient<
  CTS = WebSocketClientToServerMessage,
  STC = WebSocketServerToClientMessage
> {
  private parseMessage: (message: any) => WebSocketMessageData<STC>

  constructor(public ws: WebSocket) {
    const { parseWsMessage } = defineWsMessageHandler()
    this.parseMessage = parseWsMessage
  }

  invoke<K extends keyof CTS>(
    ...args: CTS[K] extends never
      ? Parameters<(type: K) => 0>
      : Parameters<(type: K, payload: CTS[K]) => 0>
  ) {
    this.ws.send(JSON.stringify(args))
  }

  handle<K extends keyof STC>(
    ...args: STC[K] extends never
      ? Parameters<(name: K, listener: () => void) => 0>
      : Parameters<(name: K, listener: (payload: STC[K]) => void) => 0>
  ) {
    const [name, listener] = args
    this.ws.addEventListener('message', event => {
      const { type, payload } = this.parseMessage(event.data)
      if (name === type) {
        listener(payload as STC[K])
      }
    })
  }

  /** alias of `WebSocket.addEventListener`  */
  on<K extends keyof WebSocketEventMap>(
    name: K,
    listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any
  ) {
    this.ws.addEventListener(name, listener)
  }
}
