import crypto from 'node:crypto'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { app, Notification, type NotificationConstructorOptions } from 'electron'

const currentDirname = path.dirname(fileURLToPath(import.meta.url))

export const currentScopeCwd = path.join(currentDirname, '../../')

export function isEmptyObj(obj: object) {
  return Object.keys(obj).length === 0
}

export function randomId(n = 16) {
  return crypto.randomBytes(16).toString('hex').slice(0, n)
}

export function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function getNetworkAddresses() {
  return Object.values(os.networkInterfaces())
    .flatMap(nInterface => nInterface ?? [])
    .filter(
      detail =>
        detail &&
        detail.address &&
        (detail.family === 'IPv4' ||
          // @ts-expect-error Node 18.0 - 18.3 returns number
          detail.family === 4)
    )
    .map(v => v.address)
    .reverse()
}

export function $notify(
  title: string,
  message: string,
  options: NotificationConstructorOptions = {}
) {
  const notification = new Notification({
    title,
    body: message,
    icon: path.join(getResPath(), 'icon.png'),
    ...options
  })
  notification.show()
  return notification
}

/**
 * 获取resources目录
 */
export function getResPath() {
  const resourcesPathDev = path.join(currentScopeCwd, 'resources')
  const resourcesPathProd = path
    .join(app.getAppPath(), 'resources')
    .replace('app.asar', 'app.asar.unpacked')
  return app.isPackaged ? resourcesPathProd : resourcesPathDev
}
