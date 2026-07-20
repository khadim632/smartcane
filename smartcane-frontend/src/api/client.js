import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://smartcane-1g0a.onrender.com'

const client = axios.create({ baseURL: `${API_URL}/api` })

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshing = null

client.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry && localStorage.getItem('refreshToken')) {
      original._retry = true
      try {
        if (!refreshing) {
          refreshing = axios
            .post(`${API_URL}/api/auth/refresh`, {
              refreshToken: localStorage.getItem('refreshToken')
            })
            .then((r) => {
              localStorage.setItem('accessToken', r.data.accessToken)
              return r.data.accessToken
            })
            .finally(() => { refreshing = null })
        }
        const nouveauToken = await refreshing
        original.headers.Authorization = `Bearer ${nouveauToken}`
        return client(original)
      } catch (e) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('utilisateur')
        window.location.href = '/login'
        return Promise.reject(err)
      }
    }
    return Promise.reject(err)
  }
)

export { API_URL }
export default client
