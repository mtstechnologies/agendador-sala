import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from './hooks/useAuth'
import { Layout } from './components/layout/Layout'
import { AuthPage } from './pages/AuthPage'
import { Dashboard } from './pages/Dashboard'
import { RoomsPage } from './pages/RoomsPage'
import AdminCadastrosPage from './pages/admin/AdminCadastrosPage'
import { SchedulePage } from './pages/SchedulePage'
import { ReservationsPage } from './pages/ReservationsPage'
import { AdminReservationsPage } from './pages/admin/AdminReservationsPage'
import { ReportsPage } from './pages/admin/ReportsPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'
import AdminPlaceholderPage from './pages/admin/AdminPlaceholderPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import { ToastViewport } from './components/ui/Toast'
import { AuthProvider, useAuthContext } from './contexts/AuthContext'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { user, loading, isAdmin } = useAuth()
  // DEBUG: Exibir user, isAdmin e adminOnly
  console.log('[ProtectedRoute] user:', user, 'isAdmin:', isAdmin, 'adminOnly:', adminOnly)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  const { user, loading, returnTo, setReturnTo } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Redirecionar automaticamente depois do login/logout
  React.useEffect(() => {
    if (!loading) {
      if (user && location.pathname === '/auth') {
        // Restaurar rota original, se houver
        let target: string | null = returnTo
        if (!target) {
          try {
            target = sessionStorage.getItem('returnTo')
          } catch {}
        }
        if (target && target !== '/auth') {
          navigate(target, { replace: true })
        } else {
          navigate('/', { replace: true })
        }
        try {
          sessionStorage.removeItem('returnTo')
        } catch {}
        setReturnTo(null)
      }
      if (!user) {
        // Permitir rotas públicas sem forçar redirecionamento para /auth
        const publicPaths = ['/auth', '/forgot-password', '/reset-password']
        const isPublic = publicPaths.some(p => location.pathname.startsWith(p))
        if (!isPublic) {
          navigate('/auth', { replace: true })
        }
      }
    }
  }, [user, loading])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        {/* Painel de agendamento visual - apenas usuário comum */}
        <Route 
          path="/agendar" 
          element={
            <ProtectedRoute adminOnly={false}>
              <SchedulePage />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/admin/rooms" 
          element={
            <ProtectedRoute adminOnly>
              <AdminCadastrosPage />
            </ProtectedRoute>
          }
        />
        <Route path="/reservations" element={<ReservationsPage />} />
  <Route path="/rooms" element={<RoomsPage />} />
        <Route 
          path="/admin/reservations" 
          element={
            <ProtectedRoute adminOnly>
              <AdminReservationsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/reports" 
          element={
            <ProtectedRoute adminOnly>
              <ReportsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/settings" 
          element={
            <ProtectedRoute adminOnly>
              <AdminSettingsPage />
            </ProtectedRoute>
          } 
        />
        {/* Placeholders para futuras rotas admin */}
        <Route 
          path="/admin/usuarios" 
          element={
            <ProtectedRoute adminOnly>
              <AdminUsersPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/logs" 
          element={
            <ProtectedRoute adminOnly>
              <AdminPlaceholderPage title="Logs do Sistema" />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppRoutes />
          <ToastViewport />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}