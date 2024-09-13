import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { app, dialog, Menu, shell, type BrowserWindow } from 'electron'
import { store, userStore } from './store'
import { checkForUpgrade, getResPath } from './utils'

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
        },
        {
          label: '清空数据',
          click: () => {
            const total = userStore.findMany().length
            if (total === 0) {
              dialog.showMessageBox({
                title: 'LAN Chat',
                type: 'info',
                message: '空空如也'
              })
              return
            }
            dialog
              .showMessageBox(mainWindow, {
                title: 'LAN Chat',
                type: 'warning',
                message: '确定要清空数据吗？',
                detail: `共计${total}条数据，清空后所有数据将无法恢复。`,
                buttons: ['取消', '确定']
              })
              .then(({ response }) => {
                if (response === 1) {
                  store.clear()
                  dialog.showMessageBox({
                    title: 'LAN Chat',
                    type: 'info',
                    message: `清空了${total}条数据`
                  })
                }
              })
          }
        },
        {
          label: '清空文件',
          click: () => {
            const uploadsDir = path.join(getResPath(), 'uploads')

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

            dialog
              .showMessageBox({
                message: '清理文件',
                type: 'question',
                buttons: ['取消', '确定'],
                title: 'LAN Chat',
                detail: `共计${safeFiles.length}个文件，确定要清理吗？`
              })
              .then(({ response }) => {
                if (response === 1) {
                  safeFiles.forEach(file => {
                    fs.unlinkSync(path.join(uploadsDir, file))
                  })
                  dialog.showMessageBox({
                    title: 'LAN Chat',
                    type: 'info',
                    message: `清理完成，共删除${safeFiles.length}个文件`
                  })
                }
              })
          }
        }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '检查更新',
          click: () => checkForUpgrade(mainWindow)
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
