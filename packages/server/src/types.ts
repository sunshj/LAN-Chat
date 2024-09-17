import type { Message } from '../../../web-ui/utils/types'
import type { Server, Socket } from 'socket.io'

export type User = {
  id: string
  username: string
}

export type UserStore = {
  findMany: () => User[]
  findOne: (id: string) => User | null
  mutation: (id: string, values: Omit<User, 'id'>) => User
  deleteMany: () => { count: number }
}

export interface ServerToClientEvents {
  '$get-users': (usersId: string[]) => void
  '$new-message': (message: Message) => void
}

export interface ClientToServerEvents {
  '$user-online': (userId: string) => void
  '$get-users': () => void
  '$new-message': (message: Message) => void
}

export interface SocketData {
  userId: string
}

export type ServerType = Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>
export type SocketType = Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>
