import { io, type Socket } from 'socket.io-client'
import type { ClientToServerEvents, ServerToClientEvents } from 'lan-chat-server'

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>

export default defineNuxtPlugin(nuxtApp => {
  const wsUrl = nuxtApp.$config.public.wsUrl as string
  const url = wsUrl === '/' ? window.location.href.replace('http', 'ws') : wsUrl

  const socket: SocketType = io(url, {
    transports: ['websocket']
  })

  return {
    provide: {
      socket
    }
  }
})
