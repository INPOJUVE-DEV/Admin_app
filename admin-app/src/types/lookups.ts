import { LookupOption } from './common'

export type LookupType = 'categorias' | 'municipios'

export interface LookupPayload {
  nombre: string
}

export interface LookupListResponse {
  items: LookupOption[]
}
