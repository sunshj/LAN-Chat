import { io, type Socket } from 'socket.io-client'
import type { ClientToServerEvents, ServerToClientEvents } from 'lan-chat-server'

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>

export default defineNuxtPlugin(nuxtApp => {
  const { wsUrl } = nuxtApp.$config.public
  const url = wsUrl === '/' ? window.location.href.replace('http', 'ws') : wsUrl

  const socket: SocketType = io(url, {
    transports: ['websocket']
  })

  const appStore = useAppStore()

  socket.on('connect', async () => {
    const storageUid = appStore.userInfo.id || 'invalid_uid'
    const userExist = await appStore.fetchUser(storageUid)

    if (userExist) {
      socket.emit('$user-online', appStore.userInfo.id)
    } else {
      const user = await appStore.createUser(getDeviceName(navigator.userAgent!))
      appStore.setUserInfo(user)
      socket.emit('$user-online', user.id)
    }
  })

  socket.on('disconnect', () => {
    appStore.setRawOnlineUsers([])
  })

  return {
    provide: {
      socket
    }
  }
})
