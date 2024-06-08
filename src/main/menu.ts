import fs from 'node:fs'
import path from 'node:path'
import { type BrowserWindow, Menu, dialog } from 'electron'
import { checkUpgrade, getResPath } from './utils'
import { db, users } from './database'

export function createMenu(mainWindow: BrowserWindow) {
  return Menu.buildFromTemplate([
    {
      label: '调试',
      click: () => mainWindow.webContents.openDevTools()
    },
    {
      label: '清空数据库',
      click: () => {
        dialog
          .showMessageBox(mainWindow, {
            title: 'LAN Chat',
            type: 'warning',
            message: '确定要清空数据库吗？',
            detail: '清空数据库后，所有数据将无法恢复。',
            buttons: ['取消', '确定']
          })
          .then(async ({ response }) => {
            if (response === 1) {
              const res = await db.delete(users)
              dialog.showMessageBox({
                title: 'LAN Chat',
                type: 'info',
                message: `清空了${res.changes}条数据`
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
            detail: `确定要清空这些文件吗？\n${safeFiles.join('\n')}`
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
    },
    {
      label: '检查更新',
      click: () => checkUpgrade(mainWindow)
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
