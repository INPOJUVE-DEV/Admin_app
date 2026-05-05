export interface StagingRecord {
  id: number
  external_request_id: string
  curp_masked: string
  status: string
  submitted_by_system: string
  submitted_at: string | null
  sent_at: string | null
  resolved_at: string | null
  error_message: string | null
  locked_at: string | null
  locked_by: string | null
  sys_ipj_response_code: number | null
}

export interface StagingFilters {
  page: number
  pageSize: number
  status?: string
  q?: string
}

export interface StagingDetail extends StagingRecord {
  payload: Record<string, unknown> | null
}

export interface StagingAttempt {
  id: number
  staging_id: number
  external_request_id: string
  actor: string
  response_status: number | null
  status: string
  error_message: string | null
  attempted_at: string
  created_at: string
}

export interface PushStagingResponse {
  sent: boolean
  message: string
  sys_ipj_status: number | null
}
