import { readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import type { User, UserStore } from 'lan-chat-server'

interface Store {
  users: User[]
}

const defaultStore: Store = {
  users: []
}

export const storePath = `${tmpdir()}/lan-chat-cli-store.json`

const getStore = (): Store => JSON.parse(readFileSync(storePath, 'utf8')) ?? defaultStore

function setStore(store: Store) {
  writeFileSync(storePath, JSON.stringify(store, null, 2))
}

export const userStore: UserStore = {
  findMany() {
    const store = getStore()
    return store.users
  },
  findOne(id) {
    const store = getStore()
    return store.users.find(user => user.id === id) ?? null
  },
  mutation(id, values) {
    const store = getStore()
    const user = { id, ...values }
    store.users = [...store.users.filter(u => u.id !== id), user]
    setStore(store)
    return user
  },
  deleteMany() {
    const store = getStore()
    const count = store.users.length
    store.users.length = 0
    setStore(store)
    return { count }
  }
}
