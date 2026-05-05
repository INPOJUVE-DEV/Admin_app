import { env } from './config'
import { ApiError } from '../types/common'

interface RequestOptions extends Omit<RequestInit, 'body'> {
  auth?: boolean
  query?: object
  body?: BodyInit | Record<string, unknown> | unknown
}

let accessTokenGetter: () => string | null = () => null
let unauthorizedHandler: ((message: string) => void) | null = null

function buildUrl(path: string, query?: object) {
  const pathname = path.startsWith('/') ? path : `/${path}`
  const base =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'http://127.0.0.1'
  const url = new URL(`${env.apiBaseUrl}${pathname}`, base)

  if (query) {
    Object.entries(query as Record<string, unknown>).forEach(([key, value]) => {
      if (
        value === undefined ||
        value === null ||
        value === '' ||
        typeof value === 'object' ||
        typeof value === 'function'
      ) {
        return
      }

      url.searchParams.set(key, String(value))
    })
  }

  return url.toString()
}

async function parseResponseBody(response: Response) {
  if (response.status === 204) {
    return undefined
  }

  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    return response.json()
  }

  const text = await response.text()
  return text || undefined
}

function createApiError(status: number, data: unknown): ApiError {
  const fallbackMessageByStatus: Record<number, string> = {
    400: 'La solicitud es inválida.',
    401: 'Sesión inválida o expirada.',
    403: 'No tienes permisos para esta acción.',
    404: 'Registro no encontrado.',
    409: 'Conflicto de negocio.',
    422: 'Hay errores de validación.',
    429: 'Demasiados intentos. Intenta más tarde.',
    500: 'Ocurrió un error interno.',
  }

  const payload = typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : null
  const message =
    typeof payload?.message === 'string'
      ? payload.message
      : typeof payload?.error === 'string'
        ? payload.error
        : fallbackMessageByStatus[status] ?? 'No fue posible completar la solicitud.'

  const error = new Error(message) as ApiError
  error.status = status
  error.details = payload?.details ?? payload?.errors
  error.code = typeof payload?.code === 'string' ? payload.code : undefined
  return error
}

export function setAccessTokenGetter(getter: () => string | null) {
  accessTokenGetter = getter
}

export function setUnauthorizedHandler(handler: (message: string) => void) {
  unauthorizedHandler = handler
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const { auth = true, headers, query, body, ...init } = options
  const token = accessTokenGetter()
  const requestHeaders = new Headers(headers)

  requestHeaders.set('Accept', 'application/json')

  if (body && !(body instanceof FormData)) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  if (auth && token) {
    requestHeaders.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(buildUrl(path, query), {
    ...init,
    headers: requestHeaders,
    body:
      body && !(body instanceof FormData) && typeof body !== 'string'
        ? JSON.stringify(body as Record<string, unknown>)
        : (body as BodyInit | null | undefined),
  })

  const data = await parseResponseBody(response)

  if (!response.ok) {
    const error = createApiError(response.status, data)

    if (response.status === 401 && auth && unauthorizedHandler) {
      unauthorizedHandler('Tu sesión expiró. Ingresa nuevamente.')
    }

    throw error
  }

  return data as T
}
