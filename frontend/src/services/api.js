import axios from 'axios'

// Base URL of our FastAPI backend
const API_BASE_URL = 'http://localhost:8000'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
// Automatically adds JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
// If token expired → redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── Auth APIs ────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
}

// ─── User APIs ────────────────────────────────────────
export const userAPI = {
  getDrivers: () => api.get('/users/drivers'),
  getCustomers: () => api.get('/users/customers'),
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (data) => api.post('/users/', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
}

// ─── Vehicle APIs ─────────────────────────────────────
export const vehicleAPI = {
  getAll: () => api.get('/vehicles/'),
  getAvailable: () => api.get('/vehicles/available'),
  getOne: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles/', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
}

// ─── Delivery APIs ────────────────────────────────────
export const deliveryAPI = {
  getAll: () => api.get('/deliveries/'),
  getOne: (id) => api.get(`/deliveries/${id}`),
  create: (data) => api.post('/deliveries/', data),
  assign: (id, data) => api.put(`/deliveries/${id}/assign`, data),
  updateStatus: (id, data) => api.put(`/deliveries/${id}/status`, data),
  cancel: (id) => api.put(`/deliveries/${id}/cancel`),
  getMyDeliveries: () => api.get('/deliveries/my-deliveries'),
  getAssigned: () => api.get('/deliveries/assigned'),
  getTracking: (id) => api.get(`/deliveries/${id}/tracking`),
  addTracking: (id, data) => api.post(`/deliveries/${id}/tracking`, data),
  makePayment: (id, data) => api.post(`/deliveries/${id}/payment`, data),
  getPayment: (id) => api.get(`/deliveries/${id}/payment`),
}

// ─── Dashboard APIs ───────────────────────────────────
export const dashboardAPI = {
  getAdminDashboard: () => api.get('/dashboard/admin'),
  getDriverDashboard: () => api.get('/dashboard/driver'),
  getCustomerDashboard: () => api.get('/dashboard/customer'),
}

export default api