export interface DashboardResponse {
  staging: {
    pending: number
    accepted: number
    rejected: number
    error: number
  }
  sync: {
    lastRunAt: string | null
    lastStatus: string | null
    processed: number
  }
  catalog: {
    benefits: number
  }
  users: {
    admins: number
    readers: number
    blocked: number
  }
  integration: {
    failedCallsLast24h: number
  }
  stagingPush: {
    attemptedAt: string | null
    status: string | null
    responseStatus: number | null
  }
}
