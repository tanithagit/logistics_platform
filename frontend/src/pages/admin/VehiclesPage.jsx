import { useState, useEffect } from 'react'
import { vehicleAPI } from '../../services/api'
import StatusBadge from '../../components/common/StatusBadge'
import Modal from '../../components/common/Modal'
import { Plus, Truck, Edit } from 'lucide-react'
import toast from 'react-hot-toast'

function VehiclesPage() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    vehicle_number: '', type: 'truck',
    capacity: '', status: 'active'
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchVehicles() }, [])

  const fetchVehicles = async () => {
    try {
      const res = await vehicleAPI.getAll()
      setVehicles(res.data)
    } catch {
      toast.error('Failed to load vehicles')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await vehicleAPI.create({
        ...formData,
        capacity: parseFloat(formData.capacity)
      })
      toast.success('Vehicle added!')
      setShowModal(false)
      setFormData({
        vehicle_number: '', type: 'truck',
        capacity: '', status: 'active'
      })
      fetchVehicles()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add vehicle')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      await vehicleAPI.update(id, { status: newStatus })
      toast.success('Vehicle status updated!')
      fetchVehicles()
    } catch {
      toast.error('Failed to update status')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-2xl font-bold">Vehicles</h2>
          <p className="text-gray-400 text-sm mt-1">
            {vehicles.length} vehicles in your fleet
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600
                     hover:bg-blue-700 text-white px-4 py-2
                     rounded-lg transition-colors"
        >
          <Plus size={18} />
          Add Vehicle
        </button>
      </div>

      {/* Vehicles Grid */}
      {loading ? (
        <div className="text-gray-400 text-center py-12">
          Loading vehicles...
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-12 bg-gray-900 border
                        border-gray-700 rounded-xl">
          <Truck size={48} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No vehicles yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id}
                 className="bg-gray-900 border border-gray-700
                            rounded-xl p-5 hover:border-gray-600
                            transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Truck size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">
                      {vehicle.vehicle_number}
                    </p>
                    <p className="text-gray-500 text-sm capitalize">
                      {vehicle.type}
                    </p>
                  </div>
                </div>
                <StatusBadge status={vehicle.status} />
              </div>

              <div className="text-gray-400 text-sm mb-4">
                Capacity: {vehicle.capacity} kg
              </div>

              {/* Status change buttons */}
              <div className="flex gap-2">
                {vehicle.status !== 'active' && (
                  <button
                    onClick={() => handleStatusChange(vehicle.id, 'active')}
                    className="flex-1 text-xs bg-green-600/20 text-green-400
                               border border-green-600/30 py-1.5 rounded-lg
                               hover:bg-green-600/30 transition-colors"
                  >
                    Set Active
                  </button>
                )}
                {vehicle.status !== 'maintenance' && (
                  <button
                    onClick={() => handleStatusChange(vehicle.id, 'maintenance')}
                    className="flex-1 text-xs bg-yellow-600/20 text-yellow-400
                               border border-yellow-600/30 py-1.5 rounded-lg
                               hover:bg-yellow-600/30 transition-colors"
                  >
                    Maintenance
                  </button>
                )}
                {vehicle.status !== 'unavailable' && (
                  <button
                    onClick={() => handleStatusChange(vehicle.id, 'unavailable')}
                    className="flex-1 text-xs bg-red-600/20 text-red-400
                               border border-red-600/30 py-1.5 rounded-lg
                               hover:bg-red-600/30 transition-colors"
                  >
                    Unavailable
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Vehicle Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add New Vehicle"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Vehicle Number
            </label>
            <input
              type="text"
              value={formData.vehicle_number}
              onChange={(e) => setFormData({
                ...formData, vehicle_number: e.target.value
              })}
              placeholder="TN-01-AB-1234"
              required
              className="w-full bg-gray-800 border border-gray-600
                         rounded-lg px-4 py-3 text-white
                         focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Vehicle Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({
                ...formData, type: e.target.value
              })}
              className="w-full bg-gray-800 border border-gray-600
                         rounded-lg px-4 py-3 text-white
                         focus:outline-none focus:border-blue-500"
            >
              <option value="truck">Truck</option>
              <option value="van">Van</option>
              <option value="bike">Bike</option>
              <option value="car">Car</option>
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Capacity (kg)
            </label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({
                ...formData, capacity: e.target.value
              })}
              placeholder="1000"
              required
              className="w-full bg-gray-800 border border-gray-600
                         rounded-lg px-4 py-3 text-white
                         focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
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
              {submitting ? 'Adding...' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default VehiclesPage