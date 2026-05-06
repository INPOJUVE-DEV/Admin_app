const fallbackApiBaseUrl = '/api/v1'
const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
const isAbsoluteApiBaseUrl = /^https?:\/\//i.test(configuredApiBaseUrl ?? '')

if (import.meta.env.PROD && !configuredApiBaseUrl) {
  console.warn(
    'VITE_API_BASE_URL no esta configurada en produccion. La app usara /api/v1 en el mismo dominio, lo cual normalmente fallara si no existe un proxy real en ese host.',
  )
}

if (
  import.meta.env.PROD &&
  typeof window !== 'undefined' &&
  window.location.hostname.endsWith('.vercel.app') &&
  isAbsoluteApiBaseUrl
) {
  console.warn(
    'VITE_API_BASE_URL apunta a un dominio externo dentro de un deploy de Vercel. Eso omite el rewrite de vercel.json. Si quieres usar el proxy del mismo dominio, configura VITE_API_BASE_URL=/api/v1.',
  )
}

const rawBaseUrl = configuredApiBaseUrl ?? fallbackApiBaseUrl

export const env = {
  apiBaseUrl: rawBaseUrl.replace(/\/$/, ''),
  appName: import.meta.env.VITE_APP_NAME ?? 'API_TJ Admin',
  sessionStorageKey: import.meta.env.VITE_SESSION_STORAGE_KEY ?? 'api_tj_admin_session',
}
