import { readFileSync, writeFileSync } from 'node:fs'
import { defaultStore, type StoreHandlers } from 'lan-chat-server'

export function createStoreHandlers(storePath: string): StoreHandlers {
  return {
    get() {
      return JSON.parse(readFileSync(storePath, 'utf8')) ?? defaultStore
    },
    set(store) {
      writeFileSync(storePath, JSON.stringify(store, null, 2))
    }
  }
}
