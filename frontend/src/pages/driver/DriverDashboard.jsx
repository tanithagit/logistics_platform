import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { deliveryAPI, dashboardAPI } from '../../services/api'
import StatusBadge from '../../components/common/StatusBadge'
import Modal from '../../components/common/Modal'
import StatCard from '../../components/common/StatCard'
import toast from 'react-hot-toast'
import {
  Truck, Package, CheckCircle,
  MapPin, LogOut, Navigation,
  Clock, TrendingUp
} from 'lucide-react'

function DriverDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [stats, setStats] = useState(null)
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [selectedDelivery, setSelectedDelivery] = useState(null)
  const [locationData, setLocationData] = useState({
    latitude: '',
    longitude: '',
    address_snapshot: ''
  })
  const [updatingStatus, setUpdatingStatus] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, deliveriesRes] = await Promise.all([
        dashboardAPI.getDriverDashboard(),
        deliveryAPI.getAssigned()
      ])
      setStats(statsRes.data)
      setDeliveries(deliveriesRes.data)
    } catch (error) {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Status flow for driver
  const getNextStatus = (currentStatus) => {
    const flow = {
      assigned: 'picked_up',
      picked_up: 'in_transit',
      in_transit: 'delivered'
    }
    return flow[currentStatus] || null
  }

  const getNextStatusLabel = (currentStatus) => {
    const labels = {
      assigned: '📦 Mark Picked Up',
      picked_up: '🚚 Mark In Transit',
      in_transit: '✅ Mark Delivered'
    }
    return labels[currentStatus] || null
  }

  const handleStatusUpdate = async (delivery) => {
    const nextStatus = getNextStatus(delivery.status)
    if (!nextStatus) return

    setUpdatingStatus(delivery.id)
    try {
      await deliveryAPI.updateStatus(delivery.id, { status: nextStatus })
      toast.success(`Status updated to ${nextStatus.replace('_', ' ')}!`)
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const openLocationModal = (delivery) => {
    setSelectedDelivery(delivery)
    // Mock GPS — pre-fill with Chennai coordinates
    setLocationData({
      latitude: '13.0827',
      longitude: '80.2707',
      address_snapshot: ''
    })
    setShowLocationModal(true)
  }

  const handleLocationUpdate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await deliveryAPI.addTracking(selectedDelivery.id, {
        latitude: parseFloat(locationData.latitude),
        longitude: parseFloat(locationData.longitude),
        address_snapshot: locationData.address_snapshot
      })
      toast.success('Location updated successfully!')
      setShowLocationModal(false)
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update location')
    } finally {
      setSubmitting(false)
    }
  }

  const activeDeliveries = deliveries.filter(d =>
    ['assigned', 'picked_up', 'in_transit'].includes(d.status)
  )
  const completedDeliveries = deliveries.filter(d =>
    d.status === 'delivered'
  )

  return (
    <div className="min-h-screen bg-gray-950">

      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-700 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Truck className="text-blue-400" size={28} />
            <div>
              <h1 className="text-white font-bold text-lg">
                FleetManager
              </h1>
              <p className="text-gray-400 text-xs">Driver Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-white text-sm font-medium">
                {user?.full_name}
              </p>
              <span className="text-xs bg-blue-500/20 text-blue-400
                               border border-blue-500/30 px-2 py-0.5
                               rounded-full">
                Driver
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-400
                         hover:text-red-400 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Assigned"
              value={stats.total_assigned}
              icon={Package}
              color="blue"
            />
            <StatCard
              title="In Transit"
              value={stats.in_transit}
              icon={TrendingUp}
              color="orange"
            />
            <StatCard
              title="Delivered Today"
              value={stats.delivered_today}
              icon={CheckCircle}
              color="green"
            />
            <StatCard
              title="Total Delivered"
              value={stats.total_delivered}
              icon={CheckCircle}
              color="purple"
            />
          </div>
        )}

        {/* Active Deliveries */}
        <div>
          <h2 className="text-white text-xl font-bold mb-4">
            Active Deliveries
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({activeDeliveries.length})
            </span>
          </h2>

          {loading ? (
            <div className="text-gray-400 text-center py-12">
              Loading deliveries...
            </div>
          ) : activeDeliveries.length === 0 ? (
            <div className="text-center py-12 bg-gray-900 border
                            border-gray-700 rounded-xl">
              <Package size={48}
                className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">
                No active deliveries assigned
              </p>
              <p className="text-gray-600 text-sm">
                Check back later for new assignments
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeDeliveries.map((delivery) => (
                <div key={delivery.id}
                     className="bg-gray-900 border border-gray-700
                                rounded-xl p-5">
                  {/* Delivery header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-bold text-lg">
                        #{delivery.id}
                      </span>
                      <StatusBadge status={delivery.status} />
                    </div>
                    {delivery.total_cost && (
                      <span className="text-green-400 font-semibold">
                        ₹{delivery.total_cost}
                      </span>
                    )}
                  </div>

                  {/* Addresses */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full
                                      mt-1.5 shrink-0" />
                      <div>
                        <p className="text-gray-500 text-xs">Pickup</p>
                        <p className="text-white text-sm">
                          {delivery.pickup_address}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full
                                      mt-1.5 shrink-0" />
                      <div>
                        <p className="text-gray-500 text-xs">Delivery</p>
                        <p className="text-white text-sm">
                          {delivery.delivery_address}
                        </p>
                      </div>
                    </div>
                  </div>

                  {delivery.notes && (
                    <p className="text-gray-500 text-xs mb-4 bg-gray-800
                                  rounded-lg px-3 py-2">
                      📝 {delivery.notes}
                    </p>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    {/* Update status button */}
                    {getNextStatus(delivery.status) && (
                      <button
                        onClick={() => handleStatusUpdate(delivery)}
                        disabled={updatingStatus === delivery.id}
                        className="flex-1 bg-blue-600 hover:bg-blue-700
                                   disabled:bg-blue-800 text-white py-2.5
                                   rounded-lg text-sm font-medium
                                   transition-colors"
                      >
                        {updatingStatus === delivery.id
                          ? 'Updating...'
                          : getNextStatusLabel(delivery.status)
                        }
                      </button>
                    )}

                    {/* Send location button */}
                    {['picked_up', 'in_transit'].includes(
                      delivery.status
                    ) && (
                      <button
                        onClick={() => openLocationModal(delivery)}
                        className="flex items-center gap-2 bg-green-600/20
                                   text-green-400 border border-green-600/30
                                   px-4 py-2.5 rounded-lg text-sm
                                   hover:bg-green-600/30 transition-colors"
                      >
                        <Navigation size={16} />
                        Update Location
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Deliveries */}
        {completedDeliveries.length > 0 && (
          <div>
            <h2 className="text-white text-xl font-bold mb-4">
              Completed Deliveries
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({completedDeliveries.length})
              </span>
            </h2>
            <div className="space-y-3">
              {completedDeliveries.map((delivery) => (
                <div key={delivery.id}
                     className="bg-gray-900 border border-gray-700
                                rounded-xl p-4 flex items-center
                                justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium">
                        #{delivery.id}
                      </span>
                      <StatusBadge status={delivery.status} />
                    </div>
                    <p className="text-gray-500 text-xs">
                      {delivery.delivery_address}
                    </p>
                  </div>
                  {delivery.total_cost && (
                    <span className="text-green-400 font-semibold">
                      ₹{delivery.total_cost}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Location Update Modal */}
      <Modal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        title={`Update Location — Delivery #${selectedDelivery?.id}`}
      >
        <form onSubmit={handleLocationUpdate} className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/20
                          rounded-lg p-3 text-blue-400 text-sm">
            💡 In production, this would use your phone's GPS.
            For now, enter coordinates manually.
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              value={locationData.latitude}
              onChange={(e) => setLocationData({
                ...locationData, latitude: e.target.value
              })}
              placeholder="13.0827"
              required
              className="w-full bg-gray-800 border border-gray-600
                         rounded-lg px-4 py-3 text-white
                         focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              value={locationData.longitude}
              onChange={(e) => setLocationData({
                ...locationData, longitude: e.target.value
              })}
              placeholder="80.2707"
              required
              className="w-full bg-gray-800 border border-gray-600
                         rounded-lg px-4 py-3 text-white
                         focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Current Address (optional)
            </label>
            <input
              type="text"
              value={locationData.address_snapshot}
              onChange={(e) => setLocationData({
                ...locationData,
                address_snapshot: e.target.value
              })}
              placeholder="Near Vadapalani, Chennai"
              className="w-full bg-gray-800 border border-gray-600
                         rounded-lg px-4 py-3 text-white
                         focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowLocationModal(false)}
              className="flex-1 bg-gray-700 hover:bg-gray-600
                         text-white py-3 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-green-600 hover:bg-green-700
                         text-white py-3 rounded-lg transition-colors"
            >
              {submitting ? 'Updating...' : 'Send Location'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default DriverDashboard