import type { Context } from 'hono'
import UserDatabase from './../../infrastructure/user'
import type { Env } from './../../app'
import { errorResponse } from './../response'

export const updateUser = async (
  c: Context<
    Env,
    '/users/{userId}',
    {
      in: {
        param: {
          userId: string
        }
        json: {
          password: string
        }
      }
    }
  >,
): Promise<Response> => {
  const env = c.env
  const params = c.req.param()
  const payload = await c.req.json()
  const db = new UserDatabase()

  let updated
  try {
    ;({ result: updated } = await db.updateUser(env.backend, 'user', { userId: params.userId, password: payload.password }))
  } catch (error) {
    console.error('updateUser failed', error)
    return errorResponse(c, 500, 'Internal Server Error', '', '')
  }

  if (!updated) {
    return errorResponse(c, 404, 'Resource Not Found', '', '')
  }

  return c.json({ userId: updated.userId, id: updated.id, password: updated.password }, 200)
}
