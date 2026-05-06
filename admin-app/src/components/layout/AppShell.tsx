import { PropsWithChildren, useMemo, useState } from 'react'
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import HandshakeRoundedIcon from '@mui/icons-material/HandshakeRounded'
import GroupRoundedIcon from '@mui/icons-material/GroupRounded'
import SyncAltRoundedIcon from '@mui/icons-material/SyncAltRounded'
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import { Link as RouterLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/auth-context'
import { Permission } from '../../types/auth'

const drawerWidth = 280

interface NavigationItem {
  label: string
  to: string
  icon: React.ReactNode
  permission: Permission
}

export function AppShell({ children }: PropsWithChildren) {
  const theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const { session, logout, hasPermission } = useAuth()

  const navigation = useMemo<NavigationItem[]>(
    () => [
      {
        label: 'Dashboard',
        to: '/dashboard',
        icon: <DashboardRoundedIcon />,
        permission: 'dashboard.read',
      },
      {
        label: 'Catalogos',
        to: '/catalogos',
        icon: <CategoryRoundedIcon />,
        permission: 'lookups.read',
      },
      {
        label: 'Convenios',
        to: '/convenios',
        icon: <HandshakeRoundedIcon />,
        permission: 'convenios.read',
      },
      {
        label: 'Usuarios',
        to: '/usuarios',
        icon: <GroupRoundedIcon />,
        permission: 'users.read',
      },
      {
        label: 'Staging',
        to: '/staging',
        icon: <SyncAltRoundedIcon />,
        permission: 'staging.read',
      },
    ],
    [],
  )

  const visibleNavigation = navigation.filter((item) => hasPermission(item.permission))

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        background:
          'linear-gradient(180deg, #145a22 0%, #0f5a22 35%, #0c3e17 100%)',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 'auto -60px -60px auto',
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(184,212,0,0.28) 0%, rgba(184,212,0,0) 72%)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: '-40px auto auto -40px',
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(31,181,148,0.24) 0%, rgba(31,181,148,0) 70%)',
        },
      }}
    >
      <Box sx={{ px: 3, pt: 4, pb: 3 }}>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 1.25,
            borderRadius: 4,
            backgroundColor: 'rgba(255,255,255,0.96)',
            boxShadow: '0 16px 32px rgba(4, 31, 12, 0.2)',
            mb: 2,
          }}
        >
          <Box
            component="img"
            src="/brand/institucional-logo.png"
            alt="Identidad institucional INPOJUVE"
            sx={{
              display: 'block',
              width: 124,
              maxWidth: '100%',
            }}
          />
        </Box>
        <Typography variant="overline" sx={{ color: 'rgba(226, 232, 240, 0.8)', letterSpacing: '0.18em' }}>
          PWA Admin
        </Typography>
        <Typography variant="h5" sx={{ mt: 1, fontWeight: 800 }}>
          API_TJ
        </Typography>
        <Typography variant="body2" sx={{ mt: 1.5, color: 'rgba(226, 232, 240, 0.82)' }}>
          Operación interna de dashboard, convenios, usuarios y staging.
        </Typography>
      </Box>
      <Divider sx={{ borderColor: 'rgba(184, 212, 0, 0.24)' }} />
      <List sx={{ px: 2, py: 2, flexGrow: 1 }}>
        {visibleNavigation.map((item) => {
          const selected = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)
          return (
            <ListItemButton
              key={item.to}
              component={RouterLink}
              to={item.to}
              selected={selected}
              onClick={() => setMobileOpen(false)}
              sx={{
                borderRadius: 3,
                mb: 1,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(184, 212, 0, 0.22)',
                },
                '&.Mui-selected:hover': {
                  backgroundColor: 'rgba(184, 212, 0, 0.28)',
                },
              }}
            >
              <ListItemIcon sx={{ color: '#f8fafc', minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          )
        })}
      </List>
      <Box sx={{ p: 3, pt: 0 }}>
        <Box
          sx={{
            borderRadius: 4,
            border: '1px solid rgba(184,212,0,0.22)',
            backgroundColor: 'rgba(4, 31, 12, 0.22)',
            p: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: 'rgba(226, 232, 240, 0.9)' }}>
            Sesión de {session?.status === 'active' ? 'acceso activo' : session?.status ?? 'sin estado'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(226, 232, 240, 0.72)' }}>
            El backend invalida la sesión por logout, cambio de rol, bloqueo o reset de contraseña.
          </Typography>
        </Box>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          ml: { lg: `${drawerWidth}px` },
          borderBottom: '1px solid rgba(123, 155, 132, 0.16)',
          backgroundColor: 'rgba(8, 18, 12, 0.84)',
          backdropFilter: 'blur(18px)',
        }}
      >
        <Toolbar sx={{ minHeight: 78, gap: 2 }}>
          {!isDesktop ? (
            <IconButton edge="start" onClick={() => setMobileOpen(true)}>
              <MenuRoundedIcon />
            </IconButton>
          ) : null}
          <Box
            component="img"
            src="/brand/institucional-logo.png"
            alt="Logo institucional INPOJUVE"
            sx={{
              display: { xs: 'none', md: 'block' },
              width: 54,
              height: 54,
              objectFit: 'contain',
              borderRadius: 3,
              backgroundColor: '#f4f7ef',
              border: '1px solid rgba(123, 155, 132, 0.18)',
              p: 0.75,
            }}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Consola administrativa
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Control operativo sobre la API vigente
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Chip label={session?.role ?? 'Sin rol'} color="secondary" variant="outlined" />
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>{session?.user.nombreCompleto?.charAt(0) ?? 'A'}</Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {session?.user.nombreCompleto}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {session?.user.email}
                </Typography>
              </Box>
            </Stack>
            <Button variant="outlined" startIcon={<LogoutRoundedIcon />} onClick={handleLogout}>
              Salir
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}>
        <Drawer
          variant={isDesktop ? 'permanent' : 'temporary'}
          open={isDesktop ? true : mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              border: 0,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          pt: '94px',
          px: { xs: 2, md: 3.5 },
          pb: 4,
        }}
      >
        {children ?? <Outlet />}
      </Box>
    </Box>
  )
}
