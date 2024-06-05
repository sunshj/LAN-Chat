import crypto from 'node:crypto'
import path from 'node:path'
import { Notification, type NotificationConstructorOptions, app } from 'electron'

export function $notify(
  title: string,
  message: string,
  options: NotificationConstructorOptions = {}
) {
  const notification = new Notification({
    title,
    body: message,
    ...options
  })
  notification.show()
  return notification
}

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const randomId = (n = 16) => crypto.randomBytes(16).toString('hex').slice(0, n)

/**
 * 获取resources目录
 */
export function getResPath() {
  const resourcesPathDev = path.join(process.cwd(), 'resources')
  const resourcesPathProd = path
    .join(app.getAppPath(), 'resources')
    .replace('app.asar', 'app.asar.unpacked')
  return app.isPackaged ? resourcesPathProd : resourcesPathDev
}
