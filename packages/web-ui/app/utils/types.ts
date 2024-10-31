import type { ClientToServerEvents, ServerToClientEvents, UploadedFile } from 'lan-chat-server'

export type { Awaitable, Message, MessagePayload, MessageType, User } from 'lan-chat-server'

export interface UploadFileResult {
  data: UploadedFile
}

export interface FileStatus {
  file: string
  download: boolean
}

export type SocketEventName = keyof ClientToServerEvents & keyof ServerToClientEvents
