import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AdminOverview from './AdminOverview'
import DriversPage from './DriversPage'
import VehiclesPage from './VehiclesPage'
import DeliveriesPage from './DeliveriesPage'
import {
  LayoutDashboard, Users, Truck,
  Package, LogOut, Menu, X
} from 'lucide-react'
import { useState } from 'react'

function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
    { to: '/admin/drivers', icon: Users, label: 'Drivers' },
    { to: '/admin/vehicles', icon: Truck, label: 'Vehicles' },
    { to: '/admin/deliveries', icon: Package, label: 'Deliveries' },
  ]

  return (
    <div className="min-h-screen bg-gray-950 flex">

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'}
                         bg-gray-900 border-r border-gray-700
                         flex flex-col transition-all duration-300
                         fixed h-full z-20`}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5
                        border-b border-gray-700">
          <Truck className="text-blue-400 shrink-0" size={24} />
          {sidebarOpen && (
            <span className="text-white font-bold text-lg">
              FleetManager
            </span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto text-gray-400 hover:text-white"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* User info */}
        {sidebarOpen && (
          <div className="px-4 py-3 border-b border-gray-700">
            <p className="text-white text-sm font-medium">
              {user?.full_name}
            </p>
            <span className="text-xs bg-purple-500/20 text-purple-400
                             border border-purple-500/30 px-2 py-0.5
                             rounded-full">
              Admin
            </span>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg
                 transition-colors ${isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              {sidebarOpen && <span className="text-sm">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-2 py-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg
                       text-gray-400 hover:text-red-400
                       hover:bg-red-500/10 transition-colors w-full"
          >
            <LogOut size={18} className="shrink-0" />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-16'}
                        transition-all duration-300`}>
        <div className="p-8">
          <Routes>
            <Route index element={<AdminOverview />} />
            <Route path="drivers" element={<DriversPage />} />
            <Route path="vehicles" element={<VehiclesPage />} />
            <Route path="deliveries" element={<DeliveriesPage />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard