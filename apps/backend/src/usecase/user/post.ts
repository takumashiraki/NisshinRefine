import type { Context } from 'hono'
import UserDatabase from './../../infrastructure/user'
import type { Env } from './../../app'
import { errorResponse } from './../response'

const hashPassword = async (password: string): Promise<string> => {
  const input = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', input)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export const createUser = async (
  c: Context<
    Env,
    '/users',
    {
      in: {
        json: {
          name: string
          email?: string | null
          password?: string | null
        }
      }
    }
  >,
): Promise<Response> => {
  const env = c.env
  const payload = await c.req.json()
  const db = new UserDatabase()

  let userId = crypto.randomUUID()
  try {
    for (let i = 0; i < 5; i++) {
      const { result } = await db.selectUser(env.backend, 'user', { userId })
      if (!result) {
        break
      }
      userId = crypto.randomUUID()
    }
  } catch (error) {
    console.error('selectUser failed', error)
    return errorResponse(c, 500, 'Internal Server Error', '', '')
  }

  let created
  try {
    const hashedPassword = payload.password ? await hashPassword(payload.password) : null
    ;({ result: created } = await db.createUser(env.backend, 'user', {
      userId,
      name: payload.name,
      email: payload.email ?? null,
      password: hashedPassword,
    }))
  } catch (error) {
    console.error('createUser failed', error)
    return errorResponse(c, 500, 'Internal Server Error', '', '')
  }

  if (!created) {
    return errorResponse(c, 500, 'Internal Server Error', '', '')
  }

  return c.json({ name: created.name, userId: created.userId, password: created.password }, 200)
}
