import { eq } from 'drizzle-orm'
import { usersTable } from '@nisshin/validation'
import { createDb } from './db/client'

interface UserRow {
  id: number
  userId: string
  password: string
}

class UserDatabase {
  async createUser(dbBinding: unknown, payload: { userId: string; password: string }): Promise<{ result: UserRow | null }> {
    try {
      const db = createDb(dbBinding)
      const [created] = await db
        .insert(usersTable)
        .values({
          userId: payload.userId,
          password: payload.password,
        })
        .returning({
          id: usersTable.id,
          userId: usersTable.userId,
          password: usersTable.password,
        })

      return { result: created ?? null }
    } catch (error) {
      console.error('createUser error', error)
      return { result: null }
    }
  }

  async selectUser(dbBinding: unknown, payload: { userId: string }): Promise<{ result: UserRow | null }> {
    try {
      const db = createDb(dbBinding)
      const [selected] = await db
        .select({
          id: usersTable.id,
          userId: usersTable.userId,
          password: usersTable.password,
        })
        .from(usersTable)
        .where(eq(usersTable.userId, payload.userId))
        .limit(1)

      return { result: selected ?? null }
    } catch (error) {
      console.error('selectUser error', error)
      return { result: null }
    }
  }

  async updateUser(dbBinding: unknown, payload: { userId: string; password: string }): Promise<{ result: UserRow | null }> {
    try {
      const db = createDb(dbBinding)
      const [updated] = await db
        .update(usersTable)
        .set({
          password: payload.password,
        })
        .where(eq(usersTable.userId, payload.userId))
        .returning({
          id: usersTable.id,
          userId: usersTable.userId,
          password: usersTable.password,
        })

      return { result: updated ?? null }
    } catch (error) {
      console.error('updateUser error', error)
      return { result: null }
    }
  }

  async deleteUser(dbBinding: unknown, payload: { userId: string }): Promise<{ result: UserRow | null }> {
    try {
      const db = createDb(dbBinding)
      const [deleted] = await db
        .delete(usersTable)
        .where(eq(usersTable.userId, payload.userId))
        .returning({
          id: usersTable.id,
          userId: usersTable.userId,
          password: usersTable.password,
        })

      return { result: deleted ?? null }
    } catch (error) {
      console.error('deleteUser error', error)
      return { result: null }
    }
  }
}

export default UserDatabase
