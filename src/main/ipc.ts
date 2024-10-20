import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { app, dialog, ipcMain, shell } from 'electron'
import { startServer, stopServer } from 'lan-chat-server'
import { networkStore, store, storeHandlers } from './store'
import { $notify, fetchReleases, getResPath, getSettings, openFile } from './utils'

export function ipcHandler() {
  ipcMain.handle('start-server', (_, { host, port }) => {
    const { notificationAfterStartServer, uploadsDir } = getSettings()
    return startServer({
      host,
      port,
      uiDir: path.join(getResPath(), 'ui'),
      uploadsDir,
      storeHandlers,
      onListening(host) {
        networkStore.incr(host)

        if (notificationAfterStartServer) {
          const notify = $notify('LAN Chat Notice', `Server started on port ${port}`)
          notify.addListener('click', () => {
            shell.openExternal(`http://${host}:${port}`)
          })
        }
      }
    }).catch((error: any) => {
      dialog.showErrorBox('Start Server Failed', error.message)
      return false
    })
  })

  ipcMain.handle('stop-server', () => stopServer())

  ipcMain.handle('get-networks', () => networkStore.value)

  ipcMain.handle('open-url', (_, url) => shell.openExternal(url))

  ipcMain.handle('fetch-releases', fetchReleases)

  ipcMain.handle('get-version', () => app.getVersion())

  ipcMain.handle('open-uploads-dir', () =>
    openFile({ properties: ['openDirectory'], defaultPath: getSettings().uploadsDir })
  )

  ipcMain.handle('clean-uploads-dir', () => {
    const { uploadsDir } = getSettings()

    const files = fs.readdirSync(uploadsDir)
    const aliveFiles = ['.gitkeep', 'THIS_FILE_SHOULD_NOT_BE_DELETED']
    const safeFiles = files.filter(file => !aliveFiles.includes(file))
    if (safeFiles.length === 0) {
      dialog.showMessageBox({
        title: 'LAN Chat',
        type: 'info',
        message: '没有需要清理的文件'
      })
      return
    }

    safeFiles.forEach(file => {
      fs.unlinkSync(path.join(uploadsDir, file))
    })

    dialog.showMessageBox({
      title: 'LAN Chat',
      type: 'info',
      message: `清理完成，共删除${safeFiles.length}个文件`
    })
  })

  ipcMain.handle('clean-stores', () => {
    store.clear()
  })

  ipcMain.handle('get-settings', () => getSettings())

  ipcMain.handle('save-settings', (_, settings) => {
    store.set('settings', settings)
  })

  ipcMain.handle('reset-settings', () => {
    store.reset('settings')
    return getSettings()
  })

  ipcMain.handle('open-stores-data', () => {
    if (import.meta.env.DEV) {
      store.openInEditor()
    } else {
      shell.openPath(store.path)
    }
  })

  ipcMain.handle('show-version-data', () => {
    const isPortable = process.env.PORTABLE_EXECUTABLE_DIR !== undefined
    const info = {
      版本: app.getVersion() + (isPortable ? ' (portable)' : ' (setup)'),
      Electron: process.versions.electron,
      Chromium: process.versions.chrome,
      'Node.js': process.versions.node,
      OS: `${os.type()} ${os.arch()} ${os.release()}`
    }
    dialog.showMessageBox({
      title: '关于 LAN Chat',
      type: 'info',
      message: 'LAN Chat',
      detail: Object.entries(info)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n')
    })
  })
}
