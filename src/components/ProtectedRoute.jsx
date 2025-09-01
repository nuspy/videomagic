import { Navigate, Outlet } from 'react-router-dom'

const isAuthenticated = () => {
  try {
    return localStorage.getItem('authed') === 'true'
  } catch {
    return false
  }
}

export default function ProtectedRoute() {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/" replace />
}
