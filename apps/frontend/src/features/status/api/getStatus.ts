import type { StatusSummaryResponse } from './generated/model'
import { apiBaseUrl } from '@/shared/lib/env'

export const getStatus = async (statusId: string): Promise<StatusSummaryResponse | null> => {
  const response = await fetch(`${apiBaseUrl}/status/${statusId}/summary`)
  if (!response.ok) {
    return null
  }

  return (await response.json()) as StatusSummaryResponse
}
