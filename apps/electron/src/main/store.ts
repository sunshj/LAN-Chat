import path from 'node:path'
import ElectronStore from 'electron-store'
import { getNetworkAddresses, getResPath, isEmptyObj } from './utils'
import type { Store, StoreHandlers } from 'lan-chat-server'

interface AppStore extends Store {
  /** internal app settings */
  internalSettings: {
    networks: Record<string, number>
    quitApp: 'quit' | 'minimize' | 'none'
    quitAppTipShown: boolean
    quitAppForUpdate: boolean
  }

  /** exposed app settings */
  settings: {
    server: {
      host: string
      port: number
    }
    uploadsDir: string
    notificationAfterStartServer: boolean
    autoCheckUpgrade: boolean
    autoLaunch: boolean
    enableAI: boolean
  }
}

export const store = new ElectronStore<AppStore>({
  name: 'stores',
  defaults: {
    users: [],
    messages: [],
    ai: {
      baseUrl: '',
      apiKey: '',
      model: ''
    },
    internalSettings: {
      networks: {},
      quitApp: 'none',
      quitAppTipShown: false,
      quitAppForUpdate: false
    },
    settings: {
      server: {
        host: '127.0.0.1',
        port: 3000
      },
      uploadsDir: '',
      notificationAfterStartServer: true,
      autoCheckUpgrade: false,
      autoLaunch: false,
      enableAI: false
    }
  }
})

export const storeHandlers: StoreHandlers = {
  get() {
    return {
      users: store.get('users', []),
      messages: store.get('messages', []),
      ai: store.get('ai')
    }
  },
  set(_store) {
    store.set('users', _store.users)
    store.set('messages', _store.messages)
    store.set('ai', _store.ai)
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
