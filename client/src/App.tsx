import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Dashboard from './pages/etudiant/Dashboard'
import Annuaire from './pages/etudiant/Annuaire'
import Favoris from './pages/etudiant/Favoris'
import CommercantDashboard from './pages/commercant/Dashboard'
import Scanner from './pages/commercant/Scanner'
import MerchantEdit from './pages/commercant/MerchantEdit'
import MerchantOffers from './pages/commercant/MerchantOffers'
import AdminValidation from './pages/admin/Validation'
import AdminUserList from './pages/admin/AdminUserList'

function decodeRole(token: string): string | null {
  try {
    return JSON.parse(atob(token.split('.')[1])).role ?? null
  } catch {
    return null
  }
}

function ProtectedRoleRoute({ children, roles }: { children: React.ReactNode; roles: string[] }) {
  const token = localStorage.getItem('access_token')
  if (!token) return <Navigate to="/login" replace />
  const role = decodeRole(token)
  if (!role || !roles.includes(role)) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function DashboardRedirect() {
  const token = localStorage.getItem('access_token')
  if (!token) return <Navigate to="/login" replace />
  const role = decodeRole(token)
  if (role === 'COMMERCANT') return <Navigate to="/commercant" replace />
  if (role === 'ADMIN') return <Navigate to="/admin/validation" replace />
  return <Navigate to="/" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<DashboardRedirect />} />

        {/* Commun à tous les rôles authentifiés */}
        <Route path="/profile" element={<ProtectedRoleRoute roles={['ETUDIANT', 'COMMERCANT', 'ADMIN']}><Profile /></ProtectedRoleRoute>} />

        {/* Étudiant */}
        <Route path="/" element={<ProtectedRoleRoute roles={['ETUDIANT']}><Dashboard /></ProtectedRoleRoute>} />
        <Route path="/annuaire" element={<ProtectedRoleRoute roles={['ETUDIANT']}><Annuaire /></ProtectedRoleRoute>} />
        <Route path="/favoris" element={<ProtectedRoleRoute roles={['ETUDIANT']}><Favoris /></ProtectedRoleRoute>} />

        {/* Commerçant */}
        <Route path="/commercant" element={<ProtectedRoleRoute roles={['COMMERCANT']}><CommercantDashboard /></ProtectedRoleRoute>} />
        <Route path="/commercant/scanner" element={<ProtectedRoleRoute roles={['COMMERCANT']}><Scanner /></ProtectedRoleRoute>} />
        <Route path="/merchant/offers" element={<ProtectedRoleRoute roles={['COMMERCANT']}><MerchantOffers /></ProtectedRoleRoute>} />
        <Route path="/merchant/edit" element={<ProtectedRoleRoute roles={['COMMERCANT']}><MerchantEdit /></ProtectedRoleRoute>} />

        {/* Admin */}
        <Route path="/admin/validation" element={<ProtectedRoleRoute roles={['ADMIN']}><AdminValidation /></ProtectedRoleRoute>} />
        <Route path="/admin/users" element={<ProtectedRoleRoute roles={['ADMIN']}><AdminUserList /></ProtectedRoleRoute>} />
        <Route path="/admin" element={<ProtectedRoleRoute roles={['ADMIN']}><Navigate to="/admin/validation" replace /></ProtectedRoleRoute>} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
