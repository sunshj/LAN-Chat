import { Menu, type BrowserWindow } from 'electron'

export function createTrayMenu(mainWindow: BrowserWindow) {
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
