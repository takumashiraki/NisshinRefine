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
    table: string,
    payload: { userId: string; password: string },
  ): Promise<{ result: UserRow | null }> {
    try {
      const query = `INSERT INTO ${table} (userId, password) VALUES (?, ?) RETURNING id, userId, password`
      const results = await db.batch([db.prepare(query).bind(payload.userId, payload.password)])
      const row = results[0]?.results?.[0] as UserRow | undefined
      return { result: row ?? null }
    } catch (error) {
      console.error('createUser error', error)
      return { result: null }
    }
  }

  async selectUser(
    db: D1Database,
    table: string,
    payload: { userId: string },
  ): Promise<{ result: UserRow | null }> {
    try {
      const query = `SELECT id, userId, password FROM ${table} WHERE userId = ? LIMIT 1`
      const results = await db.batch([db.prepare(query).bind(payload.userId)])
      const row = results[0]?.results?.[0] as UserRow | undefined
      return { result: row ?? null }
    } catch (error) {
      console.error('selectUser error', error)
      return { result: null }
    }
  }

  async updateUser(
    db: D1Database,
    table: string,
    payload: { userId: string; password: string },
  ): Promise<{ result: UserRow | null }> {
    try {
      const query = `UPDATE ${table} SET password = ? WHERE userId = ? RETURNING id, userId, password`
      const results = await db.batch([db.prepare(query).bind(payload.password, payload.userId)])
      const row = results[0]?.results?.[0] as UserRow | undefined
      return { result: row ?? null }
    } catch (error) {
      console.error('updateUser error', error)
      return { result: null }
    }
  }

  async deleteUser(db: D1Database, table: string, payload: { userId: string }): Promise<{ result: UserRow | null }> {
    try {
      const query = `DELETE FROM ${table} WHERE userId = ? RETURNING id, userId, password`
      const results = await db.batch([db.prepare(query).bind(payload.userId)])
      const row = results[0]?.results?.[0] as UserRow | undefined
      return { result: row ?? null }
    } catch (error) {
      console.error('deleteUser error', error)
      return { result: null }
    }
  }
}

export default UserDatabase
