import path from 'node:path'
import process from 'node:process'
import { is } from '@electron-toolkit/utils'
import { dialog } from 'electron'
import electronUpdater, { type AppUpdater } from 'electron-updater'
import { store } from './store'
import { getMainWindow } from './window'

const autoUpdater: AppUpdater & { notifyWhenNotAvailable?: boolean } = electronUpdater.autoUpdater

export function registerAutoUpdater() {
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = false

  if (is.dev) {
    autoUpdater.updateConfigPath = path.join(process.cwd(), 'dev-app-update.yml')
  }

  autoUpdater.on('update-available', info => {
    dialog
      .showMessageBox({
        type: 'info',
        title: '检查更新',
        message: `发现新版本 v${info.version}，是否立即更新？`,
        buttons: ['立即更新', '暂不更新'],
        cancelId: 1
      })
      .then(({ response }) => {
        if (response === 0) {
          autoUpdater.downloadUpdate()
        }
      })
  })

  autoUpdater.on('download-progress', info => {
    const mainWindow = getMainWindow()
    mainWindow?.setProgressBar(info.percent / 100)
  })

  autoUpdater.on('update-not-available', () => {
    if (!autoUpdater.notifyWhenNotAvailable) return

    dialog.showMessageBox({
      type: 'info',
      title: '检查更新',
      message: '当前已是最新版本'
    })
  })

  autoUpdater.on('update-downloaded', () => {
    dialog
      .showMessageBox({
        type: 'info',
        buttons: ['立即安装', '稍后安装'],
        title: '下载完成',
        message: '下载完成，是否立即安装？',
        cancelId: 1
      })
      .then(({ response }) => {
        if (response === 0) {
          store.set('internalSettings.quitAppForUpdate', true)
          autoUpdater.quitAndInstall()
        }
      })
  })
}

export async function checkForUpgrade(notifyWhenNotAvailable = true) {
  autoUpdater.notifyWhenNotAvailable = notifyWhenNotAvailable
  await autoUpdater.checkForUpdates()
}
