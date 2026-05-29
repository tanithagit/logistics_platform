import { useState, useEffect } from 'react'
import { dashboardAPI } from '../../services/api'
import StatCard from '../../components/common/StatCard'
import {
  Package, Truck, Users, DollarSign,
  CheckCircle, Clock, TrendingUp, Car
} from 'lucide-react'
import toast from 'react-hot-toast'

function AdminOverview() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await dashboardAPI.getAdminDashboard()
      setStats(response.data)
    } catch (error) {
      toast.error('Failed to load dashboard stats')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading stats...</div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white text-2xl font-bold">Overview</h2>
        <p className="text-gray-400 text-sm mt-1">
          Your organization at a glance
        </p>
      </div>

      {/* Delivery Stats */}
      <div>
        <h3 className="text-gray-400 text-sm font-semibold
                       uppercase tracking-wider mb-3">
          Deliveries
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Deliveries"
            value={stats.total_deliveries}
            icon={Package}
            color="blue"
          />
          <StatCard
            title="Pending"
            value={stats.pending_deliveries}
            icon={Clock}
            color="yellow"
          />
          <StatCard
            title="Active"
            value={stats.active_deliveries}
            icon={TrendingUp}
            color="orange"
          />
          <StatCard
            title="Delivered"
            value={stats.delivered_deliveries}
            icon={CheckCircle}
            color="green"
          />
        </div>
      </div>

      {/* Fleet & Revenue Stats */}
      <div>
        <h3 className="text-gray-400 text-sm font-semibold
                       uppercase tracking-wider mb-3">
          Fleet & Revenue
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Drivers"
            value={stats.total_drivers}
            icon={Users}
            color="purple"
            subtitle={`${stats.active_drivers} currently active`}
          />
          <StatCard
            title="Total Vehicles"
            value={stats.total_vehicles}
            icon={Truck}
            color="blue"
            subtitle={`${stats.available_vehicles} available`}
          />
          <StatCard
            title="Total Revenue"
            value={`₹${stats.total_revenue.toLocaleString()}`}
            icon={DollarSign}
            color="green"
          />
          <StatCard
            title="Success Rate"
            value={`${stats.delivery_success_rate}%`}
            icon={CheckCircle}
            color="green"
            subtitle="Delivery success rate"
          />
        </div>
      </div>

      {/* Canceled */}
      {stats.canceled_deliveries > 0 && (
        <div className="bg-red-500/10 border border-red-500/20
                        rounded-xl p-4 flex items-center gap-3">
          <div className="text-red-400 text-2xl font-bold">
            {stats.canceled_deliveries}
          </div>
          <div>
            <p className="text-red-400 font-medium">Canceled Deliveries</p>
            <p className="text-red-400/60 text-sm">
              Review and take action
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminOverview