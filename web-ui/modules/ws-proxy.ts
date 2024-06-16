import { defineNuxtModule, logger } from '@nuxt/kit'
import { createProxyServer } from 'http-proxy'
import type { IncomingMessage } from 'node:http'
import type { Duplex } from 'node:stream'

// Need nuxt@3.6.5
export default defineNuxtModule({
  defaults: {
    target: '',
    path: '/ws'
  },
  meta: {
    configKey: 'websocketProxy',
    name: 'Websocket proxy'
  },
  setup(resolvedOptions, nuxt) {
    if (!nuxt.options.dev || !resolvedOptions.target) {
      return
    }

    nuxt.hook('listen', server => {
      const proxy = createProxyServer({
        ws: true,
        secure: false,
        changeOrigin: true,
        target: resolvedOptions.target
      })

      const proxyFn = (req: IncomingMessage, socket: Duplex, head: Buffer) => {
        if (req.url && req.url.startsWith(resolvedOptions.path)) {
          proxy.ws(req, socket, head)
        }
      }

      server.on('upgrade', proxyFn)

      nuxt.hook('close', () => {
        server.off('upgrade', proxyFn)
        proxy.close()
      })

      logger.info(`Websocket dev proxy started on ${resolvedOptions.path}`)
    })
  }
})
