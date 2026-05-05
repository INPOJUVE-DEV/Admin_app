export type Permission =
  | 'dashboard.read'
  | 'convenios.read'
  | 'convenios.write'
  | 'users.read'
  | 'users.write'
  | 'staging.read'
  | 'staging.push'
  | 'lookups.read'
  | string

export interface SessionUser {
  id: number
  email: string
  nombreCompleto: string
  role: string
  status: string
  municipio: string | null
}

export interface SessionResponse {
  authenticated: boolean
  user: SessionUser
  role: string
  status: string
  permissions: Permission[]
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse extends SessionResponse {
  accessToken: string
}
