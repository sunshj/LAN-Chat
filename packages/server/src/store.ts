import type { Awaitable, Message, User } from './types'

export interface Store {
  users: User[]
  messages: Message[]
}

export const defaultStore: Store = {
  users: [],
  messages: []
}

export type StoreHandlers = {
  get: () => Awaitable<Store>
  set: (store: Store) => Awaitable<void>
}

export type UserStore = {
  findMany: () => Awaitable<User[]>
  findOne: (id: string) => Awaitable<User | null>
  mutation: (id: string, values: Omit<User, 'id'>) => Awaitable<User>
  deleteMany: () => Awaitable<{ count: number }>
}

export function toUserStore(storeHandlers: StoreHandlers): UserStore {
  return {
    async findMany() {
      const store = await storeHandlers.get()
      return store.users
    },
    async findOne(id) {
      const store = await storeHandlers.get()
      return store.users.find(user => user.id === id) ?? null
    },
    async mutation(id, values) {
      const store = await storeHandlers.get()
      const user = { id, ...values }
      store.users = [...store.users.filter(u => u.id !== id), user]
      await storeHandlers.set(store)
      return user
    },
    async deleteMany() {
      const store = await storeHandlers.get()
      const count = store.users.length
      store.users.length = 0
      await storeHandlers.set(store)
      return { count }
    }
  }
}

export type GroupChatMessageStore = {
  findMany: () => Awaitable<Message[]>
  findOne: (mid: string) => Awaitable<Message | null>
  create: (message: Message) => Awaitable<Message>
  deleteMany: () => Awaitable<void>
}

export function toGroupChatMessageStore(storeHandlers: StoreHandlers): GroupChatMessageStore {
  return {
    async create(message) {
      const store = await storeHandlers.get()
      store.messages.push(message)
      await storeHandlers.set(store)
      return message
    },

    async findMany() {
      const store = await storeHandlers.get()
      return store.messages
    },

    async findOne(mid) {
      const store = await storeHandlers.get()
      return store.messages.find(message => message.mid === mid) ?? null
    },

    async deleteMany() {
      const store = await storeHandlers.get()
      store.messages.length = 0
      await storeHandlers.set(store)
    }
  }
}
