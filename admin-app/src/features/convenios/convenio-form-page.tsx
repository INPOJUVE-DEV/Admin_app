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
import { conveniosApi } from './api'

const optionalNumber = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) {
    return undefined
  }
  return Number(value)
}, z.number().optional())

const convenioSchema = z.object({
  nombre: z.string().min(2, 'Ingresa el nombre'),
  descripcion: z.string().min(4, 'Ingresa la descripción'),
  categoriaId: z.coerce.number().min(1, 'Selecciona una categoría'),
  municipioId: z.coerce.number().min(1, 'Selecciona un municipio'),
  descuento: z.string().min(2, 'Ingresa el descuento'),
  direccion: z.string().min(4, 'Ingresa la dirección'),
  horario: z.string().min(3, 'Ingresa el horario'),
  lat: optionalNumber,
  lng: optionalNumber,
})

type ConvenioFormValues = z.infer<typeof convenioSchema>

export function ConvenioFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id = '' } = useParams()
  const form = useForm<ConvenioFormValues>({
    resolver: zodResolver(convenioSchema) as never,
    defaultValues: {
      nombre: '',
      descripcion: '',
      categoriaId: 0,
      municipioId: 0,
      descuento: '',
      direccion: '',
      horario: '',
      lat: undefined,
      lng: undefined,
    },
  })

  const lookupsQuery = useQuery({
    queryKey: queryKeys.lookups(['municipios', 'categorias']),
    queryFn: () => lookupsApi.get(),
  })

  const detailQuery = useQuery({
    enabled: mode === 'edit',
    queryKey: queryKeys.convenios.detail(id),
    queryFn: () => conveniosApi.detail(id),
  })

  useEffect(() => {
    if (detailQuery.data && lookupsQuery.data) {
      const categoria = lookupsQuery.data.categorias.find((item) => item.nombre === detailQuery.data?.categoria)
      const municipio = lookupsQuery.data.municipios.find((item) => item.nombre === detailQuery.data?.municipio)
      form.reset({
        nombre: detailQuery.data.nombre,
        descripcion: detailQuery.data.descripcion,
        categoriaId: categoria?.id ?? 0,
        municipioId: municipio?.id ?? 0,
        descuento: detailQuery.data.descuento,
        direccion: detailQuery.data.direccion,
        horario: detailQuery.data.horario,
        lat: detailQuery.data.lat ?? undefined,
        lng: detailQuery.data.lng ?? undefined,
      })
    }
  }, [detailQuery.data, form, lookupsQuery.data])

  const mutation = useMutation({
    mutationFn: (values: ConvenioFormValues) =>
      mode === 'create' ? conveniosApi.create(values) : conveniosApi.update(id, values),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['convenios-list'] })
      navigate(`/convenios/${result.id}`, { replace: true })
    },
    onError: (error: ApiError) => {
      if (error.status === 422) {
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
        title={mode === 'create' ? 'Nuevo convenio' : 'Editar convenio'}
        subtitle="Formulario administrativo conectado al catálogo principal."
        actions={
          <Button component={RouterLink} to={mode === 'edit' ? `/convenios/${id}` : '/convenios'} startIcon={<ArrowBackRoundedIcon />}>
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
                  <TextField fullWidth label="Descuento" {...form.register('descuento')} error={!!form.formState.errors.descuento} helperText={form.formState.errors.descuento?.message} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    control={form.control}
                    name="categoriaId"
                    render={({ field }) => (
                      <TextField select fullWidth label="Categoría" {...field} error={!!form.formState.errors.categoriaId} helperText={form.formState.errors.categoriaId?.message}>
                        <MenuItem value={0}>Selecciona una categoría</MenuItem>
                        {lookupsQuery.data?.categorias.map((categoria) => (
                          <MenuItem key={categoria.id} value={categoria.id}>
                            {categoria.nombre}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
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
                <Grid size={12}>
                  <TextField fullWidth label="Dirección" {...form.register('direccion')} error={!!form.formState.errors.direccion} helperText={form.formState.errors.direccion?.message} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label="Horario" {...form.register('horario')} error={!!form.formState.errors.horario} helperText={form.formState.errors.horario?.message} />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField fullWidth label="Latitud" {...form.register('lat')} error={!!form.formState.errors.lat} helperText={form.formState.errors.lat?.message} />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField fullWidth label="Longitud" {...form.register('lng')} error={!!form.formState.errors.lng} helperText={form.formState.errors.lng?.message} />
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    label="Descripción"
                    {...form.register('descripcion')}
                    error={!!form.formState.errors.descripcion}
                    helperText={form.formState.errors.descripcion?.message}
                  />
                </Grid>
              </Grid>
              {mutation.isError ? (
                <Alert severity="error" sx={{ mt: 2.5 }}>
                  {mutation.error.message}
                </Alert>
              ) : null}
              <Stack direction="row" sx={{ mt: 3, justifyContent: 'flex-end' }}>
                <Button type="submit" variant="contained" startIcon={<SaveRoundedIcon />} disabled={mutation.isPending}>
                  {mode === 'create' ? 'Crear convenio' : 'Guardar cambios'}
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>
      )}
    </>
  )
}
