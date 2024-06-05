import { join } from 'node:path'
import { BrowserWindow, Menu, Tray, app, dialog, ipcMain, shell } from 'electron'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { createMenu, createTrayMenu } from './menu'
import { getNetworksAddr, startServer, stopServer } from './server'
import { runMigrate } from './database/migrate'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 500,
    height: 600,
    show: false,
    autoHideMenuBar: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      devTools: true,
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  Menu.setApplicationMenu(createMenu(mainWindow))

  mainWindow.webContents.setWindowOpenHandler(details => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('close', event => {
    event.preventDefault()

    dialog
      .showMessageBox(mainWindow, {
        type: 'question',
        buttons: ['退出应用', '最小化到托盘'],
        title: '退出提示',
        message: '是否退出应用？',
        cancelId: -1
      })
      .then(result => {
        if (result.response === 0) {
          mainWindow.destroy()
        } else if (result.response === 1) {
          mainWindow.hide()
          mainWindow.setSkipTaskbar(true)
        } else {
          mainWindow.focus()
        }
      })
  })

  const tray = new Tray(icon)
  tray.setToolTip('LAN Chat')
  tray.setContextMenu(createTrayMenu(mainWindow))
  tray.on('double-click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
    mainWindow.isVisible() ? mainWindow.setSkipTaskbar(false) : mainWindow.setSkipTaskbar(true)
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('LAN Chat')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC
  ipcMain.handle('start-server', startServer)
  ipcMain.handle('stop-server', stopServer)
  ipcMain.handle('get-networks', getNetworksAddr)
  ipcMain.handle('open-url', (_event, url) => shell.openExternal(url))

  await runMigrate()
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
