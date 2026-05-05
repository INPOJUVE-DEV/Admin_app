export interface AdminUser {
  id: number
  nombre: string
  apellidos: string
  nombreCompleto: string
  email: string
  telefono: string | null
  municipioId: number | null
  municipio: string | null
  role: string
  status: string
  cardholderSyncId: string | null
  auth0UserId: string | null
  lastLoginAt: string | null
  lastFailedLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export interface AdminUserFilters {
  page: number
  pageSize: number
  q?: string
  role?: string
  status?: string
}

export interface CreateUserPayload {
  nombre: string
  apellidos: string
  email: string
  telefono: string
  municipioId: number
  role: string
  status: string
  password: string
}

export interface UpdateUserPayload {
  nombre?: string
  apellidos?: string
  email?: string
  telefono?: string
  municipioId?: number
  role?: string
  status?: string
}
