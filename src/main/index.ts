import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, dialog, ipcMain, shell, Tray } from 'electron'
import { ipcHandler } from './ipc'
import { createTrayMenu } from './menu'
import { store } from './store'
import { checkForUpgrade } from './utils'

const currentDirname = dirname(fileURLToPath(import.meta.url))

const icon = join(currentDirname, '../../resources/icon.png')

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 500,
    height: 600,
    resizable: false,
    show: false,
    autoHideMenuBar: true,
    icon,
    webPreferences: {
      devTools: true,
      preload: join(currentDirname, '../preload/index.mjs'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  ipcMain.handle('open-devtools', () => mainWindow.webContents.openDevTools())
  ipcMain.handle('check-for-upgrade', (_, show) => checkForUpgrade(mainWindow, show))
  ipcMain.handle('exit-app', () => mainWindow.destroy())

  mainWindow.webContents.setWindowOpenHandler(details => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(currentDirname, '../renderer/index.html'))
  }

  mainWindow.on('close', event => {
    event.preventDefault()
    const { quitApp, quitAppTipChecked } = store.store
    if (quitAppTipChecked && quitApp === 'quit') {
      mainWindow.destroy()
      return
    }

    if (quitAppTipChecked && quitApp === 'minimize') {
      mainWindow.hide()
      mainWindow.setSkipTaskbar(true)
      return
    }

    dialog
      .showMessageBox(mainWindow, {
        type: 'question',
        buttons: ['退出应用', '最小化到托盘'],
        checkboxLabel: '不再提示',
        checkboxChecked: false,
        title: '退出提示',
        message: '是否退出应用？',
        cancelId: -1
      })
      .then(({ response, checkboxChecked }) => {
        store.set('quitAppTipChecked', checkboxChecked)
        if (response === 0) {
          store.set('quitApp', 'quit')
          mainWindow.destroy()
        } else if (response === 1) {
          store.set('quitApp', 'minimize')
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
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('LAN Chat')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC
  ipcHandler()

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
