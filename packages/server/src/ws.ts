import { WebSocket, WebSocketServer } from 'ws'
import {
  defineWsMessageHandler,
  type WebSocketClientToServerMessage,
  type WebSocketServerToClientMessage
} from './client'
import type http from 'node:http'

declare module 'ws' {
  export interface WebSocketServer {
    broadcast: (data: string) => void
  }
  export interface WebSocket {
    userId?: string
  }
}

export function createWsServer(server: http.Server) {
  const wss = new WebSocketServer({ server, maxPayload: 1e8 })

  const { createWsMessage, parseWsMessage } = defineWsMessageHandler<
    WebSocketServerToClientMessage,
    WebSocketClientToServerMessage
  >()

  function broadcast(data: string) {
    wss.clients.forEach((ws: WebSocket) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data)
      }
    })
  }

  function getConnectionUsersId() {
    return [...wss.clients].map((v: WebSocket) => v.userId!).filter(Boolean)
  }

  wss.on('connection', (ws: WebSocket) => {
    ws.on('message', rawData => {
      if (rawData.toString() === 'ping') ws.send('pong')

      const { type, payload } = parseWsMessage(rawData)

      switch (type) {
        case '$user-online':
          ws.userId = payload
          broadcast(createWsMessage('$get-users', getConnectionUsersId()))
          break

        case '$get-users':
          broadcast(createWsMessage('$get-users', getConnectionUsersId()))
          break

        case '$new-message': {
          const { receiver } = payload
          wss.clients.forEach((_ws: WebSocket) => {
            if (_ws.userId === receiver) {
              _ws.send(createWsMessage('$new-message', payload))
            }
          })
          break
        }

        default:
          break
      }
    })

    ws.on('close', () => {
      broadcast(createWsMessage('$get-users', getConnectionUsersId()))
    })
  })

  return Object.assign(wss, { broadcast })
}
