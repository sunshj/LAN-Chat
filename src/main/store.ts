import Store from 'electron-store'

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
  defaults: {
    users: [],
    networks: {},
    quitApp: 'none',
    quitAppTipChecked: false
  }
})

export const users = {
  findMany() {
    return store.get('users', [])
  },
  findOne(id: string) {
    return store.get('users', [])?.find(user => user.id === id) ?? null
  },
  mutation(id: string, values: Omit<User, 'id'>) {
    store.set('users', [...store.get('users', []).filter(u => u.id !== id), { id, ...values }])
    return { id, ...values }
  },
  deleteMany() {
    const count = store.get('users', []).length
    store.set('users', [])
    return { count }
  }
}

export const networks = {
  get value() {
    const networks = store.get('networks', {})
    return Object.entries(networks)
      .sort((a, b) => b[1] - a[1])
      .map(v => v[0])
  },
  incr(ip: string) {
    const count = store.get('networks', {})[ip] ?? 0
    store.set('networks', { ...store.get('networks', {}), [ip]: count + 1 })
  },
  decr(ip: string) {
    const count = store.get('networks', {})[ip] ?? 0
    if (count > 0) {
      store.set('networks', { ...store.get('networks', {}), [ip]: count - 1 })
    }
  }
}
