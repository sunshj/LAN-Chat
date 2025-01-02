import path from 'node:path'
import process from 'node:process'
import {
  app,
  dialog,
  Notification,
  type NotificationConstructorOptions,
  type OpenDialogOptions
} from 'electron'

import { store } from '../store'

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
  const resourcesPathDev = path.join(process.cwd(), 'resources')
  const resourcesPathProd = path
    .join(app.getAppPath(), 'resources')
    .replace('app.asar', 'app.asar.unpacked')
  return app.isPackaged ? resourcesPathProd : resourcesPathDev
}

export async function openFile(options: OpenDialogOptions) {
  const { canceled, filePaths } = await dialog.showOpenDialog(options)
  if (!canceled) {
    return filePaths[0]
  }
  return null
}

export function getSettings() {
  const settings = store.get('settings')
  return {
    ...settings,
    uploadsDir: settings.uploadsDir || path.join(getResPath(), 'uploads')
  }
}
