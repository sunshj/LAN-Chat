import type { FileJSON } from 'formidable'
import type { Server } from 'socket.io'

export type Awaitable<T> = T | Promise<T>

export type UploadedFile = FileJSON

export interface User {
  id: string
  username: string
}

export type MessageType = 'video' | 'audio' | 'image' | 'file' | 'text'

export interface MessagePayload {
  /** video payload */
  video?: {
    cover?: string
  }
  /** audio payload */
  audio?: {
    pic?: string
    title?: string
    artist?: string
  }
  /** image payload */
  image?: {
    thumbnail?: string
  }
}

export interface Message {
  mid: string
  cid: string
  sender: string
  receiver: string
  type: MessageType
  content: string
  time: number
  read?: boolean
  payload?: MessagePayload
}

export interface ServerToClientEvents {
  message: (msg: string) => void
  '$get-users': (usersId: string[]) => void
  '$new-message': (message: Message) => void
  '$new-group-message': (message: Message) => void
}

export interface ClientToServerEvents {
  '$user-online': (userId: string) => void
  '$get-users': () => void
  '$new-message': (message: Message) => void
  '$new-group-message': (message: Message) => void
}

interface SocketData {
  userId: string
}

export type WebSocketServer = Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>
