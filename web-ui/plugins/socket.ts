import { io } from 'socket.io-client'

export default defineNuxtPlugin(() => {
  const socket = io('/', {
    transports: ['websocket']
  })

  return {
    provide: {
      socket
    }
  }
})
