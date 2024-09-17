import path from 'node:path'
import { app, ipcMain, shell } from 'electron'
import { startServer, stopServer } from 'lan-chat-server'
import { networkStore, store, userStore } from './store'
import { $notify, fetchReleases, getNetworksAddr, getResPath, isEmptyObj } from './utils'

export function ipcHandler() {
  ipcMain.handle('start-server', (_, { host, port }) =>
    startServer({
      host,
      port,
      uiPath: path.join(getResPath(), 'ui'),
      uploadsPath: path.join(getResPath(), 'uploads'),
      userStore,
      onListening(host) {
        networkStore.incr(host)
        const notify = $notify('LAN Chat Notice', `Server started on port ${port}`)
        notify.addListener('click', () => {
          shell.openExternal(`http://${host}:${port}`)
        })
      }
    })
  )

  ipcMain.handle('stop-server', () => stopServer())

  ipcMain.handle('get-networks', () => {
    if (isEmptyObj(store.get('networks'))) {
      const networks = getNetworksAddr().reduce((acc, item) => ((acc[item] = 0), acc), {})
      store.set('networks', networks)
    }

    return networkStore.value
  })

  ipcMain.handle('open-url', (_, url) => shell.openExternal(url))

  ipcMain.handle('fetch-releases', fetchReleases)

  ipcMain.handle('get-version', () => app.getVersion())
}
