import { createReadStream } from 'node:fs'
import { readFile, stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { join } from 'node:path'
import { createId } from '@paralleldrive/cuid2'
import {
  assertMethod,
  createApp,
  createError,
  createRouter,
  eventHandler,
  getRouterParam,
  readValidatedBody,
  serveStatic,
  toNodeListener
} from 'h3'
import { readFiles } from 'h3-formidable'
import { lookup } from 'mrmime'
import { messageSchema, userSchema } from './schema'
import { toGroupChatMessageStore, toUserStore, type StoreHandlers } from './store'

export interface CreateServerOptions {
  uiDir: string
  uploadsDir: string
  storeHandlers: StoreHandlers
}

export function createHostServer(options: CreateServerOptions) {
  const userStore = toUserStore(options.storeHandlers)
  const groupChatStore = toGroupChatMessageStore(options.storeHandlers)

  const app = createApp()
  const router = createRouter()
  app.use(router)

  const fileMap = new Map<string, Promise<string | undefined>>()
  const readCachedFile = (id: string) => {
    if (!fileMap.has(id))
      fileMap.set(
        id,
        readFile(id, 'utf-8').catch(() => undefined)
      )
    return fileMap.get(id)
  }

  app.use(
    '/',
    eventHandler(async event => {
      const result = await serveStatic(event, {
        fallthrough: true,
        getContents(id) {
          return readCachedFile(join(options.uiDir, id))
        },
        async getMeta(id) {
          const stats = await stat(join(options.uiDir, id)).catch(() => undefined)
          if (!stats || !stats.isFile()) return

          return {
            type: lookup(id),
            size: stats.size,
            mtime: stats.mtimeMs
          }
        }
      })

      if (result === false) return
      return result
    })
  )

  router.get(
    '/api/users',
    eventHandler(async () => {
      return {
        data: await userStore.findMany()
      }
    })
  )

  router.get(
    '/api/user/:id',
    eventHandler(async event => {
      const uid = getRouterParam(event, 'id')!
      return {
        data: await userStore.findOne(uid)
      }
    })
  )

  router.put(
    '/api/user/:id',
    eventHandler(async event => {
      const uid = getRouterParam(event, 'id') as string
      const { username } = await readValidatedBody(event, userSchema.parse)
      const user = await userStore.findOne(uid)
      if (!user) throw createError('user not found')
      return {
        data: await userStore.mutation(uid, { username })
      }
    })
  )

  router.post(
    '/api/user',
    eventHandler(async event => {
      const id = createId()
      const { username } = await readValidatedBody(event, userSchema.parse)
      return {
        data: await userStore.mutation(id, { username })
      }
    })
  )

  router.get(
    '/api/group_chat/messages',
    eventHandler(async () => {
      return {
        data: await groupChatStore.findMany()
      }
    })
  )

  router.get(
    '/api/group_chat/message/:mid',
    eventHandler(async event => {
      const mid = getRouterParam(event, 'mid') as string
      return {
        data: await groupChatStore.findOne(mid)
      }
    })
  )

  router.post(
    '/api/group_chat/message',
    eventHandler(async event => {
      const { error, data: msg } = await readValidatedBody(event, messageSchema.safeParseAsync)
      if (error) {
        throw createError({ statusCode: 400, statusMessage: error.errors[0].message })
      }

      return {
        data: await groupChatStore.create(msg)
      }
    })
  )

  router.post(
    '/api/upload',
    eventHandler(async event => {
      const { files } = await readFiles(event, {
        uploadDir: options.uploadsDir,
        encoding: 'utf-8',
        filename(_name, _ext, part) {
          return `${createId()}-${encodeURIComponent(part.originalFilename!)}`
        }
      })

      const [file] = files.file!

      return {
        data: file
      }
    })
  )

  router.use(
    '/api/download/:filename',
    eventHandler(event => {
      assertMethod(event, ['HEAD', 'GET'])
      const filename = getRouterParam(event, 'filename')!
      const filePath = join(options.uploadsDir, filename)
      return createReadStream(filePath)
    })
  )

  return createServer(toNodeListener(app))
}
