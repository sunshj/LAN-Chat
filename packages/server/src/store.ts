import { ofetch } from 'ofetch'
import type { Awaitable, Message, User } from './types'

export interface Store {
  users: User[]
  messages: Message[]
  ai?: {
    baseUrl: string
    apiKey: string
    model: string
  }
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

export type AiStore = {
  getConfig: () => Awaitable<{ enable: boolean; model: string }>
  getModels: () => Awaitable<string[]>
  chat: (message: string) => Awaitable<any>
}

export function toAiStore(storeHandlers: StoreHandlers): AiStore {
  return {
    async getConfig() {
      const { ai } = await storeHandlers.get()
      return {
        enable: !!ai && !!ai.baseUrl && !!ai.apiKey && !!ai.model,
        model: ai?.model ?? 'unknown'
      }
    },
    async getModels() {
      const { ai } = await storeHandlers.get()
      if (!ai) return []
      const { data } = await ofetch(`${ai?.baseUrl}/models?type=text&sub_type=chat`, {
        headers: {
          Authorization: `Bearer ${ai?.apiKey}`
        }
      })
      return (data as Array<{ id: string }>).map(v => v.id)
    },

    async chat(message) {
      const { ai } = await storeHandlers.get()
      return ofetch(`${ai?.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ai?.apiKey}`
        },
        body: {
          model: ai?.model,
          messages: [
            {
              role: 'system',
              content:
                '你是一个聊天机器人，你可以回答任何问题；你可以使用markdown语法来格式化你的回答，但是你必须使用“---md”加换行符作为第一行的内容来标记你的回答是markdown格式'
            },
            {
              role: 'user',
              content: message
            }
          ]
        }
      })
    }
  }
}
