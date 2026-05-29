import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { deliveryAPI, dashboardAPI } from '../../services/api'
import StatusBadge from '../../components/common/StatusBadge'
import Modal from '../../components/common/Modal'
import StatCard from '../../components/common/StatCard'
import toast from 'react-hot-toast'
import {
  Package, Plus, MapPin, CreditCard,
  LogOut, Truck, CheckCircle, Clock
} from 'lucide-react'

function CustomerDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [stats, setStats] = useState(null)
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [showPayModal, setShowPayModal] = useState(false)
  const [showTrackModal, setShowTrackModal] = useState(false)
  const [selectedDelivery, setSelectedDelivery] = useState(null)
  const [tracking, setTracking] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const [orderData, setOrderData] = useState({
    pickup_address: '',
    delivery_address: '',
    pickup_lat: '',
    pickup_lng: '',
    delivery_lat: '',
    delivery_lng: '',
    notes: ''
  })

  const [payData, setPayData] = useState({
    amount: '',
    transaction_reference: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, deliveriesRes] = await Promise.all([
        dashboardAPI.getCustomerDashboard(),
        deliveryAPI.getMyDeliveries()
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

  const handleCreateOrder = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await deliveryAPI.create({
        pickup_address: orderData.pickup_address,
        delivery_address: orderData.delivery_address,
        pickup_lat: orderData.pickup_lat
          ? parseFloat(orderData.pickup_lat) : null,
        pickup_lng: orderData.pickup_lng
          ? parseFloat(orderData.pickup_lng) : null,
        delivery_lat: orderData.delivery_lat
          ? parseFloat(orderData.delivery_lat) : null,
        delivery_lng: orderData.delivery_lng
          ? parseFloat(orderData.delivery_lng) : null,
        notes: orderData.notes
      })
      toast.success('Delivery order placed successfully!')
      setShowOrderModal(false)
      setOrderData({
        pickup_address: '', delivery_address: '',
        pickup_lat: '', pickup_lng: '',
        delivery_lat: '', delivery_lng: '', notes: ''
      })
      fetchData()
    } catch (error) {
      toast.error(
        error.response?.data?.detail || 'Failed to place order'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const openPayModal = (delivery) => {
    setSelectedDelivery(delivery)
    setPayData({
      amount: delivery.total_cost || '',
      transaction_reference: `TXN-${Date.now()}`
    })
    setShowPayModal(true)
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await deliveryAPI.makePayment(selectedDelivery.id, {
        amount: parseFloat(payData.amount),
        transaction_reference: payData.transaction_reference
      })
      toast.success('Payment successful! 🎉')
      setShowPayModal(false)
      fetchData()
    } catch (error) {
      toast.error(
        error.response?.data?.detail || 'Payment failed'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const openTrackModal = async (delivery) => {
    setSelectedDelivery(delivery)
    setShowTrackModal(true)
    try {
      const res = await deliveryAPI.getTracking(delivery.id)
      setTracking(res.data)
    } catch {
      setTracking([])
    }
  }

  const activeDeliveries = deliveries.filter(d =>
    ['pending', 'assigned', 'picked_up', 'in_transit'].includes(d.status)
  )
  const completedDeliveries = deliveries.filter(d =>
    ['delivered', 'canceled'].includes(d.status)
  )

  return (
    <div className="min-h-screen bg-gray-950">

      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-700 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="text-green-400" size={28} />
            <div>
              <h1 className="text-white font-bold text-lg">
                FleetManager
              </h1>
              <p className="text-gray-400 text-xs">Customer Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowOrderModal(true)}
              className="flex items-center gap-2 bg-green-600
                         hover:bg-green-700 text-white px-4 py-2
                         rounded-lg text-sm transition-colors"
            >
              <Plus size={16} />
              New Order
            </button>
            <div className="text-right">
              <p className="text-white text-sm font-medium">
                {user?.full_name}
              </p>
              <span className="text-xs bg-green-500/20 text-green-400
                               border border-green-500/30 px-2 py-0.5
                               rounded-full">
                Customer
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-400 transition-colors"
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
              title="Total Orders"
              value={stats.total_orders}
              icon={Package}
              color="blue"
            />
            <StatCard
              title="Active Shipments"
              value={stats.active_shipments}
              icon={Truck}
              color="orange"
            />
            <StatCard
              title="Delivered"
              value={stats.delivered_orders}
              icon={CheckCircle}
              color="green"
            />
            <StatCard
              title="Total Spent"
              value={`₹${stats.total_spent}`}
              icon={CreditCard}
              color="purple"
            />
          </div>
        )}

        {/* Active Orders */}
        <div>
          <h2 className="text-white text-xl font-bold mb-4">
            Active Orders
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({activeDeliveries.length})
            </span>
          </h2>

          {loading ? (
            <div className="text-gray-400 text-center py-12">
              Loading orders...
            </div>
          ) : activeDeliveries.length === 0 ? (
            <div className="text-center py-12 bg-gray-900 border
                            border-gray-700 rounded-xl">
              <Package size={48}
                className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No active orders</p>
              <button
                onClick={() => setShowOrderModal(true)}
                className="mt-3 bg-green-600 hover:bg-green-700
                           text-white px-4 py-2 rounded-lg text-sm
                           transition-colors"
              >
                Place Your First Order
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeDeliveries.map((delivery) => (
                <div key={delivery.id}
                     className="bg-gray-900 border border-gray-700
                                rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-bold">
                        Order #{delivery.id}
                      </span>
                      <StatusBadge status={delivery.status} />
                    </div>
                    {delivery.total_cost && (
                      <span className="text-white font-semibold">
                        ₹{delivery.total_cost}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full
                                      mt-1.5 shrink-0" />
                      <p className="text-gray-400 text-sm">
                        {delivery.pickup_address}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full
                                      mt-1.5 shrink-0" />
                      <p className="text-gray-400 text-sm">
                        {delivery.delivery_address}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    {/* Track button */}
                    {['assigned', 'picked_up', 'in_transit'].includes(
                      delivery.status
                    ) && (
                      <button
                        onClick={() => openTrackModal(delivery)}
                        className="flex items-center gap-2
                                   bg-blue-600/20 text-blue-400
                                   border border-blue-600/30 px-4 py-2
                                   rounded-lg text-sm hover:bg-blue-600/30
                                   transition-colors"
                      >
                        <MapPin size={14} />
                        Track
                      </button>
                    )}

                    {/* Pay button */}
                    {delivery.total_cost &&
                     delivery.status !== 'pending' && (
                      <button
                        onClick={() => openPayModal(delivery)}
                        className="flex items-center gap-2
                                   bg-green-600/20 text-green-400
                                   border border-green-600/30 px-4 py-2
                                   rounded-lg text-sm hover:bg-green-600/30
                                   transition-colors"
                      >
                        <CreditCard size={14} />
                        Pay ₹{delivery.total_cost}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order History */}
        {completedDeliveries.length > 0 && (
          <div>
            <h2 className="text-white text-xl font-bold mb-4">
              Order History
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
                        Order #{delivery.id}
                      </span>
                      <StatusBadge status={delivery.status} />
                    </div>
                    <p className="text-gray-500 text-xs">
                      {delivery.delivery_address}
                    </p>
                  </div>
                  {delivery.total_cost && (
                    <span className="text-gray-400">
                      ₹{delivery.total_cost}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* New Order Modal */}
      <Modal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        title="Place New Delivery Order"
      >
        <form onSubmit={handleCreateOrder} className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Pickup Address
            </label>
            <input
              type="text"
              value={orderData.pickup_address}
              onChange={(e) => setOrderData({
                ...orderData, pickup_address: e.target.value
              })}
              placeholder="123 Anna Nagar, Chennai"
              required
              className="w-full bg-gray-800 border border-gray-600
                         rounded-lg px-4 py-3 text-white
                         focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Delivery Address
            </label>
            <input
              type="text"
              value={orderData.delivery_address}
              onChange={(e) => setOrderData({
                ...orderData, delivery_address: e.target.value
              })}
              placeholder="456 T Nagar, Chennai"
              required
              className="w-full bg-gray-800 border border-gray-600
                         rounded-lg px-4 py-3 text-white
                         focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Optional coordinates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">
                Pickup Lat (optional)
              </label>
              <input
                type="number"
                step="any"
                value={orderData.pickup_lat}
                onChange={(e) => setOrderData({
                  ...orderData, pickup_lat: e.target.value
                })}
                placeholder="13.0827"
                className="w-full bg-gray-800 border border-gray-600
                           rounded-lg px-4 py-3 text-white
                           focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">
                Pickup Lng (optional)
              </label>
              <input
                type="number"
                step="any"
                value={orderData.pickup_lng}
                onChange={(e) => setOrderData({
                  ...orderData, pickup_lng: e.target.value
                })}
                placeholder="80.2707"
                className="w-full bg-gray-800 border border-gray-600
                           rounded-lg px-4 py-3 text-white
                           focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Notes (optional)
            </label>
            <textarea
              value={orderData.notes}
              onChange={(e) => setOrderData({
                ...orderData, notes: e.target.value
              })}
              placeholder="Handle with care..."
              rows={2}
              className="w-full bg-gray-800 border border-gray-600
                         rounded-lg px-4 py-3 text-white
                         focus:outline-none focus:border-blue-500
                         resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowOrderModal(false)}
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
              {submitting ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        title={`Pay for Order #${selectedDelivery?.id}`}
      >
        <form onSubmit={handlePayment} className="space-y-4">
          <div className="bg-green-500/10 border border-green-500/20
                          rounded-lg p-4 text-center">
            <p className="text-gray-400 text-sm">Amount Due</p>
            <p className="text-green-400 text-3xl font-bold">
              ₹{selectedDelivery?.total_cost}
            </p>
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Amount
            </label>
            <input
              type="number"
              value={payData.amount}
              onChange={(e) => setPayData({
                ...payData, amount: e.target.value
              })}
              required
              className="w-full bg-gray-800 border border-gray-600
                         rounded-lg px-4 py-3 text-white
                         focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Transaction Reference
            </label>
            <input
              type="text"
              value={payData.transaction_reference}
              onChange={(e) => setPayData({
                ...payData, transaction_reference: e.target.value
              })}
              className="w-full bg-gray-800 border border-gray-600
                         rounded-lg px-4 py-3 text-white
                         focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowPayModal(false)}
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
              {submitting ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Tracking Modal */}
      <Modal
        isOpen={showTrackModal}
        onClose={() => setShowTrackModal(false)}
        title={`Track Order #${selectedDelivery?.id}`}
      >
        <div className="space-y-4">
          {/* Current Status */}
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-2">Current Status</p>
            <StatusBadge status={selectedDelivery?.status} />
          </div>

          {/* Delivery info */}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full
                              mt-1.5 shrink-0" />
              <div>
                <p className="text-gray-500 text-xs">From</p>
                <p className="text-white text-sm">
                  {selectedDelivery?.pickup_address}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full
                              mt-1.5 shrink-0" />
              <div>
                <p className="text-gray-500 text-xs">To</p>
                <p className="text-white text-sm">
                  {selectedDelivery?.delivery_address}
                </p>
              </div>
            </div>
          </div>

          {/* Location history */}
          <div>
            <p className="text-gray-400 text-sm font-medium mb-2">
              Location History
            </p>
            {tracking.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <MapPin size={24}
                  className="text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">
                  No location updates yet
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {tracking.map((track) => (
                  <div key={track.id}
                       className="bg-gray-800 rounded-lg p-3 flex
                                  items-start gap-3">
                    <MapPin size={14}
                      className="text-green-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white text-sm">
                        {track.address_snapshot || 'Location update'}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {track.latitude.toFixed(4)},
                        {track.longitude.toFixed(4)}
                      </p>
                      <p className="text-gray-600 text-xs">
                        {new Date(track.updated_at)
                          .toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default CustomerDashboard