import path from 'node:path'
import Store from 'electron-store'
import { getNetworkAddresses, getResPath, isEmptyObj } from './utils'
import type { Message, StoreHandlers } from 'lan-chat-server'

interface User {
  id: string
  username: string
}

interface AppStore {
  /** store data */
  users: User[]
  messages: Message[]

  /** internal app settings */
  internalSettings: {
    networks: Record<string, number>
    quitApp: 'quit' | 'minimize' | 'none'
    quitAppTipShown: boolean
    quitAppForUpdate: boolean
  }

  /** exposed app settings */
  settings: {
    uploadsDir: string
    notificationAfterStartServer: boolean
    autoCheckUpgrade: boolean
  }
}

export const store = new Store<AppStore>({
  name: 'stores',
  defaults: {
    users: [],
    messages: [],
    internalSettings: {
      networks: {},
      quitApp: 'none',
      quitAppTipShown: false,
      quitAppForUpdate: false
    },
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

export function getSettings() {
  const settings = store.get('settings')
  return {
    ...settings,
    uploadsDir: settings.uploadsDir || path.join(getResPath(), 'uploads')
  }
}

export const networkStore = {
  get networks() {
    return store.get('internalSettings').networks ?? {}
  },

  get addresses() {
    if (isEmptyObj(this.networks)) {
      store.set(
        'internalSettings.networks',
        getNetworkAddresses().reduce((acc, item) => ((acc[item] = 0), acc), {})
      )
    }

    return Object.entries(this.networks)
      .sort((a, b) => b[1] - a[1])
      .map(([ip]) => ip)
  },

  increment(ip: string) {
    const count = this.networks[ip] ?? 0
    store.set('internalSettings.networks', {
      ...this.networks,
      [ip]: count + 1
    })
  }
}
