import { io, type Socket } from 'socket.io-client'
import type { ClientToServerEvents, ServerToClientEvents } from 'lan-chat-server'

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>

export default defineNuxtPlugin(nuxtApp => {
  const wsUrl = nuxtApp.$config.public.wsUrl as string
  const socket: SocketType = io(wsUrl, {
    transports: ['websocket']
  })

  return {
    provide: {
      socket
    }
  }
})
