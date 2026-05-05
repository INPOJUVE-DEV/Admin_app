export interface ApiError extends Error {
  status: number
  details?: unknown
  code?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface LookupOption {
  id: number
  nombre: string
}
