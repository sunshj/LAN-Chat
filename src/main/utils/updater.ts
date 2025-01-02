import { exec } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import axios from 'axios'
import { app, dialog, type BrowserWindow } from 'electron'

export async function fetchReleases() {
  const { data: res } = await axios
    .get('https://api.github.com/repos/sunshj/LAN-Chat/releases')
    .catch(error => {
      dialog.showErrorBox(
        'LAN Chat',
        `获取版本信息失败：${error.response?.statusText} ${error.response?.status}`
      )
      return error
    })
  return res
}

export async function checkForUpgrade(win: BrowserWindow, showMsgWhenLatestVersion = false) {
  const [latestRelease] = await fetchReleases()
  if (latestRelease.name === app.getVersion()) {
    if (showMsgWhenLatestVersion) {
      dialog.showMessageBoxSync({
        title: 'LAN Chat',
        message: '当前已是最新版本',
        type: 'info',
        buttons: ['OK']
      })
    }
    return
  }
  dialog
    .showMessageBox({
      title: 'LAN Chat',
      type: 'question',
      message: '发现新版本，是否升级？',
      detail: latestRelease.body,
      buttons: ['升级', '取消']
    })
    .then(async ({ response }) => {
      if (response !== 0) return

      const downloadUrl = latestRelease.assets.find((a: { name: string }) =>
        a.name.endsWith('setup.exe')
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
        onProgress?.(Number.parseFloat(e.progress!.toFixed(2)))
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
