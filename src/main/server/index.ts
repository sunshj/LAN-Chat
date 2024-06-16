import path from 'node:path'
import http from 'node:http'
import express from 'express'
import { type IpcMainInvokeEvent, shell } from 'electron'
import { Server } from 'socket.io'
import { $notify, getResPath } from '../utils'
import { networks } from '../store'
import apiRouter from './api'
import { chatEventHandler } from './events'

let server: http.Server
let io: Server

export async function startServer(
  _event: IpcMainInvokeEvent,
  { host, port }: { host: string; port: number }
) {
  if (server) server.close()
  const app = express()
  server = http.createServer(app)
  io = new Server(server, {
    transports: ['websocket'],
    maxHttpBufferSize: 1e8
  })

  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(express.static(path.join(getResPath(), 'ui')))

  app.use('/api', apiRouter)

  io.on('connection', socket => {
    /** chat socket handle  */
    chatEventHandler(io, socket)
  })

  return await new Promise<boolean>(resolve => {
    server.listen(port, host, () => {
      networks.incr(host)
      resolve(server.listening)
    })
    const notify = $notify('LAN Chat Notice', `Server started on port ${port}`)
    notify.addListener('click', () => {
      shell.openExternal(`http://${host}:${port}`)
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
