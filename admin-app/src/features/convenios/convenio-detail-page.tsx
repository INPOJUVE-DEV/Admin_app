import { useQuery } from '@tanstack/react-query'
import { Alert, Box, Button, Card, CardContent, Grid, Link, Stack, Typography } from '@mui/material'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { PageHeader } from '../../components/common/PageHeader'
import { ErrorState } from '../../components/feedback/ErrorState'
import { normalizeImageUrl } from '../../lib/google-drive'
import { useAuth } from '../auth/auth-context'
import { queryKeys } from '../../lib/query-keys'
import { conveniosApi } from './api'

export function ConvenioDetailPage() {
  const { id = '' } = useParams()
  const { hasPermission } = useAuth()
  const detailQuery = useQuery({
    queryKey: queryKeys.convenios.detail(id),
    queryFn: () => conveniosApi.detail(id),
  })

  if (detailQuery.isError) {
    return <ErrorState description={detailQuery.error.message} onRetry={() => void detailQuery.refetch()} />
  }

  const convenio = detailQuery.data

  return (
    <>
      <PageHeader
        title={convenio?.nombre ?? 'Detalle de convenio'}
        subtitle="Consulta operativa del recurso publicado en el catalogo."
        actions={
          hasPermission('convenios.write') ? (
            <Button component={RouterLink} to={`/convenios/${id}/editar`} variant="contained" startIcon={<EditRoundedIcon />}>
              Editar
            </Button>
          ) : undefined
        }
      />
      {detailQuery.isLoading || !convenio ? (
        <Alert severity="info">Cargando detalle del convenio...</Alert>
      ) : (
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <DetailItem label="Categoria" value={convenio.categoria} />
              <DetailItem label="Municipio" value={convenio.municipio} />
              <DetailItem label="Descuento" value={convenio.descuento} />
              <DetailItem label="Direccion" value={convenio.direccion} />
              <DetailItem label="Horario" value={convenio.horario} />
              <DetailItem label="Latitud" value={convenio.lat?.toString() ?? 'Sin dato'} />
              <DetailItem label="Longitud" value={convenio.lng?.toString() ?? 'Sin dato'} />
              <DetailItem label="Activo" value={convenio.isActive ? 'Si' : 'No'} />
              <DetailItem label="Visible para beneficiario" value={convenio.isVisibleToBeneficiary ? 'Si' : 'No'} />
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={0.5}>
                  <Typography color="text.secondary">Imagen</Typography>
                  {convenio.imageUrl ? (
                    <>
                      <Box
                        component="img"
                        src={normalizeImageUrl(convenio.imageUrl)}
                        alt={convenio.nombre}
                        sx={{
                          width: '100%',
                          maxWidth: 420,
                          maxHeight: 280,
                          objectFit: 'contain',
                          borderRadius: 2,
                          border: (theme) => `1px solid ${theme.palette.divider}`,
                          bgcolor: 'grey.50',
                          p: 1,
                        }}
                      />
                      <Link href={normalizeImageUrl(convenio.imageUrl)} target="_blank" rel="noreferrer">
                        {convenio.imageUrl}
                      </Link>
                    </>
                  ) : (
                    <Typography sx={{ fontWeight: 700 }}>Sin dato</Typography>
                  )}
                </Stack>
              </Grid>
              <Grid size={12}>
                <Stack spacing={1}>
                  <Typography color="text.secondary">Descripcion</Typography>
                  <Typography>{convenio.descripcion}</Typography>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <Grid size={{ xs: 12, md: 6 }}>
      <Stack spacing={0.5}>
        <Typography color="text.secondary">{label}</Typography>
        <Typography sx={{ fontWeight: 700 }}>{value}</Typography>
      </Stack>
    </Grid>
  )
}
