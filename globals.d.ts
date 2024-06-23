import type { Message } from './web-ui/utils/types'
import type { Server, Socket } from 'socket.io'

declare global {
  interface ServerToClientEvents {
    '$get-users': (usersId: string[]) => void
    '$new-message': (message: Message) => void
  }

  interface ClientToServerEvents {
    '$user-online': (userId: string) => void
    '$get-users': () => void
    '$new-message': (message: Message) => void
  }

  interface SocketData {
    userId: string
  }

  type ServerType = Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>
  type SocketType = Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>
}

export {}
