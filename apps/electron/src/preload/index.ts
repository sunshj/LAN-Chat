import process from 'node:process'
import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer } from 'electron'

// Custom APIs for renderer
/// sorted
export const api = {
  checkForUpgrade: (show?: boolean) => ipcRenderer.invoke('check-for-upgrade', show),
  cleanAppData: () => ipcRenderer.invoke('clean-app-data'),
  cleanStores: () => ipcRenderer.invoke('clean-stores'),
  cleanUploads: () => ipcRenderer.invoke('clean-uploads-dir'),
  exitApp: () => ipcRenderer.invoke('exit-app'),
  getAIModels: () => ipcRenderer.invoke('get-ai-models'),
  getAISettings: () => ipcRenderer.invoke('get-ai-settings'),
  getIPAddresses: () => ipcRenderer.invoke('get-ip-addresses'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  getVersion: () => ipcRenderer.invoke('get-version'),
  open: (url: string) => ipcRenderer.invoke('open-url', url),
  openDevtools: () => ipcRenderer.invoke('open-devtools'),
  openStoresData: () => ipcRenderer.invoke('open-stores-data'),
  openUploadsDir: () => ipcRenderer.invoke('open-uploads-dir'),
  resetSettings: () => ipcRenderer.invoke('reset-settings'),
  saveAISettings: (data: { baseUrl: string; apiKey: string; model: string }) =>
    ipcRenderer.invoke('save-ai-settings', data),
  saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),
  showVersionData: () => ipcRenderer.invoke('show-version-data'),
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
