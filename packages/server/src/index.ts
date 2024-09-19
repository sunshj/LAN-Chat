import { Server } from 'socket.io'
import { z } from 'zod'
import { chatEventHandler } from './events'
import { createHostServer } from './server'
import type { StoreHandlers } from './store'
import type http from 'node:http'

export * from './types'
export * from './store'

let server: http.Server | null
let io: Server | null

interface StartServerOptions {
  host: string
  port: number
  uiPath: string
  uploadsPath: string
  storeHandlers: StoreHandlers
  onListening?: (host: string, port: number) => void | Promise<void>
}

function cleanUp() {
  if (server) {
    server?.close(() => {
      server = null
    })
  }

  if (io) {
    io?.close(() => {
      io = null
    })
  }
}

const portSchema = z.object({
  port: z
    .number()
    .int()
    .min(1)
    .max(65535)
    .refine(n => n !== 443, 'Port 443 is not allowed'),
  host: z.string().min(1).ip({ version: 'v4' }).or(z.literal('localhost'))
})

export async function startServer(options: StartServerOptions) {
  const { host, port, uiPath, uploadsPath, onListening, storeHandlers } = options

  const { error, data } = portSchema.safeParse({ host, port })
  if (error) throw new Error(error.errors.map(e => e.message).join(', '))

  cleanUp()

  server = createHostServer({
    uiPath,
    uploadsPath,
    storeHandlers
  })

  io = new Server(server, {
    transports: ['websocket'],
    maxHttpBufferSize: 1e8
  })

  io.on('connection', socket => {
    chatEventHandler(io!, socket)
  })

  return await new Promise<boolean>(resolve => {
    server?.listen(data.port, data.host, async () => {
      await onListening?.(host, port)
      resolve(server?.listening ?? false)
    })
  })
}

export function stopServer() {
  io?.emit('message', 'Server is shutting down')
  cleanUp()
  return server?.listening ?? false
}
