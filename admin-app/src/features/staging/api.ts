import { apiRequest } from '../../lib/api-client'
import { PaginatedResponse } from '../../types/common'
import { PushStagingResponse, StagingAttempt, StagingDetail, StagingFilters, StagingRecord } from '../../types/staging'

const maxPageSize = 100

export const stagingApi = {
  list: (filters: StagingFilters) =>
    apiRequest<PaginatedResponse<StagingRecord>>('/admin/beneficiarios-staging', {
      query: filters,
    }),
  detail: (id: string | number) =>
    apiRequest<StagingDetail>(`/admin/beneficiarios-staging/${id}`),
  attempts: (id: string | number) =>
    apiRequest<{ items: StagingAttempt[] }>(`/admin/beneficiarios-staging/${id}/attempts`),
  push: (id: string | number) =>
    apiRequest<PushStagingResponse>(`/admin/beneficiarios-staging/${id}/push`, {
      method: 'POST',
    }),
  listPendingRecords: async () => {
    let page = 1
    let totalPages = 1
    const records: StagingRecord[] = []

    while (page <= totalPages) {
      const response = await stagingApi.list({
        page,
        pageSize: maxPageSize,
        status: 'pending',
      })

      totalPages = response.totalPages
      records.push(...response.items)
      page += 1
    }

    return records
  },
}
