export default defineNuxtPlugin(nuxtApp => {
  const { wsUrl } = nuxtApp.$config.public
  const ws = useWebSocket(wsUrl as string, {
    autoReconnect: true,
    heartbeat: {
      interval: 30000,
      pongTimeout: 10000
    }
  })

  return {
    provide: {
      ws
    }
  }
})
