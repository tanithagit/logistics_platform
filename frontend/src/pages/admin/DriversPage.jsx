import { useState, useEffect } from 'react'
import { userAPI } from '../../services/api'
import StatusBadge from '../../components/common/StatusBadge'
import Modal from '../../components/common/Modal'
import { Plus, Trash2, User, Phone, Mail } from 'lucide-react'
import toast from 'react-hot-toast'

function DriversPage() {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '', email: '', password: '',
    phone: '', role: 'driver'
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchDrivers() }, [])

  const fetchDrivers = async () => {
    try {
      const res = await userAPI.getDrivers()
      setDrivers(res.data)
    } catch {
      toast.error('Failed to load drivers')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await userAPI.createUser(formData)
      toast.success('Driver created successfully!')
      setShowModal(false)
      setFormData({
        full_name: '', email: '', password: '',
        phone: '', role: 'driver'
      })
      fetchDrivers()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create driver')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this driver?')) return
    try {
      await userAPI.deleteUser(id)
      toast.success('Driver deleted')
      fetchDrivers()
    } catch {
      toast.error('Failed to delete driver')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-2xl font-bold">Drivers</h2>
          <p className="text-gray-400 text-sm mt-1">
            {drivers.length} drivers in your fleet
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600
                     hover:bg-blue-700 text-white px-4 py-2
                     rounded-lg transition-colors"
        >
          <Plus size={18} />
          Add Driver
        </button>
      </div>

      {/* Drivers Table */}
      {loading ? (
        <div className="text-gray-400 text-center py-12">
          Loading drivers...
        </div>
      ) : drivers.length === 0 ? (
        <div className="text-center py-12 bg-gray-900 border
                        border-gray-700 rounded-xl">
          <User size={48} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No drivers yet</p>
          <p className="text-gray-600 text-sm">
            Add your first driver to get started
          </p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left text-gray-400 text-sm
                               font-medium px-6 py-4">Driver</th>
                <th className="text-left text-gray-400 text-sm
                               font-medium px-6 py-4">Email</th>
                <th className="text-left text-gray-400 text-sm
                               font-medium px-6 py-4">Phone</th>
                <th className="text-left text-gray-400 text-sm
                               font-medium px-6 py-4">Status</th>
                <th className="text-left text-gray-400 text-sm
                               font-medium px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => (
                <tr key={driver.id}
                    className="border-b border-gray-800
                               hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full
                                      flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {driver.full_name[0]}
                        </span>
                      </div>
                      <span className="text-white">{driver.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-400 text-sm">
                      {driver.email}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-400 text-sm">
                      {driver.phone || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status="driver" />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(driver.id)}
                      className="text-red-400 hover:text-red-300
                                 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Driver Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add New Driver"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Full Name
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({
                ...formData, full_name: e.target.value
              })}
              placeholder="John Driver"
              required
              className="w-full bg-gray-800 border border-gray-600
                         rounded-lg px-4 py-3 text-white
                         focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({
                ...formData, email: e.target.value
              })}
              placeholder="driver@company.com"
              required
              className="w-full bg-gray-800 border border-gray-600
                         rounded-lg px-4 py-3 text-white
                         focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({
                ...formData, password: e.target.value
              })}
              placeholder="••••••••"
              required
              className="w-full bg-gray-800 border border-gray-600
                         rounded-lg px-4 py-3 text-white
                         focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Phone
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({
                ...formData, phone: e.target.value
              })}
              placeholder="9876543210"
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
                         disabled:bg-blue-800 text-white py-3
                         rounded-lg transition-colors"
            >
              {submitting ? 'Creating...' : 'Create Driver'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default DriversPage