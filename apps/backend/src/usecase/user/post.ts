import type { Context } from 'hono'
import UserDatabase from './../../infrastructure/user'
import type { Env } from './../../app'
import { errorResponse } from './../response'

export const createUser = async (
  c: Context<
    Env,
    '/users',
    {
      in: {
        json: {
          userId: string
          password: string
        }
      }
    }
  >,
): Promise<Response> => {
  const env = c.env
  const payload = await c.req.json()
  const db = new UserDatabase()

  let existing
  try {
    ;({ result: existing } = await db.selectUser(env.backend, 'user', { userId: payload.userId }))
  } catch (error) {
    console.error('selectUser failed', error)
    return errorResponse(c, 500, 'Internal Server Error', '', '')
  }

  if (existing) {
    return errorResponse(c, 409, 'Invalid Request', 'userId', 'already exist')
  }

  let created
  try {
    ;({ result: created } = await db.createUser(env.backend, 'user', payload))
  } catch (error) {
    console.error('createUser failed', error)
    return errorResponse(c, 500, 'Internal Server Error', '', '')
  }

  if (!created) {
    return errorResponse(c, 500, 'Internal Server Error', '', '')
  }

  return c.json({ userId: created.userId, id: created.id, password: created.password }, 200)
}
