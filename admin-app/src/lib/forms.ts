import { UseFormSetError } from 'react-hook-form'
import { ApiError } from '../types/common'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function applyServerFieldErrors<TFieldValues extends Record<string, unknown>>(
  error: ApiError,
  setError: UseFormSetError<TFieldValues>,
) {
  if (!isRecord(error.details)) {
    return
  }

  Object.entries(error.details).forEach(([field, message]) => {
    const normalized =
      Array.isArray(message) && message.length > 0
        ? String(message[0])
        : typeof message === 'string'
          ? message
          : 'Campo inválido'

    setError(field as Parameters<typeof setError>[0], {
      type: 'server',
      message: normalized,
    })
  })
}
