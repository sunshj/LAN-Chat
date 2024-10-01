import fs from 'node:fs'
import path from 'node:path'
import { app, dialog, ipcMain, shell } from 'electron'
import { startServer, stopServer } from 'lan-chat-server'
import { networkStore, store, storeHandlers } from './store'
import { $notify, fetchReleases, getResPath, openFile } from './utils'

function getSettings() {
  const settings = store.get('settings')
  return {
    ...settings,
    uploadsDir: settings.uploadsDir || path.join(getResPath(), 'uploads')
  }
}

export function ipcHandler() {
  ipcMain.handle('start-server', (_, { host, port }) => {
    const { notification, uploadsDir } = getSettings()
    return startServer({
      host,
      port,
      uiDir: path.join(getResPath(), 'ui'),
      uploadsDir,
      storeHandlers,
      onListening(host) {
        networkStore.incr(host)

        if (notification) {
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
}
