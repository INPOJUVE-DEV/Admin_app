import { apiRequest } from '../../lib/api-client'
import { LoginRequest, LoginResponse, SessionResponse } from '../../types/auth'

export const authApi = {
  login: (payload: LoginRequest) =>
    apiRequest<LoginResponse>('/admin/auth/login', {
      method: 'POST',
      auth: false,
      body: payload,
    }),
  session: () => apiRequest<SessionResponse>('/admin/session'),
  logout: () =>
    apiRequest<void>('/admin/auth/logout', {
      method: 'POST',
    }),
}
