import { and, eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { ssoAppTable, userIdentityTable, userSessionTable, userTable } from '@nisshin/validation'

interface D1Database {
    prepare(query: string): D1PreparedStatement
    batch(statements: D1PreparedStatement[]): Promise<D1Result[]>
}

interface D1PreparedStatement {
    bind(...values: (string | number | Date | null)[]): D1PreparedStatement
}

interface D1Result {
    results?: Record<string, string | number | Date | null>[]
    success: boolean
    error?: string
}

interface UserRow {
    id: number
    name: string
    email: string
    createdAt: string
    updatedAt: string
}

interface AppRow {
    id: number
    appCode: string
}

interface UserIdentityRow {
    id: number
    userId: number
    appId: number
    provider: string
    providerSubject: string
}

interface UserSessionRow {
    id: string
    expiresAt: string
}

interface UpsertSsoUserPayload {
    provider: 'google' | 'line' | 'apple'
    providerSubject: string
    appCode: string
    name: string
    email: string
    expiresAt: string
    userAgent?: string
    ipAddress?: string
}

interface UpsertSsoUserResult {
    user: UserRow
    identity: UserIdentityRow
    session: UserSessionRow
}

class UserDatabase {
    async selectUserById(db: D1Database, _table: string, payload: { id: number }): Promise<{ result: UserRow | null }> {
        try {
            const database = drizzle(db as any)
            const rows = await database
                .select({
                    id: userTable.id,
                    name: userTable.name,
                    email: userTable.email,
                    createdAt: userTable.createdAt,
                    updatedAt: userTable.updatedAt,
                })
                .from(userTable)
                .where(eq(userTable.id, payload.id))
                .limit(1)
            const row = rows[0] as UserRow | undefined
            return { result: row ?? null }
        } catch (error) {
            console.error('selectUserById error', error)
            return { result: null }
        }
    }

    async updateUserById(
        db: D1Database,
        _table: string,
        payload: { id: number; name?: string; email?: string },
    ): Promise<{ result: UserRow | null }> {
        try {
            const updates: { name?: string; email?: string; updatedAt: string } = {
                updatedAt: new Date().toISOString(),
            }

            if (payload.name !== undefined) {
                updates.name = payload.name
            }
            if (payload.email !== undefined) {
                updates.email = payload.email
            }

            const database = drizzle(db as any)
            const rows = await database
                .update(userTable)
                .set(updates)
                .where(eq(userTable.id, payload.id))
                .returning({
                    id: userTable.id,
                    name: userTable.name,
                    email: userTable.email,
                    createdAt: userTable.createdAt,
                    updatedAt: userTable.updatedAt,
                })

            const row = rows[0] as UserRow | undefined
            return { result: row ?? null }
        } catch (error) {
            console.error('updateUserById error', error)
            return { result: null }
        }
    }

    async deleteUserById(db: D1Database, _table: string, payload: { id: number }): Promise<{ result: UserRow | null }> {
        try {
            const database = drizzle(db as any)
            await database
                .delete(userSessionTable)
                .where(eq(userSessionTable.userId, payload.id))

            await database
                .delete(userIdentityTable)
                .where(eq(userIdentityTable.userId, payload.id))

            const rows = await database
                .delete(userTable)
                .where(eq(userTable.id, payload.id))
                .returning({
                    id: userTable.id,
                    name: userTable.name,
                    email: userTable.email,
                    createdAt: userTable.createdAt,
                    updatedAt: userTable.updatedAt,
                })

            const row = rows[0] as UserRow | undefined
            return { result: row ?? null }
        } catch (error) {
            console.error('deleteUserById error', error)
            return { result: null }
        }
    }

    async upsertSsoUser(db: D1Database, _table: string, payload: UpsertSsoUserPayload): Promise<{ result: UpsertSsoUserResult | null }> {
        try {
            const now = new Date().toISOString()
            const database = drizzle(db as any)

            let appRow: AppRow | null = null
            {
                const appRows = await database
                    .select({
                        id: ssoAppTable.id,
                        appCode: ssoAppTable.appCode,
                    })
                    .from(ssoAppTable)
                    .where(eq(ssoAppTable.appCode, payload.appCode))
                    .limit(1)

                appRow = (appRows[0] as AppRow | undefined) ?? null
            }

            if (!appRow) {
                const insertedApps = await database
                    .insert(ssoAppTable)
                    .values({
                        appCode: payload.appCode,
                        displayName: payload.appCode,
                        createdAt: now,
                        updatedAt: now,
                    })
                    .returning({
                        id: ssoAppTable.id,
                        appCode: ssoAppTable.appCode,
                    })
                appRow = (insertedApps[0] as AppRow | undefined) ?? null
            }

            if (!appRow) {
                return { result: null }
            }

            let identityRow: UserIdentityRow | null = null
            {
                const identities = await database
                    .select({
                        id: userIdentityTable.id,
                        userId: userIdentityTable.userId,
                        appId: userIdentityTable.appId,
                        provider: userIdentityTable.provider,
                        providerSubject: userIdentityTable.providerSubject,
                    })
                    .from(userIdentityTable)
                    .where(
                        and(
                            eq(userIdentityTable.appId, appRow.id),
                            eq(userIdentityTable.provider, payload.provider),
                            eq(userIdentityTable.providerSubject, payload.providerSubject),
                        ),
                    )
                    .limit(1)

                identityRow = (identities[0] as UserIdentityRow | undefined) ?? null
            }

            let userRow: UserRow | null = null

            if (!identityRow) {
                const insertedUsers = await database
                    .insert(userTable)
                    .values({
                        name: payload.name,
                        email: payload.email,
                        createdAt: now,
                        updatedAt: now,
                    })
                    .returning({
                        id: userTable.id,
                        name: userTable.name,
                        email: userTable.email,
                        createdAt: userTable.createdAt,
                        updatedAt: userTable.updatedAt,
                    })
                userRow = (insertedUsers[0] as UserRow | undefined) ?? null

                if (!userRow) {
                    return { result: null }
                }

                const insertedIdentities = await database
                    .insert(userIdentityTable)
                    .values({
                        userId: userRow.id,
                        appId: appRow.id,
                        provider: payload.provider,
                        providerSubject: payload.providerSubject,
                        emailSnapshot: payload.email,
                        nameSnapshot: payload.name,
                        createdAt: now,
                        updatedAt: now,
                    })
                    .returning({
                        id: userIdentityTable.id,
                        userId: userIdentityTable.userId,
                        appId: userIdentityTable.appId,
                        provider: userIdentityTable.provider,
                        providerSubject: userIdentityTable.providerSubject,
                    })

                identityRow = (insertedIdentities[0] as UserIdentityRow | undefined) ?? null
            } else {
                const updatedUsers = await database
                    .update(userTable)
                    .set({
                        name: payload.name,
                        email: payload.email,
                        updatedAt: now,
                    })
                    .where(eq(userTable.id, identityRow.userId))
                    .returning({
                        id: userTable.id,
                        name: userTable.name,
                        email: userTable.email,
                        createdAt: userTable.createdAt,
                        updatedAt: userTable.updatedAt,
                    })
                userRow = (updatedUsers[0] as UserRow | undefined) ?? null

                await database
                    .update(userIdentityTable)
                    .set({
                        emailSnapshot: payload.email,
                        nameSnapshot: payload.name,
                        updatedAt: now,
                    })
                    .where(eq(userIdentityTable.id, identityRow.id))
            }

            if (!identityRow || !userRow) {
                return { result: null }
            }

            const sessionId = crypto.randomUUID()
            const insertedSessions = await database
                .insert(userSessionTable)
                .values({
                    id: sessionId,
                    userId: userRow.id,
                    identityId: identityRow.id,
                    appId: appRow.id,
                    issuedAt: now,
                    expiresAt: payload.expiresAt,
                    revokedAt: null,
                    userAgent: payload.userAgent ?? null,
                    ipAddress: payload.ipAddress ?? null,
                    createdAt: now,
                })
                .returning({
                    id: userSessionTable.id,
                    expiresAt: userSessionTable.expiresAt,
                })

            const sessionRow = (insertedSessions[0] as UserSessionRow | undefined) ?? null

            if (!sessionRow) {
                return { result: null }
            }

            return {
                result: {
                    user: userRow,
                    identity: identityRow,
                    session: sessionRow,
                },
            }
        } catch (error) {
            console.error('upsertSsoUser error', error)
            return { result: null }
        }
    }
}

export default UserDatabase
