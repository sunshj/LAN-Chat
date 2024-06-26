import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
export const api = {
  startServer: (data: { host: string; port: number }) => ipcRenderer.invoke('start-server', data),
  stopServer: () => ipcRenderer.invoke('stop-server'),
  getNetworks: () => ipcRenderer.invoke('get-networks'),
  open: (url: string) => ipcRenderer.invoke('open-url', url),
  fetchReleases: () => ipcRenderer.invoke('fetch-releases'),
  getVersion: () => ipcRenderer.invoke('get-version')
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
