import { apiRequest } from '../../lib/api-client'
import { LookupOption } from '../../types/common'
import { LookupListResponse, LookupPayload, LookupType } from '../../types/lookups'

export interface LookupResponse {
  municipios: LookupOption[]
  categorias: LookupOption[]
}

function normalizeLookupList(data: LookupOption[] | LookupListResponse) {
  return Array.isArray(data) ? data : data.items
}

export const lookupsApi = {
  get: (include = ['municipios', 'categorias']) =>
    apiRequest<LookupResponse>('/admin/lookups', {
      query: {
        include: include.join(','),
      },
    }),
  list: async (lookup: LookupType, q = '') => {
    const response = await apiRequest<LookupOption[] | LookupListResponse>(`/admin/lookups/${lookup}`, {
      query: q ? { q } : undefined,
    })

    return normalizeLookupList(response)
  },
  detail: (lookup: LookupType, id: string | number) =>
    apiRequest<LookupOption>(`/admin/lookups/${lookup}/${id}`),
  create: (lookup: LookupType, payload: LookupPayload) =>
    apiRequest<LookupOption>(`/admin/lookups/${lookup}`, {
      method: 'POST',
      body: payload,
    }),
  update: (lookup: LookupType, id: string | number, payload: LookupPayload) =>
    apiRequest<LookupOption>(`/admin/lookups/${lookup}/${id}`, {
      method: 'PATCH',
      body: payload,
    }),
  remove: (lookup: LookupType, id: string | number) =>
    apiRequest<void>(`/admin/lookups/${lookup}/${id}`, {
      method: 'DELETE',
    }),
}
