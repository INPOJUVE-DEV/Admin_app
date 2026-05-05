export function formatDateTime(value?: string | null) {
  if (!value) {
    return 'Sin dato'
  }

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function formatDate(value?: string | null) {
  if (!value) {
    return 'Sin dato'
  }

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

export function formatPhone(value?: string | null) {
  return value || 'Sin dato'
}

export function formatNumber(value?: number | null) {
  if (value === undefined || value === null) {
    return 'Sin dato'
  }

  return new Intl.NumberFormat('es-MX').format(value)
}
