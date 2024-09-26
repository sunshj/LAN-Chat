import { z } from 'zod'
import { createHostServer, type CreateServerOptions } from './server'
import { createWSServer } from './ws'
import type { WebSocketServer } from './types'
import type { Server } from 'node:http'

export * from './store'
export * from './types'

let server: Server | null
let wss: WebSocketServer | null

interface StartServerOptions extends CreateServerOptions {
  host: string
  port: number
  onListening?: (host: string, port: number) => void | Promise<void>
}

function cleanUp() {
  wss?.close()
  server?.close()
}

const schema = z.object({
  port: z
    .number()
    .int()
    .min(1)
    .max(65535)
    .refine(n => n !== 443, 'Port 443 is not allowed'),
  host: z.string().min(1).ip({ version: 'v4' }).or(z.literal('localhost'))
})

export async function startServer(options: StartServerOptions) {
  const { host, port, uiDir, uploadsDir, onListening, storeHandlers } = options

  const { error, data } = schema.safeParse({ host, port })
  if (error) throw new Error(error.errors.map(e => e.message).join(', '))

  cleanUp()

  server = createHostServer({
    uiDir,
    uploadsDir,
    storeHandlers
  })

  wss = createWSServer(server)

  return await new Promise<boolean>(resolve => {
    server?.listen(data.port, data.host, async () => {
      await onListening?.(host, port)
      resolve(server?.listening ?? false)
    })
  })
}

export function stopServer() {
  wss?.emit('message', 'Server is shutting down')
  cleanUp()
  return server?.listening ?? false
}
