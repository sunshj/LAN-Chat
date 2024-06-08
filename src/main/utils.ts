import crypto from 'node:crypto'
import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs/promises'
import { exec } from 'node:child_process'
import {
  type BrowserWindow,
  Notification,
  type NotificationConstructorOptions,
  app,
  dialog
} from 'electron'
import axios from 'axios'

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

export function getNetworksAddr() {
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

export async function fetchReleases() {
  const { data: res } = await axios.get('https://api.github.com/repos/sunshj/LAN-Chat/releases')
  return res
}

export async function checkUpgrade(win: BrowserWindow) {
  const [latestRelease] = await fetchReleases()
  if (latestRelease.name === app.getVersion()) {
    dialog.showMessageBoxSync({
      title: 'LAN Chat',
      message: '当前已是最新版本',
      type: 'info',
      buttons: ['OK']
    })
    return
  }
  dialog
    .showMessageBox({
      title: 'LAN Chat',
      type: 'question',
      message: '发现新版本，是否升级？',
      buttons: ['升级', '取消']
    })
    .then(async ({ response }) => {
      if (response !== 0) return

      const downloadUrl = latestRelease.assets.find((a: { name: string }) =>
        a.name.endsWith('.exe')
      ).browser_download_url

      await upgradeApp(downloadUrl, val => {
        win.setProgressBar(val)
      })
    })
}

export async function upgradeApp(url: string, onProgress?: (val: number) => void) {
  const { data: buffer } = await axios
    .get(url, {
      responseType: 'arraybuffer',
      onDownloadProgress(e) {
        onProgress && onProgress(Number.parseFloat(e.progress!.toFixed(2)))
      }
    })
    .catch(error => {
      dialog.showErrorBox(
        'LAN Chat',
        `下载失败：${error.response?.statusText} ${error.response?.status}`
      )
      return error
    })

  const tempPath = path.join(app.getPath('temp'), 'LAN-Chat-latest.exe')
  await fs.writeFile(tempPath, buffer)
  setTimeout(() => {
    fs.unlink(tempPath)
    app.exit()
  }, 100)
  exec(`start "" "${tempPath}"`)
}
