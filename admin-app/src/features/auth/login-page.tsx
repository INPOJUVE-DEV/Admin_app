import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import LoginRoundedIcon from '@mui/icons-material/LoginRounded'
import { useLocation, useNavigate } from 'react-router-dom'
import { ApiError } from '../../types/common'
import { useAuth } from './auth-context'

const loginSchema = z.object({
  username: z.string().min(3, 'Ingresa tu usuario o correo'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const auth = useAuth()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const loginMutation = useMutation({
    mutationFn: (values: LoginFormValues) => auth.login(values),
    onSuccess: () => {
      navigate('/dashboard', { replace: true })
    },
    onError: (error: ApiError) => {
      const message =
        error.status === 400 || error.status === 401
          ? 'Credenciales invalidas'
          : error.message

      form.setError('root', {
        type: 'server',
        message,
      })
    },
  })

  useEffect(() => {
    if (!auth.isLoading && auth.isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [auth.isAuthenticated, auth.isLoading, navigate])

  const notice = useMemo(() => auth.consumeNotice(), [auth])
  const returnTo = (location.state as { from?: string } | null)?.from

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        background:
          'radial-gradient(circle at top left, rgba(31,181,148,0.24), transparent 24%), radial-gradient(circle at bottom right, rgba(228,0,124,0.14), transparent 20%), linear-gradient(180deg, #0c3e17 0%, #145a22 48%, #f3f5ec 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ borderRadius: 6, overflow: 'hidden' }}>
          <Box
            sx={{
              px: { xs: 3, md: 4 },
              pt: { xs: 3, md: 4 },
              pb: 3,
              background: 'linear-gradient(135deg, #145a22 0%, #0f5a22 64%, #0c3e17 100%)',
              color: '#f8fafc',
              position: 'relative',
              overflow: 'hidden',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: -24,
                right: -24,
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(184,212,0,0.34) 0%, rgba(184,212,0,0) 68%)',
              },
            }}
          >
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 1.25,
                borderRadius: 4,
                backgroundColor: 'rgba(255,255,255,0.96)',
                boxShadow: '0 18px 36px rgba(4, 31, 12, 0.22)',
                mb: 2.25,
              }}
            >
              <Box
                component="img"
                src="/brand/institucional-logo.png"
                alt="Identidad institucional INPOJUVE"
                sx={{
                  display: 'block',
                  width: { xs: 132, md: 156 },
                  maxWidth: '100%',
                }}
              />
            </Box>
            <Typography variant="overline" sx={{ letterSpacing: '0.2em' }}>
              Backoffice interno
            </Typography>
            <Typography variant="h4" sx={{ mt: 1 }}>
              API_TJ Admin
            </Typography>
            <Typography sx={{ mt: 1.5, color: 'rgba(226,232,240,0.82)' }}>
              Acceso administrativo con sesión JWT de 8 horas y permisos servidos por backend.
            </Typography>
          </Box>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={2.5}>
              {notice ? <Alert severity="warning">{notice}</Alert> : null}
              {returnTo ? <Alert severity="info">Tu sesión debe ser válida para entrar a {returnTo}.</Alert> : null}
              <form onSubmit={form.handleSubmit((values) => loginMutation.mutate(values))}>
                <Stack spacing={2}>
                  <TextField
                    label="Usuario o correo"
                    autoComplete="username"
                    {...form.register('username')}
                    error={!!form.formState.errors.username}
                    helperText={form.formState.errors.username?.message}
                  />
                  <TextField
                    label="Contraseña"
                    type="password"
                    autoComplete="current-password"
                    {...form.register('password')}
                    error={!!form.formState.errors.password}
                    helperText={form.formState.errors.password?.message}
                  />
                  {form.formState.errors.root ? <Alert severity="error">{form.formState.errors.root.message}</Alert> : null}
                  <Button type="submit" size="large" variant="contained" startIcon={<LoginRoundedIcon />} disabled={loginMutation.isPending || auth.isLoading}>
                    Entrar al dashboard
                  </Button>
                </Stack>
              </form>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
