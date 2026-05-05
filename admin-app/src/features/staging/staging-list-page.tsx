import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Alert, IconButton, MenuItem, Stack, TextField, Typography } from '@mui/material'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../../components/common/PageHeader'
import { SearchFilters } from '../../components/common/SearchFilters'
import { DataColumn, DataTable } from '../../components/data-display/DataTable'
import { StatusBadge } from '../../components/data-display/StatusBadge'
import { EmptyState } from '../../components/feedback/EmptyState'
import { ErrorState } from '../../components/feedback/ErrorState'
import { formatDateTime } from '../../lib/formatters'
import { queryKeys } from '../../lib/query-keys'
import { StagingRecord } from '../../types/staging'
import { stagingApi } from './api'

const pageSize = 20

export function StagingListPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo(
    () => ({
      page: Number(searchParams.get('page') ?? '1'),
      pageSize,
      q: searchParams.get('q') ?? '',
      status: searchParams.get('status') ?? '',
    }),
    [searchParams],
  )

  const stagingQuery = useQuery({
    queryKey: queryKeys.staging.list(filters),
    queryFn: () => stagingApi.list(filters),
  })

  const columns = useMemo<DataColumn<StagingRecord>[]>(
    () => [
      {
        key: 'external_request_id',
        header: 'Request ID',
        render: (row) => (
          <Stack spacing={0.25}>
            <Typography sx={{ fontWeight: 700 }}>{row.external_request_id}</Typography>
            <Typography variant="body2" color="text.secondary">
              CURP: {row.curp_masked}
            </Typography>
          </Stack>
        ),
      },
      {
        key: 'status',
        header: 'Estatus',
        render: (row) => <StatusBadge value={row.status} />,
      },
      {
        key: 'submitted_by_system',
        header: 'Sistema',
        render: (row) => row.submitted_by_system,
      },
      {
        key: 'submitted_at',
        header: 'Enviado por origen',
        render: (row) => formatDateTime(row.submitted_at),
      },
      {
        key: 'sys_ipj_response_code',
        header: 'Sys_IPJ',
        render: (row) => row.sys_ipj_response_code?.toString() ?? 'Sin dato',
      },
      {
        key: 'acciones',
        header: 'Acciones',
        align: 'right',
        render: (row) => (
          <IconButton component={RouterLink} to={`/staging/${row.id}`}>
            <VisibilityRoundedIcon />
          </IconButton>
        ),
      },
    ],
    [],
  )

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (!value) {
      next.delete(key)
    } else {
      next.set(key, value)
    }
    next.set('page', '1')
    setSearchParams(next)
  }

  if (stagingQuery.isError) {
    return <ErrorState description={stagingQuery.error.message} onRetry={() => void stagingQuery.refetch()} />
  }

  const data = stagingQuery.data

  return (
    <>
      <PageHeader
        title="Beneficiarios staging"
        subtitle="Consulta de staging con búsqueda por request ID y seguimiento de intentos de push."
      />
      <SearchFilters>
        <TextField label="Buscar" placeholder="REQ-2026-001" defaultValue={filters.q} onBlur={(event) => setFilter('q', event.target.value)} sx={{ minWidth: 240 }} />
        <TextField select label="Estatus" value={filters.status} onChange={(event) => setFilter('status', event.target.value)} sx={{ minWidth: 200 }}>
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="accepted">Accepted</MenuItem>
          <MenuItem value="rejected">Rejected</MenuItem>
          <MenuItem value="error">Error</MenuItem>
        </TextField>
      </SearchFilters>
      {stagingQuery.isLoading || !data ? (
        <Alert severity="info">Cargando staging...</Alert>
      ) : data.items.length === 0 ? (
        <EmptyState title="No hay resultados" description="No se encontraron beneficiarios staging con los filtros actuales." />
      ) : (
        <DataTable
          columns={columns}
          rows={data.items}
          rowKey={(row) => row.id}
          page={data.page}
          pageSize={data.pageSize}
          total={data.total}
          onPageChange={(page) => setSearchParams({ ...Object.fromEntries(searchParams), page: String(page) })}
        />
      )}
    </>
  )
}
