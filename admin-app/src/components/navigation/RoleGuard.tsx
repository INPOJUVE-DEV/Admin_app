import { PropsWithChildren } from 'react'
import { Alert, Box } from '@mui/material'
import { Permission } from '../../types/auth'
import { useAuth } from '../../features/auth/auth-context'

interface RoleGuardProps extends PropsWithChildren {
  permission: Permission
}

export function RoleGuard({ permission, children }: RoleGuardProps) {
  const { hasPermission } = useAuth()

  if (!hasPermission(permission)) {
    return (
      <Box sx={{ py: 6 }}>
        <Alert severity="error">No tienes permisos para acceder a este módulo.</Alert>
      </Box>
    )
  }

  return <>{children}</>
}
