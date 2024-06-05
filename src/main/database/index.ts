import path from 'node:path'
import fs from 'node:fs'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { getResPath } from '../utils'
import * as schema from './schema'

const dbPath = path.join(getResPath(), 'database', 'sqlite.db')
fs.mkdirSync(path.dirname(dbPath), { recursive: true })

const sqlite = new Database(dbPath)

export const db = drizzle(sqlite, { schema })

export { users } from './schema'
export type { NewUser, User } from './schema'
