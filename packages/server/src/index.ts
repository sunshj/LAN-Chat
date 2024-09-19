import http from 'node:http'
import express from 'express'
import { Server } from 'socket.io'
import { createApiRouter } from './api'
import { chatEventHandler } from './events'
import { toUserStore, type StoreHandlers } from './store'

export * from './types'
export * from './store'

let server: http.Server
let io: Server

interface StartServerOptions {
  host: string
  port: number
  uiPath: string
  uploadsPath: string
  storeHandlers: StoreHandlers
  onListening?: (host: string, port: number) => void
}

export async function startServer(options: StartServerOptions) {
  const { host, port, uiPath, uploadsPath, onListening, storeHandlers } = options

  if (!Number.isInteger(port) || port <= 0 || port > 65535 || port === 443) {
    throw new Error('Invalid port number')
  }
  if (server) {
    io.close()
    server.close()
  }
  const app = express()
  server = http.createServer(app)
  io = new Server(server, {
    transports: ['websocket'],
    maxHttpBufferSize: 1e8
  })

  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(express.static(uiPath))

  app.use('/api', createApiRouter(toUserStore(storeHandlers), uploadsPath))
  app.all('/*', (_req, res) => {
    res.redirect('/404.html')
  })

  io.on('connection', socket => {
    /** chat socket handle  */
    chatEventHandler(io, socket)
  })

  return await new Promise<boolean>(resolve => {
    server.listen(port, host, () => {
      onListening?.(host, port)
      resolve(server.listening)
    })
  })
}

export function stopServer() {
  if (server) {
    io.emit('message', 'Server is shutting down')
    io.close()
    server.close()
  }

  return server.listening
}
