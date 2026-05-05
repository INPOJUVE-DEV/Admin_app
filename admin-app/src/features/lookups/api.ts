import { apiRequest } from '../../lib/api-client'
import { LookupOption } from '../../types/common'

export interface LookupResponse {
  municipios: LookupOption[]
  categorias: LookupOption[]
}

export const lookupsApi = {
  get: (include = ['municipios', 'categorias']) =>
    apiRequest<LookupResponse>('/admin/lookups', {
      query: {
        include: include.join(','),
      },
    }),
}
