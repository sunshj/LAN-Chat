import type { Server, Socket } from 'socket.io'

export const channelEventHandler = (io: Server, socket: Socket) => {
  const getConnectionUsersId = async () => {
    const connections = await io.sockets.fetchSockets()
    return connections.map(v => v.data.userId)
  }

  socket.on('online', async userId => {
    socket.data.userId = userId

    io.emit('get-users', await getConnectionUsersId())
  })

  socket.on('get-users', async () => {
    io.emit('get-users', await getConnectionUsersId())
  })

  socket.on('disconnect', async () => {
    io.emit('get-users', await getConnectionUsersId())
  })

  socket.on('join-channel', channelId => {
    console.log('channelId:', channelId)
    socket.join(channelId)
  })

  socket.on('new-message', msg => {
    const receiverId = msg.receiver
    io.sockets.sockets.forEach(sk => {
      if (sk.data.userId === receiverId) {
        sk.emit('new-message', msg)
      }
    })
  })
}
