import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

// Create the context
const AuthContext = createContext(null)

// Provider wraps the whole app
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // On app load — check if user is already logged in
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = (tokenValue, userData) => {
    // Save to state
    setToken(tokenValue)
    setUser(userData)

    // Save to localStorage (persists after page refresh)
    localStorage.setItem('token', tokenValue)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const isAdmin = () => user?.role === 'admin'
  const isDriver = () => user?.role === 'driver'
  const isCustomer = () => user?.role === 'customer'

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      isAdmin,
      isDriver,
      isCustomer,
      isLoggedIn: !!token
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook — use this in any component
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}