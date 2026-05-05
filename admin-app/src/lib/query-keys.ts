export const queryKeys = {
  session: ['session'] as const,
  dashboard: ['dashboard'] as const,
  lookups: (include: string[]) => ['lookups', include.join(',')] as const,
  convenios: {
    list: (filters: Record<string, unknown>) => ['convenios-list', filters] as const,
    detail: (id: string | number) => ['convenio-detail', id] as const,
  },
  users: {
    list: (filters: Record<string, unknown>) => ['users-list', filters] as const,
    detail: (id: string | number) => ['user-detail', id] as const,
  },
  staging: {
    list: (filters: Record<string, unknown>) => ['staging-list', filters] as const,
    detail: (id: string | number) => ['staging-detail', id] as const,
    attempts: (id: string | number) => ['staging-attempts', id] as const,
  },
}
