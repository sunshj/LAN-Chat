import process from 'node:process'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { app } from 'electron'
import { registerAutoUpdater } from './updater'
import { createMainWindow } from './window'
import { registerIpcMain } from '@egoist/tipc/main'
import { router } from './ipc'

if (!app.isPackaged) {
  Object.defineProperty(app, 'isPackaged', { get: () => true })
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('LAN Chat')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC
  registerIpcMain(router)

  createMainWindow()

  // updater
  registerAutoUpdater()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
