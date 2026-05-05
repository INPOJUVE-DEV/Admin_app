export interface Convenio {
  id: number
  nombre: string
  categoria: string
  municipio: string
  descuento: string
  direccion: string
  horario: string
  descripcion: string
  lat: number | null
  lng: number | null
}

export interface ConvenioPayload {
  nombre: string
  descripcion: string
  categoriaId: number
  municipioId: number
  descuento: string
  direccion: string
  horario: string
  lat?: number
  lng?: number
}

export interface ConvenioFilters {
  page: number
  pageSize: number
  q?: string
  categoria?: string
  municipio?: string
}
