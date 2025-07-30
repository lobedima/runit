import { pgTable, text, timestamp, integer, serial } from 'drizzle-orm/pg-core';

export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: serial('id').primaryKey(),
  token: text('token').notNull(),
  email: text('email').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').default(false),
  userId: integer('user_id').references(() => users.id)
});