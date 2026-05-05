import { apiRequest } from '../../lib/api-client'
import { PaginatedResponse } from '../../types/common'
import { Convenio, ConvenioFilters, ConvenioPayload } from '../../types/convenios'

export const conveniosApi = {
  list: (filters: ConvenioFilters) =>
    apiRequest<PaginatedResponse<Convenio>>('/catalog', {
      query: filters,
    }),
  detail: (id: string | number) => apiRequest<Convenio>(`/catalog/${id}`),
  create: (payload: ConvenioPayload) =>
    apiRequest<Convenio>('/catalog', {
      method: 'POST',
      body: payload,
    }),
  update: (id: string | number, payload: ConvenioPayload) =>
    apiRequest<Convenio>(`/catalog/${id}`, {
      method: 'PUT',
      body: payload,
    }),
  remove: (id: string | number) =>
    apiRequest<void>(`/catalog/${id}`, {
      method: 'DELETE',
    }),
}
