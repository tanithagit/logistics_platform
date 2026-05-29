import { useState, useEffect } from 'react'
import { deliveryAPI, userAPI, vehicleAPI } from '../../services/api'
import StatusBadge from '../../components/common/StatusBadge'
import Modal from '../../components/common/Modal'
import { Package, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'

function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState([])
  const [drivers, setDrivers] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedDelivery, setSelectedDelivery] = useState(null)
  const [assignData, setAssignData] = useState({
    driver_id: '', vehicle_id: '', total_cost: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      const [delRes, drvRes, vehRes] = await Promise.all([
        deliveryAPI.getAll(),
        userAPI.getDrivers(),
        vehicleAPI.getAvailable()
      ])
      setDeliveries(delRes.data)
      setDrivers(drvRes.data)
      setVehicles(vehRes.data)
    } catch {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const openAssignModal = (delivery) => {
    setSelectedDelivery(delivery)
    setAssignData({ driver_id: '', vehicle_id: '', total_cost: '' })
    setShowAssignModal(true)
  }

  const handleAssign = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await deliveryAPI.assign(selectedDelivery.id, {
        driver_id: parseInt(assignData.driver_id),
        vehicle_id: parseInt(assignData.vehicle_id),
        total_cost: parseFloat(assignData.total_cost)
      })
      toast.success('Delivery assigned successfully!')
      setShowAssignModal(false)
      fetchAll()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to assign')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async (id) => {
    if (!confirm('Cancel this delivery?')) return
    try {
      await deliveryAPI.cancel(id)
      toast.success('Delivery canceled')
      fetchAll()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to cancel')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white text-2xl font-bold">All Deliveries</h2>
        <p className="text-gray-400 text-sm mt-1">
          {deliveries.length} total deliveries
        </p>
      </div>

      {loading ? (
        <div className="text-gray-400 text-center py-12">
          Loading deliveries...
        </div>
      ) : deliveries.length === 0 ? (
        <div className="text-center py-12 bg-gray-900 border
                        border-gray-700 rounded-xl">
          <Package size={48} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No deliveries yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {deliveries.map((delivery) => (
            <div key={delivery.id}
                 className="bg-gray-900 border border-gray-700
                            rounded-xl p-5 hover:border-gray-600
                            transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-white font-semibold">
                      #{delivery.id}
                    </span>
                    <StatusBadge status={delivery.status} />
                    {delivery.total_cost && (
                      <span className="text-green-400 text-sm font-medium">
                        ₹{delivery.total_cost}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">
                    📍 From: {delivery.pickup_address}
                  </p>
                  <p className="text-gray-400 text-sm">
                    🎯 To: {delivery.delivery_address}
                  </p>
                  {delivery.notes && (
                    <p className="text-gray-500 text-xs mt-1">
                      Note: {delivery.notes}
                    </p>
                  )}
                  <div className="flex gap-4 mt-2 text-xs text-gray-600">
                    <span>
                      Driver: {delivery.assigned_driver_id || 'Unassigned'}
                    </span>
                    <span>
                      Vehicle: {delivery.assigned_vehicle_id || 'Unassigned'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-4">
                  {delivery.status === 'pending' && (
                    <button
                      onClick={() => openAssignModal(delivery)}
                      className="flex items-center gap-1 bg-blue-600/20
                                 text-blue-400 border border-blue-600/30
                                 px-3 py-1.5 rounded-lg text-sm
                                 hover:bg-blue-600/30 transition-colors"
                    >
                      <UserCheck size={14} />
                      Assign
                    </button>
                  )}
                  {!['delivered', 'canceled'].includes(delivery.status) && (
                    <button
                      onClick={() => handleCancel(delivery.id)}
                      className="bg-red-600/20 text-red-400
                                 border border-red-600/30 px-3 py-1.5
                                 rounded-lg text-sm hover:bg-red-600/30
                                 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title={`Assign Delivery #${selectedDelivery?.id}`}
      >
        <form onSubmit={handleAssign} className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Select Driver
            </label>
            <select
              value={assignData.driver_id}
              onChange={(e) => setAssignData({
                ...assignData, driver_id: e.target.value
              })}
              required
              className="w-full bg-gray-800 border border-gray-600
                         rounded-lg px-4 py-3 text-white
                         focus:outline-none focus:border-blue-500"
            >
              <option value="">Choose a driver...</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.full_name} ({d.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Select Vehicle
            </label>
            <select
              value={assignData.vehicle_id}
              onChange={(e) => setAssignData({
                ...assignData, vehicle_id: e.target.value
              })}
              required
              className="w-full bg-gray-800 border border-gray-600
                         rounded-lg px-4 py-3 text-white
                         focus:outline-none focus:border-blue-500"
            >
              <option value="">Choose a vehicle...</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vehicle_number} ({v.type})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Delivery Cost (₹)
            </label>
            <input
              type="number"
              value={assignData.total_cost}
              onChange={(e) => setAssignData({
                ...assignData, total_cost: e.target.value
              })}
              placeholder="500"
              required
              className="w-full bg-gray-800 border border-gray-600
                         rounded-lg px-4 py-3 text-white
                         focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAssignModal(false)}
              className="flex-1 bg-gray-700 hover:bg-gray-600
                         text-white py-3 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700
                         text-white py-3 rounded-lg transition-colors"
            >
              {submitting ? 'Assigning...' : 'Assign Delivery'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default DeliveriesPage