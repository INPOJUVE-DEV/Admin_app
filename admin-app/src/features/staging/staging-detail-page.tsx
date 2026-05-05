import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Alert,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import { useParams } from 'react-router-dom'
import { PageHeader } from '../../components/common/PageHeader'
import { DataColumn, DataTable } from '../../components/data-display/DataTable'
import { StatusBadge } from '../../components/data-display/StatusBadge'
import { ConfirmDialog } from '../../components/feedback/ConfirmDialog'
import { ErrorState } from '../../components/feedback/ErrorState'
import { formatDateTime } from '../../lib/formatters'
import { queryKeys } from '../../lib/query-keys'
import { useAuth } from '../auth/auth-context'
import { StagingAttempt } from '../../types/staging'
import { stagingApi } from './api'

export function StagingDetailPage() {
  const { id = '' } = useParams()
  const queryClient = useQueryClient()
  const { hasPermission } = useAuth()
  const [confirmPush, setConfirmPush] = useState(false)

  const detailQuery = useQuery({
    queryKey: queryKeys.staging.detail(id),
    queryFn: () => stagingApi.detail(id),
  })

  const attemptsQuery = useQuery({
    queryKey: queryKeys.staging.attempts(id),
    queryFn: () => stagingApi.attempts(id),
  })

  const pushMutation = useMutation({
    mutationFn: () => stagingApi.push(id),
    onSuccess: async () => {
      setConfirmPush(false)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['staging-detail', id] }),
        queryClient.invalidateQueries({ queryKey: ['staging-attempts', id] }),
        queryClient.invalidateQueries({ queryKey: ['staging-list'] }),
      ])
    },
  })

  const attemptsColumns: DataColumn<StagingAttempt>[] = [
    {
      key: 'attempted_at',
      header: 'Fecha',
      render: (row) => formatDateTime(row.attempted_at),
    },
    {
      key: 'actor',
      header: 'Actor',
      render: (row) => row.actor,
    },
    {
      key: 'status',
      header: 'Estatus',
      render: (row) => <StatusBadge value={row.status} />,
    },
    {
      key: 'response_status',
      header: 'HTTP',
      render: (row) => row.response_status?.toString() ?? 'Sin dato',
    },
    {
      key: 'error_message',
      header: 'Mensaje',
      render: (row) => row.error_message ?? 'Sin error',
    },
  ]

  if (detailQuery.isError || attemptsQuery.isError) {
    return (
      <ErrorState
        description={(detailQuery.error ?? attemptsQuery.error)?.message ?? 'No fue posible cargar el detalle.'}
        onRetry={() => {
          void detailQuery.refetch()
          void attemptsQuery.refetch()
        }}
      />
    )
  }

  const staging = detailQuery.data
  const attempts = attemptsQuery.data?.items ?? []

  return (
    <>
      <PageHeader
        title={staging?.external_request_id ?? 'Detalle de staging'}
        subtitle="Detalle operativo, payload enmascarado e historial de intentos de push."
        actions={
          hasPermission('staging.push') ? (
            <Button variant="contained" startIcon={<SendRoundedIcon />} onClick={() => setConfirmPush(true)}>
              Push manual
            </Button>
          ) : undefined
        }
      />
      {detailQuery.isLoading || !staging ? (
        <Alert severity="info">Cargando detalle de staging...</Alert>
      ) : (
        <Stack spacing={3}>
          {pushMutation.isSuccess ? <Alert severity="success">{pushMutation.data.message}</Alert> : null}
          {pushMutation.isError ? <Alert severity="error">{pushMutation.error.message}</Alert> : null}
          <Card>
            <CardContent>
              <Grid container spacing={3}>
                <Detail label="CURP" value={staging.curp_masked} />
                <Detail label="Estatus" valueNode={<StatusBadge value={staging.status} />} />
                <Detail label="Sistema origen" value={staging.submitted_by_system} />
                <Detail label="Enviado al backend" value={formatDateTime(staging.submitted_at)} />
                <Detail label="Enviado a Sys_IPJ" value={formatDateTime(staging.sent_at)} />
                <Detail label="Resuelto" value={formatDateTime(staging.resolved_at)} />
                <Detail label="Locked at" value={formatDateTime(staging.locked_at)} />
                <Detail label="Locked by" value={staging.locked_by ?? 'Sin dato'} />
                <Detail label="Código Sys_IPJ" value={staging.sys_ipj_response_code?.toString() ?? 'Sin dato'} />
              </Grid>
              <Divider sx={{ my: 3 }} />
              <Stack spacing={1.25}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Payload visible
                </Typography>
                {staging.payload ? (
                  <Card variant="outlined" sx={{ backgroundColor: 'rgba(15,23,42,0.03)' }}>
                    <CardContent>
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {JSON.stringify(staging.payload, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                ) : (
                  <Alert severity="info">Este usuario no recibe payload sensible para este registro.</Alert>
                )}
              </Stack>
            </CardContent>
          </Card>
          {attemptsQuery.isLoading ? (
            <Alert severity="info">Cargando intentos de push...</Alert>
          ) : (
            <DataTable
              columns={attemptsColumns}
              rows={attempts}
              rowKey={(row) => row.id}
              page={1}
              pageSize={attempts.length || 1}
              total={attempts.length}
              onPageChange={() => undefined}
            />
          )}
        </Stack>
      )}
      <ConfirmDialog
        open={confirmPush}
        title="Ejecutar push manual"
        message="Se enviará nuevamente este beneficiario hacia Sys_IPJ y después se refrescará el detalle."
        confirmLabel="Enviar"
        onClose={() => setConfirmPush(false)}
        onConfirm={() => pushMutation.mutate()}
        loading={pushMutation.isPending}
      />
    </>
  )
}

function Detail({ label, value, valueNode }: { label: string; value?: string; valueNode?: React.ReactNode }) {
  return (
    <Grid size={{ xs: 12, md: 4 }}>
      <Stack spacing={0.5}>
        <Typography color="text.secondary">{label}</Typography>
        {valueNode ?? <Typography sx={{ fontWeight: 700 }}>{value}</Typography>}
      </Stack>
    </Grid>
  )
}
