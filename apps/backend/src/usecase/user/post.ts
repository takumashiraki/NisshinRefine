import type { Context } from 'hono'
import UserDatabase from './../../infrastructure/user'
import type { Env } from './../../app'
import { errorResponse } from './../response'

type SupportedProvider = 'google' | 'line' | 'apple'

export const createUser = async (
    c: Context<
        Env,
        '/users',
        {
            in: {
                json: {
                    provider: SupportedProvider
                    providerSubject: string
                    appCode: string
                    name: string
                    email: string
                    expiresAt: string
                    userAgent?: string
                    ipAddress?: string
                }
            }
        }
    >,
): Promise<Response> => {
    const env = c.env
    const payload = await c.req.json()
    const db = new UserDatabase()

    if (!payload.provider || !payload.providerSubject || !payload.appCode || !payload.name || !payload.email || !payload.expiresAt) {
        return errorResponse(c, 400, 'Invalid Request', '', 'provider, providerSubject, appCode, name, email, expiresAt are required')
    }

    let upserted
    try {
        ;({ result: upserted } = await db.upsertSsoUser(env.backend, 'user', payload))
    } catch (error) {
        console.error('upsertSsoUser failed', error)
        return errorResponse(c, 500, 'Internal Server Error', '', '')
    }

    if (!upserted) {
        return errorResponse(c, 500, 'Internal Server Error', '', '')
    }

    return c.json(
        {
            user: {
                id: upserted.user.id,
                name: upserted.user.name,
                email: upserted.user.email,
            },
            identity: {
                id: upserted.identity.id,
                provider: upserted.identity.provider,
                appCode: payload.appCode,
            },
            session: {
                sessionId: upserted.session.id,
                expiresAt: upserted.session.expiresAt,
            },
        },
        200,
    )
}
