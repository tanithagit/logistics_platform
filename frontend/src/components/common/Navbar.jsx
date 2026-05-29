import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LogOut, Truck, User, LayoutDashboard } from 'lucide-react'

function Navbar() {
  const { user, logout, isAdmin, isDriver, isCustomer } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getDashboardLink = () => {
    if (isAdmin()) return '/admin'
    if (isDriver()) return '/driver'
    if (isCustomer()) return '/customer'
    return '/'
  }

  const getRoleBadgeColor = () => {
    if (isAdmin()) return 'bg-purple-500'
    if (isDriver()) return 'bg-blue-500'
    if (isCustomer()) return 'bg-green-500'
    return 'bg-gray-500'
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-700 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate(getDashboardLink())}
        >
          <Truck className="text-blue-400" size={28} />
          <span className="text-white font-bold text-xl">
            FleetManager
          </span>
        </div>

        {/* User info & logout */}
        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User size={16} className="text-gray-400" />
              <span className="text-gray-300 text-sm">
                {user.full_name}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full text-white ${getRoleBadgeColor()}`}>
                {user.role}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors"
            >
              <LogOut size={18} />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar