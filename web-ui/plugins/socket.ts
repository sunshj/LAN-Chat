import { io, type Socket } from 'socket.io-client'
import type { ClientToServerEvents, ServerToClientEvents } from 'lan-chat-server'

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>

export default defineNuxtPlugin(() => {
  const socket: SocketType = io('/', {
    transports: ['websocket']
  })

  return {
    provide: {
      socket
    }
  }
})
