import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { Truck, Mail, Lock, LogIn } from 'lucide-react'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await authAPI.login({ email, password })
      const { access_token, user } = response.data

      // Save to context + localStorage
      login(access_token, user)

      toast.success(`Welcome back, ${user.full_name}!`)

      // Redirect based on role
      if (user.role === 'admin') navigate('/admin')
      else if (user.role === 'driver') navigate('/driver')
      else if (user.role === 'customer') navigate('/customer')

    } catch (error) {
      const message = error.response?.data?.detail || 'Login failed'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Truck className="text-blue-400" size={40} />
          <h1 className="text-white text-3xl font-bold">FleetManager</h1>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8">
          <h2 className="text-white text-2xl font-semibold mb-2">
            Welcome back
          </h2>
          <p className="text-gray-400 mb-6">
            Sign in to your account
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="text-gray-400 text-sm mb-1 block">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg
                             pl-9 pr-4 py-3 text-white placeholder-gray-500
                             focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-gray-400 text-sm mb-1 block">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg
                             pl-9 pr-4 py-3 text-white placeholder-gray-500
                             focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800
                         text-white font-semibold py-3 rounded-lg transition-colors
                         flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="text-gray-500 text-sm text-center mt-6">
            New company?{' '}
            <Link
              to="/register"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Register your organization
            </Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-4 bg-gray-900 border border-gray-700 rounded-xl p-4">
          <p className="text-gray-400 text-xs font-semibold mb-2">
            Demo Credentials:
          </p>
          <div className="space-y-1 text-xs text-gray-500">
            <p>Admin: admin@fastlogistics.com / admin123</p>
            <p>Driver: john@fastlogistics.com / driver123</p>
            <p>Customer: alice@fastlogistics.com / customer123</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage