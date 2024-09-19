import type { UploadedFile } from 'lan-chat-server'

export type { Message, MessagePayload, MessageType, User } from 'lan-chat-server'

export interface UploadFileResult {
  data: UploadedFile
}

export interface FileStatus {
  file: string
  download: boolean
}

export interface MarkdownParse {
  id: string
  value: string
  error?: string
}
