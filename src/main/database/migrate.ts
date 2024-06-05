import path from 'node:path'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { db } from '.'

export function runMigrate() {
  console.log('Running migrations...', path.join(__dirname, '../../drizzle'))
  migrate(db, {
    migrationsFolder: path.join(__dirname, '../../drizzle')
  })
}
