import Store from 'electron-store'
import { getResPath } from './utils'
import type { StoreHandlers } from 'lan-chat-server'

interface User {
  id: string
  username: string
}

export const store = new Store<{
  users: User[]
  networks: Record<string, number>
  quitApp: 'quit' | 'minimize' | 'none'
  quitAppTipChecked: boolean
}>({
  name: 'stores',
  cwd: getResPath(),
  defaults: {
    users: [],
    networks: {},
    quitApp: 'none',
    quitAppTipChecked: false
  }
})

export const storeHandlers: StoreHandlers = {
  get() {
    return {
      users: store.get('users', [])
    }
  },
  set(_store) {
    store.set('users', _store.users)
  }
}

export const networkStore = {
  get value() {
    const networks = store.get('networks', {})
    return Object.entries(networks)
      .sort((a, b) => b[1] - a[1])
      .map(([ip]) => ip)
  },
  incr(ip: string) {
    const count = store.get('networks', {})[ip] ?? 0
    store.set('networks', { ...store.get('networks', {}), [ip]: count + 1 })
  }
}
