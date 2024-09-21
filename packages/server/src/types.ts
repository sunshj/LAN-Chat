import type { FileJSON } from 'formidable'

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
