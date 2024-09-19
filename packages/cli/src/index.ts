import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineCommand, runMain } from 'citty'
import { startServer } from 'lan-chat-server'
import { version as pkgVersion } from '../package.json'
import { storeHandlers, storePath } from './store'

const __filename = fileURLToPath(import.meta.url)
const uploadsPath = `${tmpdir()}/lan-chat-cli-uploads`

const main = defineCommand({
  meta: {
    name: 'LAN Chat CLI',
    version: pkgVersion,
    description: 'A simple chat application for local area networks'
  },
  args: {
    port: {
      alias: 'p',
      description: 'The port to listen on',
      type: 'string',
      default: '3000'
    },
    host: {
      description: 'The host to listen on',
      type: 'string',
      default: '127.0.0.1'
    },
    clean: {
      description: 'Clean the store and uploads directory',
      type: 'boolean',
      default: false
    },
    verbose: {
      description: 'Enable verbose logging',
      type: 'boolean',
      default: false
    }
  },

  async run({ args }) {
    const { host, port, clean, verbose } = args
    if (clean && existsSync(storePath)) {
      rmSync(storePath, { recursive: true })
    }

    if (clean && existsSync(uploadsPath)) {
      rmSync(uploadsPath, { recursive: true })
    }

    console.log(`Listening on http://${host}:${port}`)

    if (verbose) {
      console.log('storePath: ', storePath)
      console.log('uploadsPath: ', uploadsPath)
    }

    if (!existsSync(storePath)) {
      writeFileSync(storePath, JSON.stringify({ users: [] }))
    }

    if (!existsSync(uploadsPath)) {
      mkdirSync(uploadsPath, { recursive: true })
    }

    await startServer({
      host,
      port: Number(port),
      uiPath: path.resolve(__filename, '../..', 'ui'),
      uploadsPath,
      storeHandlers
    })
  }
})

runMain(main)
