import type { User } from './types'

export interface Store {
  users: User[]
}

export const defaultStore: Store = {
  users: []
}

export type StoreHandlers = {
  get: () => Store
  set: (store: Store) => void
}

export type UserStore = {
  findMany: () => User[]
  findOne: (id: string) => User | null
  mutation: (id: string, values: Omit<User, 'id'>) => User
  deleteMany: () => { count: number }
}

export function toUserStore(storeHandlers: StoreHandlers): UserStore {
  return {
    findMany() {
      const store = storeHandlers.get()
      return store.users
    },
    findOne(id) {
      const store = storeHandlers.get()
      return store.users.find(user => user.id === id) ?? null
    },
    mutation(id, values) {
      const store = storeHandlers.get()
      const user = { id, ...values }
      store.users = [...store.users.filter(u => u.id !== id), user]
      storeHandlers.set(store)
      return user
    },
    deleteMany() {
      const store = storeHandlers.get()
      const count = store.users.length
      store.users.length = 0
      storeHandlers.set(store)
      return { count }
    }
  }
}
