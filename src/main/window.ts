import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { is } from '@electron-toolkit/utils'
import { BrowserWindow, dialog, shell, Tray } from 'electron'
import { createTrayMenu } from './menu'
import { getSettings, store } from './store'
import { checkForUpgrade } from './updater'

const windows = {
  mainWindow: null as BrowserWindow | null
}

globalThis.windows = windows

const currentDirname = dirname(fileURLToPath(import.meta.url))

export function getMainWindow() {
  return windows.mainWindow
}

export function destroyMainWindow() {
  windows.mainWindow?.destroy()
  windows.mainWindow = null
}

export function createMainWindow() {
  const icon = join(currentDirname, '../../resources/icon.png')

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

  if (getSettings().autoCheckUpgrade) {
    checkForUpgrade(false)
  }

  mainWindow.webContents.setWindowOpenHandler(details => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(currentDirname, '../renderer/index.html'), { hash: '/' })
  }

  mainWindow.on('close', event => {
    event.preventDefault()
    const { quitApp, quitAppTipChecked } = store.get('internalSettings')
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

  windows.mainWindow = mainWindow

  return mainWindow
}
