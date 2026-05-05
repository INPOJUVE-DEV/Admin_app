import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  Alert,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import PasswordRoundedIcon from '@mui/icons-material/PasswordRounded'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { PageHeader } from '../../components/common/PageHeader'
import { StatusBadge } from '../../components/data-display/StatusBadge'
import { ErrorState } from '../../components/feedback/ErrorState'
import { formatDateTime, formatPhone } from '../../lib/formatters'
import { queryKeys } from '../../lib/query-keys'
import { useAuth } from '../auth/auth-context'
import { usersApi } from './api'

export function UserDetailPage() {
  const { id = '' } = useParams()
  const { hasPermission } = useAuth()
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [password, setPassword] = useState('')

  const userQuery = useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => usersApi.detail(id),
  })

  const passwordMutation = useMutation({
    mutationFn: () => usersApi.setPassword(id, password),
    onSuccess: () => {
      setPasswordDialogOpen(false)
      setPassword('')
    },
  })

  if (userQuery.isError) {
    return <ErrorState description={userQuery.error.message} onRetry={() => void userQuery.refetch()} />
  }

  const user = userQuery.data

  return (
    <>
      <PageHeader
        title={user?.nombreCompleto ?? 'Detalle de usuario'}
        subtitle="Consulta de estado, rol y actividad reciente del usuario interno."
        actions={
          hasPermission('users.write') ? (
            <Stack direction="row" spacing={1.5}>
              <Button variant="outlined" startIcon={<PasswordRoundedIcon />} onClick={() => setPasswordDialogOpen(true)}>
                Reset password
              </Button>
              <Button component={RouterLink} to={`/usuarios/${id}/editar`} variant="contained" startIcon={<EditRoundedIcon />}>
                Editar
              </Button>
            </Stack>
          ) : undefined
        }
      />
      {userQuery.isLoading || !user ? (
        <Alert severity="info">Cargando usuario...</Alert>
      ) : (
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Detail label="Correo" value={user.email} />
              <Detail label="Teléfono" value={formatPhone(user.telefono)} />
              <Detail label="Rol" value={user.role} />
              <Detail label="Estatus" valueNode={<StatusBadge value={user.status} />} />
              <Detail label="Municipio" value={user.municipio ?? 'Sin dato'} />
              <Detail label="Último login" value={formatDateTime(user.lastLoginAt)} />
              <Detail label="Último intento fallido" value={formatDateTime(user.lastFailedLoginAt)} />
              <Detail label="Creado" value={formatDateTime(user.createdAt)} />
            </Grid>
          </CardContent>
        </Card>
      )}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Resetear password</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            type="password"
            label="Nueva contraseña"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {passwordMutation.isError ? <Alert severity="error" sx={{ mt: 2 }}>{passwordMutation.error.message}</Alert> : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={() => passwordMutation.mutate()} disabled={password.length < 8 || passwordMutation.isPending}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

function Detail({ label, value, valueNode }: { label: string; value?: string; valueNode?: React.ReactNode }) {
  return (
    <Grid size={{ xs: 12, md: 6 }}>
      <Stack spacing={0.5}>
        <Typography color="text.secondary">{label}</Typography>
        {valueNode ?? <Typography sx={{ fontWeight: 700 }}>{value}</Typography>}
      </Stack>
    </Grid>
  )
}
