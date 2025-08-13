import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { is } from '@electron-toolkit/utils'
import { app, BrowserWindow, dialog, shell, Tray, Menu } from 'electron'
import { getSettings, store } from './store'
import { checkForUpgrade } from './updater'

const windows = {
  mainWindow: null as BrowserWindow | null
}

const currentDirname = dirname(fileURLToPath(import.meta.url))

export function getMainWindow() {
  return windows.mainWindow
}

export function destroyMainWindow() {
  windows.mainWindow?.destroy()
  windows.mainWindow = null
}

function createTrayMenu(mainWindow: BrowserWindow) {
  return Menu.buildFromTemplate([
    {
      label: '显示',
      click: () => {
        mainWindow.show()
      }
    },
    {
      label: '设置',
      click: () => {
        mainWindow.show()
        mainWindow.webContents.send('navigate', '/setting')
      }
    },
    {
      label: '退出',
      click: () => {
        mainWindow.destroy()
      }
    }
  ])
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

  windows.mainWindow = mainWindow

  mainWindow.on('ready-to-show', () => {
    if (!process.argv.includes('--hidden')) {
      mainWindow.show()
    } else {
      mainWindow.setSkipTaskbar(true)
    }
  })

  // auto start
  if (app.isPackaged) {
    app.setLoginItemSettings({
      openAtLogin: getSettings().autoLaunch,
      path: app.getPath('exe'),
      args: ['--hidden']
    })
  }

  // auto check upgrade when app start
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

    const { quitApp, quitAppTipShown, quitAppForUpdate } = store.get('internalSettings')

    if (quitAppForUpdate) {
      store.set('internalSettings.quitAppForUpdate', false)
      destroyMainWindow()
      return
    }

    if (quitAppTipShown && quitApp === 'quit') {
      destroyMainWindow()
      return
    }

    if (quitAppTipShown && quitApp === 'minimize') {
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
        store.set('internalSettings.quitAppTipShown', checkboxChecked)
        if (response === 0) {
          if (checkboxChecked) store.set('internalSettings.quitApp', 'quit')
          destroyMainWindow()
        } else if (response === 1) {
          if (checkboxChecked) store.set('internalSettings.quitApp', 'minimize')
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
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
    mainWindow.isVisible() ? mainWindow.setSkipTaskbar(false) : mainWindow.setSkipTaskbar(true)
  })

  return mainWindow
}
