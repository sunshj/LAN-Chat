import { Server } from 'socket.io'
import type { WebSocketServer } from './types'
import type http from 'node:http'

export function createWSServer(server: http.Server) {
  const io: WebSocketServer = new Server(server, {
    transports: ['websocket'],
    maxHttpBufferSize: 1e8
  })

  io.on('connection', socket => {
    const getConnectionUsersId = async () => {
      const connections = await io.fetchSockets()
      return connections.map(v => v.data.userId).filter(Boolean)
    }

    socket.on('$user-online', async userId => {
      socket.data.userId = userId

      io.emit('$get-users', await getConnectionUsersId())
    })

    socket.on('$get-users', async () => {
      io.emit('$get-users', await getConnectionUsersId())
    })

    socket.on('disconnect', async () => {
      io.emit('$get-users', await getConnectionUsersId())
    })

    socket.on('$new-message', msg => {
      const receiverId = msg.receiver
      io.sockets.sockets.forEach(sock => {
        if (sock.data.userId === receiverId) {
          sock.emit('$new-message', msg)
        }
      })
    })
  })

  return io
}
