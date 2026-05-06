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
  Checkbox,
  FormControlLabel,
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
import { buildGoogleMapsUrl, extractCoordinatesFromGoogleMapsUrl } from '../../lib/google-maps'
import { queryKeys } from '../../lib/query-keys'
import { ApiError } from '../../types/common'
import { ConvenioPayload } from '../../types/convenios'
import { lookupsApi } from '../lookups/api'
import { conveniosApi } from './api'

const optionalUrl = z.preprocess((value) => {
  if (typeof value !== 'string') {
    return value
  }

  const trimmedValue = value.trim()
  return trimmedValue === '' ? undefined : trimmedValue
}, z.string().url('Ingresa una URL valida').optional())

const optionalGoogleMapsUrl = optionalUrl.refine(
  (value) => value === undefined || extractCoordinatesFromGoogleMapsUrl(value) !== null,
  { message: 'No fue posible extraer coordenadas de este link de Google Maps' },
)

const convenioSchema = z.object({
  nombre: z.string().min(2, 'Ingresa el nombre'),
  descripcion: z.string().min(4, 'Ingresa la descripcion'),
  categoriaId: z.coerce.number().min(1, 'Selecciona una categoria'),
  municipioId: z.coerce.number().min(1, 'Selecciona un municipio'),
  descuento: z.string().min(2, 'Ingresa el descuento'),
  direccion: z.string().min(4, 'Ingresa la direccion'),
  horario: z.string().min(3, 'Ingresa el horario'),
  imageUrl: optionalUrl,
  googleMapsUrl: optionalGoogleMapsUrl,
  isActive: z.boolean(),
  isVisibleToBeneficiary: z.boolean(),
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
      imageUrl: undefined,
      googleMapsUrl: undefined,
      isActive: true,
      isVisibleToBeneficiary: true,
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
        imageUrl: detailQuery.data.imageUrl ?? undefined,
        googleMapsUrl: buildGoogleMapsUrl(detailQuery.data.lat, detailQuery.data.lng) ?? undefined,
        isActive: detailQuery.data.isActive ?? true,
        isVisibleToBeneficiary: detailQuery.data.isVisibleToBeneficiary ?? true,
      })
    }
  }, [detailQuery.data, form, lookupsQuery.data])

  const toConvenioPayload = (values: ConvenioFormValues): ConvenioPayload => {
    const { googleMapsUrl, ...rest } = values
    const coordinates = googleMapsUrl ? extractCoordinatesFromGoogleMapsUrl(googleMapsUrl) : null

    return {
      ...rest,
      lat: coordinates?.lat,
      lng: coordinates?.lng,
    }
  }

  const mutation = useMutation({
    mutationFn: (values: ConvenioFormValues) =>
      mode === 'create' ? conveniosApi.create(toConvenioPayload(values)) : conveniosApi.update(id, toConvenioPayload(values)),
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
        subtitle="Formulario administrativo conectado al catalogo principal."
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
                      <TextField select fullWidth label="Categoria" {...field} error={!!form.formState.errors.categoriaId} helperText={form.formState.errors.categoriaId?.message}>
                        <MenuItem value={0}>Selecciona una categoria</MenuItem>
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
                  <TextField fullWidth label="Direccion" {...form.register('direccion')} error={!!form.formState.errors.direccion} helperText={form.formState.errors.direccion?.message} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label="Horario" {...form.register('horario')} error={!!form.formState.errors.horario} helperText={form.formState.errors.horario?.message} />
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    label="Descripcion"
                    {...form.register('descripcion')}
                    error={!!form.formState.errors.descripcion}
                    helperText={form.formState.errors.descripcion?.message}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox checked={field.value} onChange={(_, checked) => field.onChange(checked)} />}
                        label="Convenio activo"
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    control={form.control}
                    name="isVisibleToBeneficiary"
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox checked={field.value} onChange={(_, checked) => field.onChange(checked)} />}
                        label="Visible en app del beneficiario"
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="URL publica de imagen"
                    placeholder="https://..."
                    {...form.register('imageUrl')}
                    error={!!form.formState.errors.imageUrl}
                    helperText={form.formState.errors.imageUrl?.message ?? 'Opcional'}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Link de Google Maps"
                    placeholder="https://www.google.com/maps/..."
                    {...form.register('googleMapsUrl')}
                    error={!!form.formState.errors.googleMapsUrl}
                    helperText={form.formState.errors.googleMapsUrl?.message ?? 'Opcional. Se extraeran latitud y longitud automaticamente.'}
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
