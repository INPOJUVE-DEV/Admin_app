import { apiRequest } from '../../lib/api-client'
import { PaginatedResponse } from '../../types/common'
import { AdminUser, AdminUserFilters, CreateUserPayload, UpdateUserPayload } from '../../types/users'

const maxPageSize = 100

export const usersApi = {
  list: (filters: AdminUserFilters) =>
    apiRequest<PaginatedResponse<AdminUser>>('/admin/users', {
      query: filters,
    }),
  detail: (id: string | number) => apiRequest<AdminUser>(`/admin/users/${id}`),
  create: (payload: CreateUserPayload) =>
    apiRequest<AdminUser>('/admin/users', {
      method: 'POST',
      body: payload,
    }),
  update: (id: string | number, payload: UpdateUserPayload) =>
    apiRequest<AdminUser>(`/admin/users/${id}`, {
      method: 'PATCH',
      body: payload,
    }),
  setPassword: (id: string | number, password: string) =>
    apiRequest<void>(`/admin/users/${id}/set-password`, {
      method: 'POST',
      body: { password },
    }),
  countActiveCardholders: async () => {
    let page = 1
    let totalPages = 1
    let count = 0

    while (page <= totalPages) {
      const response = await usersApi.list({
        page,
        pageSize: maxPageSize,
      })

      totalPages = response.totalPages
      count += response.items.filter((user) => user.status === 'active' && Boolean(user.cardholderSyncId)).length
      page += 1
    }

    return count
  },
}
