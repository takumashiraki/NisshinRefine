import type { User } from '@nisshin/api-types'
import { apiBaseUrl } from '@/shared/lib/env'

export const getStatus = async (userId: string): Promise<User | null> => {
  const response = await fetch(`${apiBaseUrl}/users/${userId}`)
  if (!response.ok) {
    return null
  }

  return (await response.json()) as User
}
