import Store from 'electron-store'
import { getNetworksAddr, getResPath, isEmptyObj } from './utils'
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

  settings: {
    uploadsDir: string
    notification: boolean
    autoCheckUpgrade: boolean
  }
}>({
  name: 'stores',
  cwd: getResPath(),
  defaults: {
    users: [],
    networks: {},
    quitApp: 'none',
    quitAppTipChecked: false,
    settings: {
      uploadsDir: '',
      notification: true,
      autoCheckUpgrade: false
    }
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
    if (isEmptyObj(store.get('networks'))) {
      store.set(
        'networks',
        getNetworksAddr().reduce((acc, item) => ((acc[item] = 0), acc), {})
      )
    }

    return Object.entries(store.get('networks'))
      .sort((a, b) => b[1] - a[1])
      .map(([ip]) => ip)
  },

  incr(ip: string) {
    const count = store.get('networks', {})[ip] ?? 0
    store.set('networks', { ...store.get('networks', {}), [ip]: count + 1 })
  }
}
