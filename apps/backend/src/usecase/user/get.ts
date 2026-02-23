import type { Context } from 'hono'
import UserDatabase from './../../infrastructure/user'
import type { Env } from './../../app'
import { errorResponse } from './../response'

export const getUser = async (
  c: Context<
    Env,
    '/users/{userId}',
    {
      in: {
        param: {
          userId: string
        }
      }
    }
  >,
): Promise<Response> => {
  const env = c.env
  const params = c.req.param()
  const db = new UserDatabase()

  let user
  try {
    ;({ result: user } = await db.selectUser(env.backend, 'user', { userId: params.userId }))
  } catch (error) {
    console.error('getUser failed', error)
    return errorResponse(c, 500, 'Internal Server Error', '', '')
  }

  if (!user) {
    return errorResponse(c, 404, 'Resource Not Found', '', '')
  }

  return c.json({ name: user.name, userId: user.userId, password: user.password }, 200)
}
