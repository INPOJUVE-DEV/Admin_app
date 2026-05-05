import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Alert, Button, IconButton, MenuItem, Stack, TextField, Typography } from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../../components/common/PageHeader'
import { SearchFilters } from '../../components/common/SearchFilters'
import { DataColumn, DataTable } from '../../components/data-display/DataTable'
import { StatusBadge } from '../../components/data-display/StatusBadge'
import { EmptyState } from '../../components/feedback/EmptyState'
import { ErrorState } from '../../components/feedback/ErrorState'
import { useAuth } from '../auth/auth-context'
import { queryKeys } from '../../lib/query-keys'
import { formatDateTime } from '../../lib/formatters'
import { AdminUser } from '../../types/users'
import { usersApi } from './api'

const pageSize = 20

export function UsersListPage() {
  const { hasPermission } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo(
    () => ({
      page: Number(searchParams.get('page') ?? '1'),
      pageSize,
      q: searchParams.get('q') ?? '',
      role: searchParams.get('role') ?? '',
      status: searchParams.get('status') ?? '',
    }),
    [searchParams],
  )

  const usersQuery = useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: () => usersApi.list(filters),
  })

  const columns = useMemo<DataColumn<AdminUser>[]>(
    () => [
      {
        key: 'nombre',
        header: 'Usuario',
        render: (row) => (
          <Stack spacing={0.25}>
            <Typography sx={{ fontWeight: 700 }}>{row.nombreCompleto}</Typography>
            <Typography variant="body2" color="text.secondary">
              {row.email}
            </Typography>
          </Stack>
        ),
      },
      {
        key: 'role',
        header: 'Rol',
        render: (row) => row.role,
      },
      {
        key: 'status',
        header: 'Estatus',
        render: (row) => <StatusBadge value={row.status} />,
      },
      {
        key: 'municipio',
        header: 'Municipio',
        render: (row) => row.municipio ?? 'Sin dato',
      },
      {
        key: 'lastLoginAt',
        header: 'Último login',
        render: (row) => formatDateTime(row.lastLoginAt),
      },
      {
        key: 'acciones',
        header: 'Acciones',
        align: 'right',
        render: (row) => (
          <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
            <IconButton component={RouterLink} to={`/usuarios/${row.id}`}>
              <VisibilityRoundedIcon />
            </IconButton>
            {hasPermission('users.write') ? (
              <IconButton component={RouterLink} to={`/usuarios/${row.id}/editar`}>
                <EditRoundedIcon />
              </IconButton>
            ) : null}
          </Stack>
        ),
      },
    ],
    [hasPermission],
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

  if (usersQuery.isError) {
    return <ErrorState description={usersQuery.error.message} onRetry={() => void usersQuery.refetch()} />
  }

  const data = usersQuery.data

  return (
    <>
      <PageHeader
        title="Usuarios internos"
        subtitle="Gestión de cuentas administrativas con filtros por rol y estatus."
        actions={
          hasPermission('users.write') ? (
            <Button component={RouterLink} to="/usuarios/nuevo" variant="contained" startIcon={<AddRoundedIcon />}>
              Nuevo usuario
            </Button>
          ) : undefined
        }
      />
      <SearchFilters>
        <TextField label="Buscar" placeholder="Nombre o correo" defaultValue={filters.q} onBlur={(event) => setFilter('q', event.target.value)} sx={{ minWidth: 240 }} />
        <TextField select label="Rol" value={filters.role} onChange={(event) => setFilter('role', event.target.value)} sx={{ minWidth: 180 }}>
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="reader">Reader</MenuItem>
          <MenuItem value="scanner">Scanner</MenuItem>
        </TextField>
        <TextField select label="Estatus" value={filters.status} onChange={(event) => setFilter('status', event.target.value)} sx={{ minWidth: 180 }}>
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="blocked">Blocked</MenuItem>
        </TextField>
      </SearchFilters>
      {usersQuery.isLoading || !data ? (
        <Alert severity="info">Cargando usuarios...</Alert>
      ) : data.items.length === 0 ? (
        <EmptyState title="Sin usuarios para mostrar" description="Ajusta los filtros o da de alta un usuario nuevo si tienes permisos." />
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
