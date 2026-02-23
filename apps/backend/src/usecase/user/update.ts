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
          password: string | null
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
    const hashedPassword = payload.password ? await hashPassword(payload.password) : null
    ;({ result: updated } = await db.updateUser(env.backend, 'user', { userId: params.userId, password: hashedPassword }))
  } catch (error) {
    console.error('updateUser failed', error)
    return errorResponse(c, 500, 'Internal Server Error', '', '')
  }

  if (!updated) {
    return errorResponse(c, 404, 'Resource Not Found', '', '')
  }

  return c.json({ name: updated.name, userId: updated.userId, password: updated.password }, 200)
}
