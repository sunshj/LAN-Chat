import Store from 'electron-store'
import { getNetworkAddresses, isEmptyObj } from './utils'
import type { Message, StoreHandlers } from 'lan-chat-server'

interface User {
  id: string
  username: string
}

export const store = new Store<{
  /** store data */
  users: User[]
  messages: Message[]

  /** app settings */
  networks: Record<string, number>
  quitApp: 'quit' | 'minimize' | 'none'
  quitAppTipChecked: boolean

  settings: {
    uploadsDir: string
    notificationAfterStartServer: boolean
    autoCheckUpgrade: boolean
  }
}>({
  name: 'stores',
  defaults: {
    users: [],
    messages: [],
    networks: {},
    quitApp: 'none',
    quitAppTipChecked: false,
    settings: {
      uploadsDir: '',
      notificationAfterStartServer: true,
      autoCheckUpgrade: false
    }
  }
})

export const storeHandlers: StoreHandlers = {
  get() {
    return {
      users: store.get('users', []),
      messages: store.get('messages', [])
    }
  },
  set(_store) {
    store.set('users', _store.users)
    store.set('messages', _store.messages)
  }
}

export const networkStore = {
  get value() {
    if (isEmptyObj(store.get('networks'))) {
      store.set(
        'networks',
        getNetworkAddresses().reduce((acc, item) => ((acc[item] = 0), acc), {})
      )
    }

    return Object.entries(store.get('networks'))
      .sort((a, b) => b[1] - a[1])
      .map(([ip]) => ip)
  },

  increment(ip: string) {
    const count = store.get('networks', {})[ip] ?? 0
    store.set('networks', { ...store.get('networks', {}), [ip]: count + 1 })
  }
}
