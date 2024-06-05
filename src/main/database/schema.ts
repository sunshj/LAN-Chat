import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createId } from '@paralleldrive/cuid2'

export const users = sqliteTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  username: text('username)').notNull()
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
