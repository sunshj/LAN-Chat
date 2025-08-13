import { createClient } from '@egoist/tipc/renderer'
import type { Router } from 'src/main/ipc'

export const client = createClient<Router>({
  ipcInvoke: window.electron.ipcRenderer.invoke
})
