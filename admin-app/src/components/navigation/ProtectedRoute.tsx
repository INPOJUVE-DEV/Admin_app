import { Box, CircularProgress } from '@mui/material'
import { Navigate, useLocation } from 'react-router-dom'
import { PropsWithChildren } from 'react'
import { useAuth } from '../../features/auth/auth-context'

export function ProtectedRoute({ children }: PropsWithChildren) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
