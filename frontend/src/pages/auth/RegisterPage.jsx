import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../../services/api'
import toast from 'react-hot-toast'
import {
  Truck, Building2, User,
  Mail, Lock, Phone, MapPin
} from 'lucide-react'

// ✅ InputField moved OUTSIDE the component
// This prevents re-creation on every keystroke
function InputField({
  icon: Icon, name, type = 'text',
  placeholder, label, value, onChange, required = true
}) {
  return (
    <div>
      <label className="text-gray-400 text-sm mb-1 block">
        {label}
      </label>
      <div className="relative">
        <Icon
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2
                     text-gray-500"
        />
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full bg-gray-800 border border-gray-600
                     rounded-lg pl-9 pr-4 py-3 text-white
                     placeholder-gray-500 focus:outline-none
                     focus:border-blue-500 transition-colors"
        />
      </div>
    </div>
  )
}

function RegisterPage() {
  const [formData, setFormData] = useState({
    org_name: '',
    org_email: '',
    org_phone: '',
    org_address: '',
    full_name: '',
    email: '',
    password: '',
    phone: '',
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authAPI.register(formData)
      toast.success('Organization registered! Please login.')
      navigate('/login')
    } catch (error) {
      const message = error.response?.data?.detail || 'Registration failed'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center
                    justify-center px-4 py-8">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Truck className="text-blue-400" size={40} />
          <h1 className="text-white text-3xl font-bold">
            FleetManager
          </h1>
        </div>

        <div className="bg-gray-900 border border-gray-700
                        rounded-2xl p-8">
          <h2 className="text-white text-2xl font-semibold mb-1">
            Register Organization
          </h2>
          <p className="text-gray-400 mb-6">
            Create your company account
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Organization section */}
            <div className="border border-gray-700 rounded-xl
                            p-4 space-y-4">
              <p className="text-blue-400 text-sm font-semibold
                            flex items-center gap-2">
                <Building2 size={14} />
                Organization Details
              </p>

              <InputField
                icon={Building2}
                name="org_name"
                label="Company Name"
                placeholder="Speed Delivery Inc"
                value={formData.org_name}
                onChange={handleChange}
              />
              <InputField
                icon={Mail}
                name="org_email"
                type="email"
                label="Company Email"
                placeholder="contact@speeddelivery.com"
                value={formData.org_email}
                onChange={handleChange}
              />
              <InputField
                icon={Phone}
                name="org_phone"
                label="Company Phone"
                placeholder="8765432109"
                value={formData.org_phone}
                onChange={handleChange}
              />
              <InputField
                icon={MapPin}
                name="org_address"
                label="Company Address"
                placeholder="Bangalore, Karnataka"
                value={formData.org_address}
                onChange={handleChange}
              />
            </div>

            {/* Admin user section */}
            <div className="border border-gray-700 rounded-xl
                            p-4 space-y-4">
              <p className="text-green-400 text-sm font-semibold
                            flex items-center gap-2">
                <User size={14} />
                Admin Account Details
              </p>

              <InputField
                icon={User}
                name="full_name"
                label="Your Full Name"
                placeholder="Priya Admin"
                value={formData.full_name}
                onChange={handleChange}
              />
              <InputField
                icon={Mail}
                name="email"
                type="email"
                label="Your Email"
                placeholder="priya@speeddelivery.com"
                value={formData.email}
                onChange={handleChange}
              />
              <InputField
                icon={Lock}
                name="password"
                type="password"
                label="Password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
              <InputField
                icon={Phone}
                name="phone"
                label="Your Phone"
                placeholder="8765432109"
                value={formData.phone}
                onChange={handleChange}
                required={false}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700
                         disabled:bg-blue-800 text-white
                         font-semibold py-3 rounded-lg
                         transition-colors"
            >
              {loading ? 'Registering...' : 'Register Organization'}
            </button>
          </form>

          <p className="text-gray-500 text-sm text-center mt-4">
            Already registered?{' '}
            <Link
              to="/login"
              className="text-blue-400 hover:text-blue-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage