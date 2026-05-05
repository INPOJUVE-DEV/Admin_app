import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { ProtectedRoute } from '../components/navigation/ProtectedRoute'
import { RoleGuard } from '../components/navigation/RoleGuard'
import { LoginPage } from '../features/auth/login-page'
import { ConvenioDetailPage } from '../features/convenios/convenio-detail-page'
import { ConvenioFormPage } from '../features/convenios/convenio-form-page'
import { ConveniosListPage } from '../features/convenios/convenios-list-page'
import { DashboardPage } from '../features/dashboard/dashboard-page'
import { StagingDetailPage } from '../features/staging/staging-detail-page'
import { StagingListPage } from '../features/staging/staging-list-page'
import { UserDetailPage } from '../features/users/user-detail-page'
import { UserFormPage } from '../features/users/user-form-page'
import { UsersListPage } from '../features/users/users-list-page'

function AppLayout() {
  return (
    <ProtectedRoute>
      <AppShell>
        <Outlet />
      </AppShell>
    </ProtectedRoute>
  )
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      {
        path: 'dashboard',
        element: (
          <RoleGuard permission="dashboard.read">
            <DashboardPage />
          </RoleGuard>
        ),
      },
      {
        path: 'convenios',
        element: (
          <RoleGuard permission="convenios.read">
            <ConveniosListPage />
          </RoleGuard>
        ),
      },
      {
        path: 'convenios/nuevo',
        element: (
          <RoleGuard permission="convenios.write">
            <ConvenioFormPage mode="create" />
          </RoleGuard>
        ),
      },
      {
        path: 'convenios/:id',
        element: (
          <RoleGuard permission="convenios.read">
            <ConvenioDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: 'convenios/:id/editar',
        element: (
          <RoleGuard permission="convenios.write">
            <ConvenioFormPage mode="edit" />
          </RoleGuard>
        ),
      },
      {
        path: 'usuarios',
        element: (
          <RoleGuard permission="users.read">
            <UsersListPage />
          </RoleGuard>
        ),
      },
      {
        path: 'usuarios/nuevo',
        element: (
          <RoleGuard permission="users.write">
            <UserFormPage mode="create" />
          </RoleGuard>
        ),
      },
      {
        path: 'usuarios/:id',
        element: (
          <RoleGuard permission="users.read">
            <UserDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: 'usuarios/:id/editar',
        element: (
          <RoleGuard permission="users.write">
            <UserFormPage mode="edit" />
          </RoleGuard>
        ),
      },
      {
        path: 'staging',
        element: (
          <RoleGuard permission="staging.read">
            <StagingListPage />
          </RoleGuard>
        ),
      },
      {
        path: 'staging/:id',
        element: (
          <RoleGuard permission="staging.read">
            <StagingDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: '*',
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
])
