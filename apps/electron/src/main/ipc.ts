import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import axios from 'axios'
import { app, dialog, shell } from 'electron'
import { startServer, stopServer } from 'lan-chat-server'
import { AppStore, getSettings, networkStore, store, storeHandlers } from './store'
import { checkForUpgrade } from './updater'
import { $notify, getResPath } from './utils'
import { tipc } from '@egoist/tipc/main'
import { destroyMainWindow, getMainWindow } from './window'

const t = tipc.create()

export const router = {
  // start server
  startServer: t.procedure
    .input<{
      host: string
      port: number
    }>()
    .action(async ({ input }) => {
      const { host, port } = input
      const { notificationAfterStartServer, uploadsDir } = getSettings()
      return await startServer({
        host,
        port,
        uiDir: path.join(getResPath(), 'ui'),
        uploadsDir,
        storeHandlers,
        onListening(host) {
          networkStore.increment(host)

          if (notificationAfterStartServer) {
            const notify = $notify('LAN Chat Notice', `Server started on port ${port}`)
            notify.addListener('click', () => {
              shell.openExternal(`http://${host}:${port}`)
            })
          }
        }
      }).catch((error: any) => {
        dialog.showErrorBox('Start Server Failed', error.message)
        return false
      })
    }),

  // stop server
  stopServer: t.procedure.action(async () => {
    return stopServer()
  }),

  // get ip address list
  getIpAddressList: t.procedure.action(async () => {
    return networkStore.addresses
  }),

  // open external url
  openExternalUrl: t.procedure.input<string>().action(async ({ input }) => {
    shell.openExternal(input)
  }),

  // get app version
  getAppVersion: t.procedure.action(async () => {
    return app.getVersion()
  }),

  // open uploads directory
  openUploadsDirectory: t.procedure.action(async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      defaultPath: getSettings().uploadsDir
    })
    if (canceled) return null
    return filePaths[0]
  }),

  // clean uploads directory
  cleanUploadsDirectory: t.procedure.action(async () => {
    const { uploadsDir } = getSettings()

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

    safeFiles.forEach(file => {
      fs.unlinkSync(path.join(uploadsDir, file))
    })

    dialog.showMessageBox({
      title: 'LAN Chat',
      type: 'info',
      message: `清理完成，共删除${safeFiles.length}个文件`
    })
  }),

  // clear store state
  clearStore: t.procedure.action(async () => {
    store.clear()
  }),

  // clear local app data(users & messages)
  clearAppData: t.procedure.action(async () => {
    store.reset('users')
    store.reset('messages')
  }),

  getSettings: t.procedure.action(async () => {
    return getSettings()
  }),

  saveSettings: t.procedure.input<AppStore['settings']>().action(async ({ input }) => {
    store.set('settings', input)
    if (app.isPackaged) {
      app.setLoginItemSettings({
        openAtLogin: input.autoLaunch,
        path: app.getPath('exe'),
        args: ['--hidden']
      })
    }
  }),

  resetSettings: t.procedure.action(async () => {
    store.reset('settings')
    return getSettings()
  }),

  openStoresData: t.procedure.action(async () => {
    if (import.meta.env.DEV) {
      store.openInEditor()
    } else {
      await shell.openPath(store.path)
    }
  }),

  showVersionData: t.procedure.action(async () => {
    const isPortable = process.env.PORTABLE_EXECUTABLE_DIR !== undefined
    const info = {
      版本: app.getVersion() + (isPortable ? ' (portable)' : ' (setup)'),
      Electron: process.versions.electron,
      Chromium: process.versions.chrome,
      'Node.js': process.versions.node,
      OS: `${os.type()} ${os.arch()} ${os.release()}`
    }
    await dialog.showMessageBox({
      title: '关于 LAN Chat',
      type: 'info',
      message: 'LAN Chat',
      detail: Object.entries(info)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n')
    })
  }),

  checkForUpgrade: t.procedure.action(async () => {
    return checkForUpgrade(true)
  }),

  getAiModels: t.procedure.action(async () => {
    const ai = store.get('ai')
    if (!ai) return []
    const res = await axios.get(`${ai.baseUrl}/models?type=text&sub_type=chat`, {
      headers: { Authorization: `Bearer ${ai.apiKey}` }
    })
    return res.data.data.map((v: any) => v.id)
  }),

  getAiSettings: t.procedure.action(async () => {
    return store.get('ai')
  }),

  saveAiSettings: t.procedure
    .input<{ baseUrl: string; apiKey: string; model: string }>()
    .action(async ({ input }) => {
      store.set('ai', input)
    }),

  // open devtools
  openDevtools: t.procedure.action(async () => {
    getMainWindow()?.webContents.openDevTools()
  }),

  // exit app
  exit: t.procedure.action(async () => {
    destroyMainWindow()
  })
}

export type Router = typeof router
