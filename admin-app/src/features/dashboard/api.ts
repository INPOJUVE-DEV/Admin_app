import { apiRequest } from '../../lib/api-client'
import { DashboardResponse } from '../../types/dashboard'

export const dashboardApi = {
  get: () => apiRequest<DashboardResponse>('/admin/dashboard'),
}
