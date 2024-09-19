import type { FileJSON } from 'formidable'
import type { Server, Socket } from 'socket.io'

export type UploadedFile = FileJSON

export interface User {
  id: string
  username: string
}

export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'file'

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
