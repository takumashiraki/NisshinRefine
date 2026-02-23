import { and, eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { userTable } from '@nisshin/validation'

interface D1Database {
  prepare(query: string): D1PreparedStatement
  batch(statements: D1PreparedStatement[]): Promise<D1Result[]>
}

interface D1PreparedStatement {
  bind(...values: (string | number | Date | null)[]): D1PreparedStatement
}

interface D1Result {
  results?: Record<string, string | number | Date>[]
  success: boolean
  error?: string
}

interface UserRow {
  id: number
  userId: string
  password: string
}

class UserDatabase {
  async createUser(
    db: D1Database,
    _table: string,
    payload: { userId: string; password: string },
  ): Promise<{ result: UserRow | null }> {
    try {
      const database = drizzle(db as any)
      const rows = await database
        .insert(userTable)
        .values({ userId: payload.userId, password: payload.password })
        .returning({
          id: userTable.id,
          userId: userTable.userId,
          password: userTable.password,
        })
      const row = rows[0] as UserRow | undefined
      return { result: row ?? null }
    } catch (error) {
      console.error('createUser error', error)
      return { result: null }
    }
  }

  async selectUser(
    db: D1Database,
    _table: string,
    payload: { userId: string },
  ): Promise<{ result: UserRow | null }> {
    try {
      const database = drizzle(db as any)
      const rows = await database
        .select({
          id: userTable.id,
          userId: userTable.userId,
          password: userTable.password,
        })
        .from(userTable)
        .where(eq(userTable.userId, payload.userId))
        .limit(1)
      const row = rows[0] as UserRow | undefined
      return { result: row ?? null }
    } catch (error) {
      console.error('selectUser error', error)
      return { result: null }
    }
  }

  async updateUser(
    db: D1Database,
    _table: string,
    payload: { userId: string; password: string },
  ): Promise<{ result: UserRow | null }> {
    try {
      const database = drizzle(db as any)
      const rows = await database
        .update(userTable)
        .set({ password: payload.password })
        .where(eq(userTable.userId, payload.userId))
        .returning({
          id: userTable.id,
          userId: userTable.userId,
          password: userTable.password,
        })
      const row = rows[0] as UserRow | undefined
      return { result: row ?? null }
    } catch (error) {
      console.error('updateUser error', error)
      return { result: null }
    }
  }

  async deleteUser(db: D1Database, _table: string, payload: { userId: string }): Promise<{ result: UserRow | null }> {
    try {
      const database = drizzle(db as any)
      const rows = await database
        .delete(userTable)
        .where(and(eq(userTable.userId, payload.userId)))
        .returning({
          id: userTable.id,
          userId: userTable.userId,
          password: userTable.password,
        })
      const row = rows[0] as UserRow | undefined
      return { result: row ?? null }
    } catch (error) {
      console.error('deleteUser error', error)
      return { result: null }
    }
  }
}

export default UserDatabase
