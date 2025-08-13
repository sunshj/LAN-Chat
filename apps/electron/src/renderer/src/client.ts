import { createClient } from '@egoist/tipc/renderer'
import { Router } from 'src/main/ipc'

export const client = createClient<Router>({
  ipcInvoke: window.electron.ipcRenderer.invoke
})
