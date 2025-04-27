import process from 'node:process'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { app, ipcMain } from 'electron'
import { registerIPCHandler } from './ipc'
import { registerAutoUpdater } from './updater'
import { createMainWindow, destroyMainWindow } from './window'

if (!app.isPackaged) {
  Object.defineProperty(app, 'isPackaged', { get: () => true })
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('LAN Chat')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC
  registerIPCHandler()

  const mainWindow = createMainWindow()

  registerAutoUpdater()

  ipcMain.handle('open-devtools', () => mainWindow.webContents.openDevTools())
  ipcMain.handle('exit-app', destroyMainWindow)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
