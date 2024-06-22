export interface UploadFileResult {
  data: {
    destination: string
    encoding: string
    fieldname: string
    filename: string
    mimetype: string
    originalname: string
    path: string
    size: number
  }
}

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

export interface FileStatus {
  file: string
  download: boolean
}
