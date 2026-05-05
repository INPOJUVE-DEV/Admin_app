import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { authApi } from './api'
import {
  clearAuthNotice,
  clearStoredToken,
  readAuthNotice,
  readStoredToken,
  writeAuthNotice,
  writeStoredToken,
} from '../../lib/auth-storage'
import { setAccessTokenGetter, setUnauthorizedHandler } from '../../lib/api-client'
import { hasPermission as canAccess } from '../../lib/permissions'
import { LoginRequest, Permission, SessionResponse } from '../../types/auth'

interface AuthContextValue {
  token: string | null
  session: SessionResponse | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  clearSession: (notice?: string) => void
  hasPermission: (permission: Permission) => boolean
  consumeNotice: () => string | null
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: PropsWithChildren) {
  const tokenRef = useRef<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [session, setSession] = useState<SessionResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const clearSession = useCallback((notice?: string) => {
    tokenRef.current = null
    setToken(null)
    setSession(null)
    clearStoredToken()

    if (notice) {
      writeAuthNotice(notice)
    }
  }, [])

  const rehydrateSession = useCallback(async () => {
    const storedToken = readStoredToken()

    if (!storedToken) {
      clearSession()
      setIsLoading(false)
      return
    }

    tokenRef.current = storedToken
    setToken(storedToken)

    try {
      const nextSession = await authApi.session()
      setSession(nextSession)
    } catch {
      clearSession('Tu sesión expiró. Ingresa nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }, [clearSession])

  useEffect(() => {
    setAccessTokenGetter(() => tokenRef.current)
    setUnauthorizedHandler((message) => {
      clearSession(message)
    })
    void rehydrateSession()
  }, [clearSession, rehydrateSession])

  const login = useCallback(async (credentials: LoginRequest) => {
    const response = await authApi.login(credentials)
    tokenRef.current = response.accessToken
    setToken(response.accessToken)
    setSession({
      authenticated: response.authenticated,
      user: response.user,
      role: response.role,
      status: response.status,
      permissions: response.permissions,
    })
    writeStoredToken(response.accessToken)
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      clearSession()
    }
  }, [clearSession])

  const hasPermission = useCallback(
    (permission: Permission) => {
      return canAccess(session, permission)
    },
    [session],
  )

  const consumeNotice = useCallback(() => {
    const notice = readAuthNotice()
    if (notice) {
      clearAuthNotice()
    }
    return notice
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      session,
      isAuthenticated: Boolean(token && session?.authenticated),
      isLoading,
      login,
      logout,
      clearSession,
      hasPermission,
      consumeNotice,
    }),
    [clearSession, consumeNotice, hasPermission, isLoading, login, logout, session, token],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }

  return context
}
