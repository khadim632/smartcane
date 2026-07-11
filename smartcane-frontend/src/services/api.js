import axios from 'axios'

const api = axios.create({ baseURL: '/api', headers: { 'Content-Type': 'application/json' } })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  r => r,
  async (error) => {
    const orig = error.config
    if (error.response?.status === 401 && !orig._retry) {
      orig._retry = true
      try {
        const rt = localStorage.getItem('refreshToken')
        const { data } = await axios.post('/api/auth/refresh', { refreshToken: rt })
        localStorage.setItem('accessToken', data.accessToken)
        orig.headers.Authorization = `Bearer ${data.accessToken}`
        return api(orig)
      } catch {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
