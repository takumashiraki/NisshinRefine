export interface ApiError {
  code: string
  message: string
  field?: string
}

export interface User {
  userId: string
  id: number
}

export interface CreateUserRequest {
  userId: string
  password: string
}

export type CreateUserResponse = User | { error_code: string; errors?: { message: string; field: string }[] }
