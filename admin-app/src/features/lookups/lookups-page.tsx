import { SyntheticEvent, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '../../components/common/PageHeader'
import { SearchFilters } from '../../components/common/SearchFilters'
import { DataColumn, DataTable } from '../../components/data-display/DataTable'
import { ConfirmDialog } from '../../components/feedback/ConfirmDialog'
import { EmptyState } from '../../components/feedback/EmptyState'
import { ErrorState } from '../../components/feedback/ErrorState'
import { applyServerFieldErrors } from '../../lib/forms'
import { formatNumber } from '../../lib/formatters'
import { queryKeys } from '../../lib/query-keys'
import { useAuth } from '../auth/auth-context'
import { lookupsApi } from './api'
import { LookupOption } from '../../types/common'
import { ApiError } from '../../types/common'
import { LookupPayload, LookupType } from '../../types/lookups'

const lookupSchema = z.object({
  nombre: z.string().trim().min(2, 'Ingresa un nombre valido'),
})

type LookupFormValues = z.infer<typeof lookupSchema>

const lookupLabels: Record<LookupType, string> = {
  categorias: 'Categorias',
  municipios: 'Municipios',
}

function isLookupType(value: string | null): value is LookupType {
  return value === 'categorias' || value === 'municipios'
}

export function LookupsPage() {
  const queryClient = useQueryClient()
  const { session, hasPermission } = useAuth()
  const canWrite = hasPermission('lookups.read') && session?.role === 'admin'
  const [searchParams, setSearchParams] = useSearchParams()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<LookupOption | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<LookupOption | null>(null)
  const [pageError, setPageError] = useState<string | null>(null)

  const activeTab = searchParams.get('tab')
  const currentLookup: LookupType = isLookupType(activeTab) ? activeTab : 'categorias'
  const search = searchParams.get('q') ?? ''

  const form = useForm<LookupFormValues>({
    resolver: zodResolver(lookupSchema),
    defaultValues: {
      nombre: '',
    },
  })

  const lookupQuery = useQuery({
    queryKey: queryKeys.lookupCatalog.list(currentLookup, search),
    queryFn: () => lookupsApi.list(currentLookup, search),
  })

  const columns = useMemo<DataColumn<LookupOption>[]>(
    () => [
      {
        key: 'nombre',
        header: 'Nombre',
        render: (row) => row.nombre,
      },
      {
        key: 'acciones',
        header: 'Acciones',
        align: 'right',
        width: 140,
        render: (row) =>
          canWrite ? (
            <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
              <IconButton onClick={() => handleEdit(row)}>
                <EditRoundedIcon />
              </IconButton>
              <IconButton color="error" onClick={() => setDeleteTarget(row)}>
                <DeleteRoundedIcon />
              </IconButton>
            </Stack>
          ) : (
            <Typography color="text.secondary">Consulta</Typography>
          ),
      },
    ],
    [canWrite],
  )

  const invalidateLookupQueries = async () => {
    await queryClient.invalidateQueries({ queryKey: ['lookup-catalog-list'] })
    await queryClient.invalidateQueries({ queryKey: ['lookups'] })
  }

  const saveMutation = useMutation({
    mutationFn: async (values: LookupFormValues) => {
      setPageError(null)
      const payload: LookupPayload = { nombre: values.nombre.trim() }
      return editingItem
        ? lookupsApi.update(currentLookup, editingItem.id, payload)
        : lookupsApi.create(currentLookup, payload)
    },
    onSuccess: async () => {
      await invalidateLookupQueries()
      handleCloseDialog()
    },
    onError: (error: ApiError) => {
      if (error.status === 409) {
        form.setError('root', {
          type: 'server',
          message: 'Ya existe un registro con ese nombre o no se puede guardar por conflicto.',
        })
        return
      }

      if (error.status === 422) {
        applyServerFieldErrors(error, form.setError)
      }
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => lookupsApi.remove(currentLookup, id),
    onSuccess: async () => {
      await invalidateLookupQueries()
      setDeleteTarget(null)
    },
    onError: (error: ApiError) => {
      if (error.status === 409) {
        setPageError('Este registro esta duplicado o en uso y no se puede eliminar.')
        setDeleteTarget(null)
      }
    },
  })

  function handleEdit(item: LookupOption) {
    setEditingItem(item)
    form.reset({ nombre: item.nombre })
    setDialogOpen(true)
  }

  function handleCreate() {
    setEditingItem(null)
    form.reset({ nombre: '' })
    setDialogOpen(true)
  }

  function handleCloseDialog() {
    setDialogOpen(false)
    setEditingItem(null)
    form.reset({ nombre: '' })
  }

  const handleTabChange = (_: SyntheticEvent, nextValue: LookupType) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('tab', nextValue)
    nextParams.delete('q')
    setPageError(null)
    setSearchParams(nextParams)
  }

  const handleSearchChange = (value: string) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('tab', currentLookup)
    setPageError(null)

    if (value.trim()) {
      nextParams.set('q', value.trim())
    } else {
      nextParams.delete('q')
    }

    setSearchParams(nextParams)
  }

  if (lookupQuery.isError) {
    return <ErrorState description={lookupQuery.error.message} onRetry={() => void lookupQuery.refetch()} />
  }

  const rows = lookupQuery.data ?? []

  return (
    <>
      <PageHeader
        title="Catalogos"
        subtitle="Administracion base de categorias y municipios para los formularios operativos."
        actions={
          canWrite ? (
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={handleCreate}>
              Nuevo registro
            </Button>
          ) : undefined
        }
      />
      <Tabs value={currentLookup} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Categorias" value="categorias" />
        <Tab label="Municipios" value="municipios" />
      </Tabs>
      <SearchFilters>
        <TextField
          key={`${currentLookup}:${search}`}
          label={`Buscar ${lookupLabels[currentLookup].toLowerCase()}`}
          placeholder="Nombre"
          defaultValue={search}
          onBlur={(event) => handleSearchChange(event.target.value)}
          sx={{ minWidth: 280 }}
        />
        <TextField
          select
          label="Catalogo activo"
          value={currentLookup}
          onChange={(event) => handleTabChange(event as unknown as SyntheticEvent, event.target.value as LookupType)}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="categorias">Categorias</MenuItem>
          <MenuItem value="municipios">Municipios</MenuItem>
        </TextField>
      </SearchFilters>
      {pageError ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {pageError}
        </Alert>
      ) : null}
      {lookupQuery.isLoading ? (
        <Alert severity="info">Cargando catalogo...</Alert>
      ) : rows.length === 0 ? (
        <EmptyState
          title={`Sin ${lookupLabels[currentLookup].toLowerCase()} para mostrar`}
          description="No se encontraron registros con los filtros actuales."
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(row) => row.id}
            page={1}
            pageSize={Math.max(rows.length, 1)}
            total={rows.length}
            onPageChange={() => undefined}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            Total de registros: {formatNumber(rows.length)}
          </Typography>
        </>
      )}
      <Dialog open={dialogOpen} onClose={saveMutation.isPending ? undefined : handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingItem ? `Editar ${lookupLabels[currentLookup].slice(0, -1).toLowerCase()}` : `Nueva ${lookupLabels[currentLookup].slice(0, -1).toLowerCase()}`}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              autoFocus
              fullWidth
              label="Nombre"
              {...form.register('nombre')}
              error={!!form.formState.errors.nombre}
              helperText={form.formState.errors.nombre?.message}
            />
            {form.formState.errors.root ? <Alert severity="error">{form.formState.errors.root.message}</Alert> : null}
            {saveMutation.isError && !form.formState.errors.root ? <Alert severity="error">{saveMutation.error.message}</Alert> : null}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDialog} disabled={saveMutation.isPending}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={form.handleSubmit((values) => saveMutation.mutate(values))} disabled={saveMutation.isPending}>
            {editingItem ? 'Guardar cambios' : 'Crear registro'}
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Eliminar ${lookupLabels[currentLookup].slice(0, -1).toLowerCase()}`}
        message={`Se eliminara ${deleteTarget?.nombre ?? 'el registro seleccionado'}. Esta accion no se puede deshacer.`}
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
