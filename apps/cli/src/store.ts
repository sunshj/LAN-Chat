import { readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { defaultStore, type StoreHandlers } from 'lan-chat-server'

export const storePath = `${tmpdir()}/lan-chat-cli-store.json`

export const storeHandlers: StoreHandlers = {
  get() {
    return JSON.parse(readFileSync(storePath, 'utf8')) ?? defaultStore
  },
  set(store) {
    writeFileSync(storePath, JSON.stringify(store, null, 2))
  }
}
