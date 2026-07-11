import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'
import socket from '../services/socket'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(null)
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      api.get('/users/me')
        .then(({ data }) => { setUtilisateur(data); socket.connect() })
        .catch(() => localStorage.clear())
        .finally(() => setChargement(false))
    } else {
      setChargement(false)
    }
  }, [])

  async function login(email, mot_de_passe) {
    const { data } = await api.post('/auth/login', { email, mot_de_passe })
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    setUtilisateur(data.utilisateur)
    socket.connect()
    return data.utilisateur
  }

  async function logout() {
    const refreshToken = localStorage.getItem('refreshToken')
    try { await api.post('/auth/logout', { refreshToken }) } catch {}
    localStorage.clear()
    setUtilisateur(null)
    socket.disconnect()
  }

  return (
    <AuthContext.Provider value={{ utilisateur, setUtilisateur, login, logout, chargement }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
