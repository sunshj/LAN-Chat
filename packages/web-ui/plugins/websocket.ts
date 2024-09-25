import { WebSocketClient } from 'lan-chat-server/client'

export default defineNuxtPlugin(nuxtApp => {
  const wsUrl = nuxtApp.$config.public.wsUrl as string
  const url = wsUrl === '/' ? window.location.href.replace('http', 'ws') : wsUrl

  const { ws } = useWebSocket(url, {
    autoReconnect: true,
    heartbeat: {
      interval: 30000,
      pongTimeout: 10000
    }
  })

  const socket = new WebSocketClient(ws.value!)

  return {
    provide: {
      socket
    }
  }
})
