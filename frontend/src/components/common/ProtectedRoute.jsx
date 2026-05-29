import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function ProtectedRoute({ children, allowedRoles }) {
  const { isLoggedIn, user, loading } = useAuth()

  // Wait for auth check to complete
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  // Not logged in → go to login page
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  // Wrong role → go to their own dashboard
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    if (user?.role === 'admin') return <Navigate to="/admin" replace />
    if (user?.role === 'driver') return <Navigate to="/driver" replace />
    if (user?.role === 'customer') return <Navigate to="/customer" replace />
  }

  return children
}

export default ProtectedRoute