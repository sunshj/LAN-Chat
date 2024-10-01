import process from 'node:process'
import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer } from 'electron'

// Custom APIs for renderer
/// sorted
export const api = {
  checkForUpgrade: () => ipcRenderer.invoke('check-for-upgrade'),
  cleanStores: () => ipcRenderer.invoke('clean-stores'),
  cleanUploads: () => ipcRenderer.invoke('clean-uploads-dir'),
  fetchReleases: () => ipcRenderer.invoke('fetch-releases'),
  getNetworks: () => ipcRenderer.invoke('get-networks'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  getVersion: () => ipcRenderer.invoke('get-version'),
  open: (url: string) => ipcRenderer.invoke('open-url', url),
  openDevtools: () => ipcRenderer.invoke('open-devtools'),
  openUploadsDir: () => ipcRenderer.invoke('open-uploads-dir'),
  resetSettings: () => ipcRenderer.invoke('reset-settings'),
  saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),
  startServer: (data: { host: string; port: number }) => ipcRenderer.invoke('start-server', data),
  stopServer: () => ipcRenderer.invoke('stop-server')
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
