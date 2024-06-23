import { type Socket, io } from 'socket.io-client'

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
