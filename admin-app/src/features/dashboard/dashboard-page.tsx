import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  LinearProgress,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material'
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import { PageHeader } from '../../components/common/PageHeader'
import { StatusBadge } from '../../components/data-display/StatusBadge'
import { ErrorState } from '../../components/feedback/ErrorState'
import { useAuth } from '../auth/auth-context'
import { stagingApi } from '../staging/api'
import { usersApi } from '../users/api'
import { formatNumber } from '../../lib/formatters'
import { queryKeys } from '../../lib/query-keys'
import { dashboardApi } from './api'

const readableStageLabels: Record<string, string> = {
  pending: 'Por enviar',
  accepted: 'Recibidos',
  rejected: 'Rechazados',
  error: 'Con incidencia',
  sent: 'En camino',
}

interface PushBatchResult {
  total: number
  ok: number
  failed: number
}

export function DashboardPage() {
  const queryClient = useQueryClient()
  const { hasPermission } = useAuth()
  const [toast, setToast] = useState<{ severity: 'success' | 'warning'; message: string } | null>(null)
  const [pushProgress, setPushProgress] = useState({ total: 0, done: 0 })

  const dashboardQuery = useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: dashboardApi.get,
  })

  const activeCardsQuery = useQuery({
    queryKey: ['users-active-cardholders'],
    queryFn: usersApi.countActiveCardholders,
  })

  const pushPendingMutation = useMutation({
    mutationFn: async (): Promise<PushBatchResult> => {
      const pendingRecords = await stagingApi.listPendingRecords()
      setPushProgress({
        total: pendingRecords.length,
        done: 0,
      })

      let ok = 0
      let failed = 0

      for (const [index, record] of pendingRecords.entries()) {
        try {
          await stagingApi.push(record.id)
          ok += 1
        } catch {
          failed += 1
        } finally {
          setPushProgress({
            total: pendingRecords.length,
            done: index + 1,
          })
        }
      }

      return {
        total: pendingRecords.length,
        ok,
        failed,
      }
    },
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard }),
        queryClient.invalidateQueries({ queryKey: ['staging-list'] }),
        queryClient.invalidateQueries({ queryKey: ['staging-detail'] }),
        queryClient.invalidateQueries({ queryKey: ['staging-attempts'] }),
      ])

      if (result.total === 0) {
        setToast({
          severity: 'success',
          message: 'No había registros pendientes por enviar.',
        })
        return
      }

      if (result.failed === 0) {
        setToast({
          severity: 'success',
          message: `Sistema central recibió ${result.ok} registros.`,
        })
        return
      }

      setToast({
        severity: 'warning',
        message: `Se enviaron ${result.ok} de ${result.total} registros. Revisa los pendientes restantes.`,
      })
    },
  })

  if (dashboardQuery.isError || activeCardsQuery.isError) {
    return (
      <ErrorState
        description={(dashboardQuery.error ?? activeCardsQuery.error)?.message ?? 'No fue posible cargar el dashboard.'}
        onRetry={() => {
          void dashboardQuery.refetch()
          void activeCardsQuery.refetch()
        }}
      />
    )
  }

  const data = dashboardQuery.data
  const activeCards = activeCardsQuery.data
  const pendingCount = data?.staging.pending ?? 0
  const showPushCard = hasPermission('staging.push')
  const pushLabel = `Enviar a sistema central ${formatNumber(pendingCount)} registros`
  const progressPercent =
    pushPendingMutation.isPending && pushProgress.total > 0
      ? Math.round((pushProgress.done / pushProgress.total) * 100)
      : 0

  const stagingEntries = useMemo(() => {
    if (!data) {
      return []
    }

    return Object.entries(data.staging)
  }, [data])

  return (
    <>
      <PageHeader
        title="Panel principal"
        subtitle="Resumen rápido de convenios activos, personas con tarjeta activa y envíos hacia el sistema central."
      />
      {dashboardQuery.isLoading || activeCardsQuery.isLoading || !data || activeCards === undefined ? (
        <Alert severity="info">Cargando indicadores del panel...</Alert>
      ) : (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6, xl: 3 }}>
            <MetricCard
              label="Convenios activos"
              value={formatNumber(data.catalog.benefits)}
              detail="Beneficios disponibles actualmente para consulta."
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, xl: 3 }}>
            <MetricCard
              label="Usuarios con tarjeta activa"
              value={formatNumber(activeCards)}
              detail="Personas activas ligadas al sistema de tarjetas."
            />
          </Grid>
          <Grid size={{ xs: 12, lg: showPushCard ? 4 : 6 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                  Estado de envíos
                </Typography>
                <Grid container spacing={1.5}>
                  {stagingEntries.map(([status, value]) => (
                    <Grid key={status} size={{ xs: 12, sm: 6 }}>
                      <Stack
                        direction="row"
                        sx={{
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderRadius: 3,
                          px: 2,
                          py: 1.5,
                          backgroundColor: 'rgba(20, 90, 34, 0.05)',
                          border: '1px solid rgba(20, 90, 34, 0.08)',
                        }}
                      >
                        <StatusBadge value={readableStageLabels[status] ?? status} />
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                          {formatNumber(value)}
                        </Typography>
                      </Stack>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          {showPushCard ? (
            <Grid size={{ xs: 12, lg: 5 }}>
              <Card
                sx={{
                  height: '100%',
                  overflow: 'hidden',
                  position: 'relative',
                  background:
                    pushPendingMutation.isPending
                      ? 'linear-gradient(135deg, #145a22 0%, #0c3e17 100%)'
                      : 'linear-gradient(135deg, rgba(184,212,0,0.16) 0%, rgba(31,181,148,0.1) 50%, rgba(228,0,124,0.06) 100%)',
                  color: pushPendingMutation.isPending ? '#f8fafc' : 'inherit',
                  transition: 'transform 240ms ease, box-shadow 240ms ease',
                  animation: pushPendingMutation.isPending ? 'dashboardPulse 1.4s ease-in-out infinite' : 'none',
                  '@keyframes dashboardPulse': {
                    '0%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-4px)' },
                    '100%': { transform: 'translateY(0px)' },
                  },
                }}
              >
                {pushPendingMutation.isPending ? (
                  <LinearProgress
                    variant="determinate"
                    value={progressPercent}
                    sx={{
                      height: 6,
                      backgroundColor: 'rgba(255,255,255,0.12)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#b8d400',
                      },
                    }}
                  />
                ) : null}
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2.5}>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>
                          Envío al sistema central
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            mt: 1,
                            color: pushPendingMutation.isPending ? 'rgba(248,250,252,0.82)' : 'text.secondary',
                          }}
                        >
                          Envía en bloque todos los registros que todavía están por salir.
                        </Typography>
                      </Box>
                      <Chip
                        icon={
                          pushPendingMutation.isPending ? <CircularProgress size={16} sx={{ color: 'inherit !important' }} /> : <CheckCircleRoundedIcon />
                        }
                        label={pushPendingMutation.isPending ? 'Procesando' : 'Listo'}
                        sx={{
                          color: 'inherit',
                          borderColor: pushPendingMutation.isPending ? 'rgba(255,255,255,0.24)' : 'rgba(20,90,34,0.16)',
                          backgroundColor: pushPendingMutation.isPending ? 'rgba(255,255,255,0.08)' : 'rgba(252,253,248,0.62)',
                        }}
                        variant="outlined"
                      />
                    </Stack>
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: 4,
                        backgroundColor: pushPendingMutation.isPending ? 'rgba(255,255,255,0.08)' : 'rgba(252,253,248,0.78)',
                      }}
                    >
                      <Typography variant="overline" sx={{ letterSpacing: '0.16em', opacity: 0.88 }}>
                        Registros pendientes
                      </Typography>
                      <Typography variant="h2" sx={{ mt: 0.5, mb: 1 }}>
                        {formatNumber(pendingCount)}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.85 }}>
                        {pushPendingMutation.isPending
                          ? `Enviando ${formatNumber(pushProgress.done)} de ${formatNumber(pushProgress.total)} registros.`
                          : 'Cuando el sistema central confirme la recepción, el panel se actualizará automáticamente.'}
                      </Typography>
                    </Box>
                    <Button
                      size="large"
                      variant="contained"
                      startIcon={pushPendingMutation.isPending ? <CircularProgress size={18} color="inherit" /> : <CloudUploadRoundedIcon />}
                      disabled={pushPendingMutation.isPending || pendingCount === 0}
                      onClick={() => pushPendingMutation.mutate()}
                      sx={{
                        minHeight: 68,
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        backgroundColor: pushPendingMutation.isPending ? 'rgba(255,255,255,0.16)' : 'primary.main',
                        color: pushPendingMutation.isPending ? '#f8fafc' : '#f8fafc',
                        '&:hover': {
                          backgroundColor: pushPendingMutation.isPending ? 'rgba(255,255,255,0.22)' : 'primary.dark',
                        },
                      }}
                    >
                      {pushPendingMutation.isPending ? 'Enviando registros...' : pushLabel}
                    </Button>
                    {pendingCount === 0 ? (
                      <Alert severity="success" sx={{ borderRadius: 3 }}>
                        Todo está al día. No hay registros pendientes por enviar.
                      </Alert>
                    ) : null}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ) : null}
        </Grid>
      )}
      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {toast ? (
          <Alert
            onClose={() => setToast(null)}
            severity={toast.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {toast.message}
          </Alert>
        ) : (
          <Box />
        )}
      </Snackbar>
    </>
  )
}

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography color="text.secondary">{label}</Typography>
        <Typography variant="h3" sx={{ mt: 1.5, mb: 1.5 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {detail}
        </Typography>
      </CardContent>
    </Card>
  )
}
