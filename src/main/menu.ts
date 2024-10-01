import os from 'node:os'
import process from 'node:process'
import { app, dialog, Menu, shell, type BrowserWindow } from 'electron'
import { store } from './store'
import { checkForUpgrade } from './utils'

export function createMenu(mainWindow: BrowserWindow) {
  return Menu.buildFromTemplate([
    {
      label: '功能',
      submenu: [
        {
          label: '打开调试',
          click: () => mainWindow.webContents.openDevTools()
        },
        {
          label: '查看数据',
          click: () => {
            if (import.meta.env.DEV) {
              store.openInEditor()
            } else {
              shell.openPath(store.path)
            }
          }
        }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '检查更新',
          click: () => checkForUpgrade(mainWindow, true)
        },
        {
          label: '关于',
          click: () => {
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
          }
        }
      ]
    },
    {
      label: '退出',
      click: () => {
        mainWindow.destroy()
      }
    }
  ])
}

export function createTrayMenu(mainWindow: BrowserWindow) {
  return Menu.buildFromTemplate([
    {
      label: '显示',
      click: () => {
        mainWindow.show()
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
