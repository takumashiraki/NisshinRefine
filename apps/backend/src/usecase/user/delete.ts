import type { Context } from 'hono'
import UserDatabase from './../../infrastructure/user'
import type { Env } from './../../app'
import { errorResponse } from './../response'

export const deleteUser = async (
    c: Context<
        Env,
        '/users/{id}',
        {
            in: {
                param: {
                    id: number
                }
            }
        }
    >,
): Promise<Response> => {
    const env = c.env
    const params = c.req.param()
    const db = new UserDatabase()

    let deleted
    try {
        ;({ result: deleted } = await db.deleteUserById(env.backend, 'user', { id: Number(params.id) }))
    } catch (error) {
        console.error('deleteUser failed', error)
        return errorResponse(c, 500, 'Internal Server Error', '', '')
    }

    if (!deleted) {
        return errorResponse(c, 404, 'Resource Not Found', '', '')
    }

    return c.json({ id: deleted.id, name: deleted.name, email: deleted.email }, 200)
}
