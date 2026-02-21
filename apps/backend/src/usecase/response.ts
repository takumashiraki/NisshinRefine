import type { Context } from 'hono'

export const errorResponse = (
  c: Context,
  resCode: number,
  errorCode: string,
  field: string,
  message: string,
): Response => {
  if (!field && !message) {
    return c.json(
      {
        error_code: errorCode,
      },
      resCode as 400,
    )
  }

  return c.json(
    {
      error_code: errorCode,
      errors: [
        {
          message,
          field,
        },
      ],
    },
    resCode as 400,
  )
}
