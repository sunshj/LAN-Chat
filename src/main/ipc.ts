import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import axios from 'axios'
import { app, dialog, ipcMain, shell } from 'electron'
import { startServer, stopServer } from 'lan-chat-server'
import { getSettings, networkStore, store, storeHandlers } from './store'
import { checkForUpgrade } from './updater'
import { $notify, getResPath } from './utils'

export function registerIPCHandler() {
  ipcMain.handle('start-server', (_, { host, port }) => {
    const { notificationAfterStartServer, uploadsDir } = getSettings()
    return startServer({
      host,
      port,
      uiDir: path.join(getResPath(), 'ui'),
      uploadsDir,
      storeHandlers,
      onListening(host) {
        networkStore.increment(host)

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

  ipcMain.handle('get-ip-addresses', () => networkStore.addresses)

  ipcMain.handle('open-url', (_, url) => shell.openExternal(url))

  ipcMain.handle('get-version', () => app.getVersion())

  ipcMain.handle('open-uploads-dir', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      defaultPath: getSettings().uploadsDir
    })
    if (canceled) return null
    return filePaths[0]
  })

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

  ipcMain.handle('clean-app-data', () => {
    store.reset('users')
    store.reset('messages')
  })

  ipcMain.handle('get-settings', () => getSettings())

  ipcMain.handle('save-settings', (_, settings) => {
    store.set('settings', settings)

    // Update auto launch settings when changed
    if (app.isPackaged) {
      app.setLoginItemSettings({
        openAtLogin: settings.autoLaunch,
        path: app.getPath('exe'),
        args: ['--hidden']
      })
    }
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

  ipcMain.handle('check-for-upgrade', () => checkForUpgrade(true))

  ipcMain.handle('get-ai-models', async () => {
    const ai = store.get('ai')
    if (!ai) return []
    const res = await axios.get(`${ai.baseUrl}/models?type=text&sub_type=chat`, {
      headers: {
        Authorization: `Bearer ${ai.apiKey}`
      }
    })

    return res.data.data.map(v => v.id)
  })

  ipcMain.handle('get-ai-settings', () => store.get('ai'))

  ipcMain.handle('save-ai-settings', (_, data) => {
    console.log('data: ', data)
    store.set('ai', data)
  })
}
