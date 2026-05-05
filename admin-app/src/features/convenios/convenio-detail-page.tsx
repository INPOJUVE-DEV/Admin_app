import { useQuery } from '@tanstack/react-query'
import { Alert, Button, Card, CardContent, Grid, Stack, Typography } from '@mui/material'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { PageHeader } from '../../components/common/PageHeader'
import { ErrorState } from '../../components/feedback/ErrorState'
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
        subtitle="Consulta operativa del recurso publicado en el catálogo."
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
              <DetailItem label="Categoría" value={convenio.categoria} />
              <DetailItem label="Municipio" value={convenio.municipio} />
              <DetailItem label="Descuento" value={convenio.descuento} />
              <DetailItem label="Dirección" value={convenio.direccion} />
              <DetailItem label="Horario" value={convenio.horario} />
              <DetailItem label="Latitud" value={convenio.lat?.toString() ?? 'Sin dato'} />
              <DetailItem label="Longitud" value={convenio.lng?.toString() ?? 'Sin dato'} />
              <Grid size={12}>
                <Stack spacing={1}>
                  <Typography color="text.secondary">Descripción</Typography>
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
