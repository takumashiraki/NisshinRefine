import type { Context } from 'hono'
import UserDatabase from './../../infrastructure/user'
import type { Env } from './../../app'
import { errorResponse } from './../response'

export const updateUser = async (
    c: Context<
        Env,
        '/users/{id}',
        {
            in: {
                param: {
                    id: number
                }
                json: {
                    name?: string
                    email?: string
                }
            }
        }
    >,
): Promise<Response> => {
    const env = c.env
    const params = c.req.param()
    const payload = await c.req.json()
    const db = new UserDatabase()

    if (payload.name === undefined && payload.email === undefined) {
        return errorResponse(c, 400, 'Invalid Request', '', 'name or email is required')
    }

    let updated
    try {
        ;({ result: updated } = await db.updateUserById(env.backend, 'user', {
            id: Number(params.id),
            name: payload.name,
            email: payload.email,
        }))
    } catch (error) {
        console.error('updateUser failed', error)
        return errorResponse(c, 500, 'Internal Server Error', '', '')
    }

    if (!updated) {
        return errorResponse(c, 404, 'Resource Not Found', '', '')
    }

    return c.json({ id: updated.id, name: updated.name, email: updated.email }, 200)
}
