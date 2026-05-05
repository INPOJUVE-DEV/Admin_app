import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Alert,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material'
import SaveRoundedIcon from '@mui/icons-material/SaveRounded'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../../components/common/PageHeader'
import { ErrorState } from '../../components/feedback/ErrorState'
import { applyServerFieldErrors } from '../../lib/forms'
import { queryKeys } from '../../lib/query-keys'
import { ApiError } from '../../types/common'
import { lookupsApi } from '../lookups/api'
import { usersApi } from './api'

const baseSchema = {
  nombre: z.string().min(2, 'Ingresa el nombre'),
  apellidos: z.string().min(2, 'Ingresa los apellidos'),
  email: z.email('Correo inválido'),
  telefono: z.string().min(7, 'Ingresa un teléfono válido'),
  municipioId: z.coerce.number().min(1, 'Selecciona un municipio'),
  role: z.string().min(1, 'Selecciona un rol'),
  status: z.string().min(1, 'Selecciona un estatus'),
}

const createSchema = z.object({
  ...baseSchema,
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
})

const editSchema = z.object({
  ...baseSchema,
  password: z.string().optional(),
})

type CreateFormValues = z.infer<typeof createSchema>
type EditFormValues = z.infer<typeof editSchema>
type UserFormValues = CreateFormValues | EditFormValues

export function UserFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id = '' } = useParams()
  const form = useForm<UserFormValues>({
    resolver: zodResolver(mode === 'create' ? createSchema : editSchema) as never,
    defaultValues: {
      nombre: '',
      apellidos: '',
      email: '',
      telefono: '',
      municipioId: 0,
      role: 'reader',
      status: 'active',
      password: '',
    },
  })

  const lookupsQuery = useQuery({
    queryKey: queryKeys.lookups(['municipios']),
    queryFn: () => lookupsApi.get(['municipios']),
  })

  const detailQuery = useQuery({
    enabled: mode === 'edit',
    queryKey: queryKeys.users.detail(id),
    queryFn: () => usersApi.detail(id),
  })

  useEffect(() => {
    if (detailQuery.data) {
      form.reset({
        nombre: detailQuery.data.nombre,
        apellidos: detailQuery.data.apellidos,
        email: detailQuery.data.email,
        telefono: detailQuery.data.telefono ?? '',
        municipioId: detailQuery.data.municipioId ?? 0,
        role: detailQuery.data.role,
        status: detailQuery.data.status,
        password: '',
      })
    }
  }, [detailQuery.data, form])

  const mutation = useMutation({
    mutationFn: (values: UserFormValues) => {
      if (mode === 'create') {
        return usersApi.create(values as CreateFormValues)
      }

      const { password: _password, ...payload } = values as EditFormValues
      return usersApi.update(id, payload)
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['users-list'] })
      navigate(`/usuarios/${result.id}`, { replace: true })
    },
    onError: (error: ApiError) => {
      if (error.status === 422 || error.status === 409) {
        applyServerFieldErrors(error, form.setError)
      }
    },
  })

  if (lookupsQuery.isError || detailQuery.isError) {
    return (
      <ErrorState
        description={(lookupsQuery.error ?? detailQuery.error)?.message ?? 'No fue posible cargar el formulario.'}
        onRetry={() => {
          void lookupsQuery.refetch()
          void detailQuery.refetch()
        }}
      />
    )
  }

  const isLoading = lookupsQuery.isLoading || (mode === 'edit' && detailQuery.isLoading)

  return (
    <>
      <PageHeader
        title={mode === 'create' ? 'Nuevo usuario' : 'Editar usuario'}
        subtitle="Administración de cuentas internas y permisos de operación."
        actions={
          <Button component={RouterLink} to={mode === 'edit' ? `/usuarios/${id}` : '/usuarios'} startIcon={<ArrowBackRoundedIcon />}>
            Volver
          </Button>
        }
      />
      {isLoading ? (
        <Alert severity="info">Cargando formulario...</Alert>
      ) : (
        <Card>
          <CardContent>
            <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label="Nombre" {...form.register('nombre')} error={!!form.formState.errors.nombre} helperText={form.formState.errors.nombre?.message} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label="Apellidos" {...form.register('apellidos')} error={!!form.formState.errors.apellidos} helperText={form.formState.errors.apellidos?.message} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label="Correo" {...form.register('email')} error={!!form.formState.errors.email} helperText={form.formState.errors.email?.message} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label="Teléfono" {...form.register('telefono')} error={!!form.formState.errors.telefono} helperText={form.formState.errors.telefono?.message} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Controller
                    control={form.control}
                    name="municipioId"
                    render={({ field }) => (
                      <TextField select fullWidth label="Municipio" {...field} error={!!form.formState.errors.municipioId} helperText={form.formState.errors.municipioId?.message}>
                        <MenuItem value={0}>Selecciona un municipio</MenuItem>
                        {lookupsQuery.data?.municipios.map((municipio) => (
                          <MenuItem key={municipio.id} value={municipio.id}>
                            {municipio.nombre}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Controller
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <TextField select fullWidth label="Rol" {...field} error={!!form.formState.errors.role} helperText={form.formState.errors.role?.message}>
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="reader">Reader</MenuItem>
                        <MenuItem value="scanner">Scanner</MenuItem>
                      </TextField>
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Controller
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <TextField select fullWidth label="Estatus" {...field} error={!!form.formState.errors.status} helperText={form.formState.errors.status?.message}>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="blocked">Blocked</MenuItem>
                      </TextField>
                    )}
                  />
                </Grid>
                {mode === 'create' ? (
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      type="password"
                      label="Contraseña inicial"
                      {...form.register('password')}
                      error={!!form.formState.errors.password}
                      helperText={form.formState.errors.password?.message}
                    />
                  </Grid>
                ) : null}
              </Grid>
              {mutation.isError ? (
                <Alert severity="error" sx={{ mt: 2.5 }}>
                  {mutation.error.message}
                </Alert>
              ) : null}
              <Stack direction="row" sx={{ mt: 3, justifyContent: 'flex-end' }}>
                <Button type="submit" variant="contained" startIcon={<SaveRoundedIcon />} disabled={mutation.isPending}>
                  {mode === 'create' ? 'Crear usuario' : 'Guardar cambios'}
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>
      )}
    </>
  )
}
