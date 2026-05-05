import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Alert,
  Button,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../../components/common/PageHeader'
import { SearchFilters } from '../../components/common/SearchFilters'
import { DataColumn, DataTable } from '../../components/data-display/DataTable'
import { ConfirmDialog } from '../../components/feedback/ConfirmDialog'
import { EmptyState } from '../../components/feedback/EmptyState'
import { ErrorState } from '../../components/feedback/ErrorState'
import { useAuth } from '../auth/auth-context'
import { lookupsApi } from '../lookups/api'
import { formatNumber } from '../../lib/formatters'
import { queryKeys } from '../../lib/query-keys'
import { Convenio } from '../../types/convenios'
import { conveniosApi } from './api'

const pageSize = 20

export function ConveniosListPage() {
  const { hasPermission } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [deleteTarget, setDeleteTarget] = useState<Convenio | null>(null)
  const queryClient = useQueryClient()

  const filters = useMemo(
    () => ({
      page: Number(searchParams.get('page') ?? '1'),
      pageSize,
      q: searchParams.get('q') ?? '',
      categoria: searchParams.get('categoria') ?? '',
      municipio: searchParams.get('municipio') ?? '',
    }),
    [searchParams],
  )

  const conveniosQuery = useQuery({
    queryKey: queryKeys.convenios.list(filters),
    queryFn: () => conveniosApi.list(filters),
  })

  const lookupsQuery = useQuery({
    queryKey: queryKeys.lookups(['municipios', 'categorias']),
    queryFn: () => lookupsApi.get(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => conveniosApi.remove(id),
    onSuccess: async () => {
      setDeleteTarget(null)
      await queryClient.invalidateQueries({ queryKey: ['convenios-list'] })
    },
  })

  const columns = useMemo<DataColumn<Convenio>[]>(
    () => [
      {
        key: 'nombre',
        header: 'Convenio',
        render: (row) => (
          <Stack spacing={0.35}>
            <Typography sx={{ fontWeight: 700 }}>{row.nombre}</Typography>
            <Typography variant="body2" color="text.secondary">
              {row.descripcion}
            </Typography>
          </Stack>
        ),
      },
      {
        key: 'categoria',
        header: 'Categoría',
        render: (row) => row.categoria,
      },
      {
        key: 'municipio',
        header: 'Municipio',
        render: (row) => row.municipio,
      },
      {
        key: 'descuento',
        header: 'Descuento',
        render: (row) => row.descuento,
      },
      {
        key: 'acciones',
        header: 'Acciones',
        align: 'right',
        render: (row) => (
          <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
            <IconButton component={RouterLink} to={`/convenios/${row.id}`}>
              <VisibilityRoundedIcon />
            </IconButton>
            {hasPermission('convenios.write') ? (
              <>
                <IconButton component={RouterLink} to={`/convenios/${row.id}/editar`}>
                  <EditRoundedIcon />
                </IconButton>
                <IconButton color="error" onClick={() => setDeleteTarget(row)}>
                  <DeleteRoundedIcon />
                </IconButton>
              </>
            ) : null}
          </Stack>
        ),
      },
    ],
    [hasPermission],
  )

  const handleFiltersChange = (next: Record<string, string | number>) => {
    const merged = new URLSearchParams(searchParams)
    Object.entries(next).forEach(([key, value]) => {
      if (!value) {
        merged.delete(key)
      } else {
        merged.set(key, String(value))
      }
    })
    merged.set('page', '1')
    setSearchParams(merged)
  }

  if (conveniosQuery.isError) {
    return (
      <ErrorState
        description={conveniosQuery.error.message}
        onRetry={() => {
          void conveniosQuery.refetch()
        }}
      />
    )
  }

  const data = conveniosQuery.data

  return (
    <>
      <PageHeader
        title="Convenios"
        subtitle="Administración del catálogo público sobre /api/v1/catalog con filtros por municipio y categoría."
        actions={
          hasPermission('convenios.write') ? (
            <Button component={RouterLink} to="/convenios/nuevo" variant="contained" startIcon={<AddRoundedIcon />}>
              Nuevo convenio
            </Button>
          ) : undefined
        }
      />
      <SearchFilters>
        <TextField
          label="Buscar"
          placeholder="Nombre o palabra clave"
          defaultValue={filters.q}
          onBlur={(event) => handleFiltersChange({ q: event.target.value })}
          sx={{ minWidth: 240 }}
        />
        <TextField
          select
          label="Categoría"
          value={filters.categoria}
          onChange={(event) => handleFiltersChange({ categoria: event.target.value })}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">Todas</MenuItem>
          {lookupsQuery.data?.categorias.map((categoria) => (
            <MenuItem key={categoria.id} value={categoria.nombre}>
              {categoria.nombre}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Municipio"
          value={filters.municipio}
          onChange={(event) => handleFiltersChange({ municipio: event.target.value })}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {lookupsQuery.data?.municipios.map((municipio) => (
            <MenuItem key={municipio.id} value={municipio.nombre}>
              {municipio.nombre}
            </MenuItem>
          ))}
        </TextField>
      </SearchFilters>
      {conveniosQuery.isLoading || !data ? (
        <Alert severity="info">Cargando convenios...</Alert>
      ) : data.items.length === 0 ? (
        <EmptyState
          title="Sin convenios para mostrar"
          description="Ajusta los filtros o crea un convenio nuevo si tienes permisos de escritura."
        />
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
      {data ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          Total de registros: {formatNumber(data.total)}
        </Typography>
      ) : null}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Eliminar convenio"
        message={`Se eliminará ${deleteTarget?.nombre ?? 'el convenio seleccionado'}. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        loading={deleteMutation.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id)
          }
        }}
      />
    </>
  )
}
