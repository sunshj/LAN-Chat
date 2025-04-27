import { extractZodError, serverSchema } from './schema'
import { createHostServer, type CreateServerOptions } from './server'
import { createWSServer } from './ws'
import type { WebSocketServer } from './types'
import type { Server } from 'node:http'

export * from './store'
export * from './types'

let _server: Server | null = null
let _wss: WebSocketServer | null = null

interface StartServerOptions extends CreateServerOptions {
  host: string
  port: number
  onListening?: (host: string, port: number) => void | Promise<void>
}

function cleanUp() {
  _wss?.close()
  _server?.close()
}

export async function startServer(options: StartServerOptions) {
  const { host, port, uiDir, uploadsDir, onListening, storeHandlers } = options

  const { error, data } = serverSchema.safeParse({ host, port })
  if (error) throw new Error(extractZodError(error))

  cleanUp()
  const { server, wss } = createHostServer({
    uiDir,
    uploadsDir,
    storeHandlers
  })
  _server = server
  _wss = wss

  return await new Promise<boolean>(resolve => {
    server?.listen(data.port, data.host, async () => {
      await onListening?.(host, port)
      resolve(server?.listening ?? false)
    })
  })
}

export function stopServer() {
  _wss?.emit('message', 'Server is shutting down')
  cleanUp()
  return _server?.listening ?? false
}
