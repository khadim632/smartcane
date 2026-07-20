import { createContext, useContext, useState, useCallback } from 'react'
import { authApi } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(() => {
    const raw = localStorage.getItem('utilisateur')
    return raw ? JSON.parse(raw) : null
  })

  const login = useCallback(async (email, mot_de_passe) => {
    const { data } = await authApi.login(email, mot_de_passe)
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    localStorage.setItem('utilisateur', JSON.stringify(data.utilisateur))
    setUtilisateur(data.utilisateur)
    return data.utilisateur
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout(localStorage.getItem('refreshToken'))
    } catch (e) { /* on nettoie quand meme localement */ }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('utilisateur')
    setUtilisateur(null)
  }, [])

  const updateUtilisateur = useCallback((data) => {
    const merged = { ...utilisateur, ...data }
    localStorage.setItem('utilisateur', JSON.stringify(merged))
    setUtilisateur(merged)
  }, [utilisateur])

  return (
    <AuthContext.Provider value={{ utilisateur, login, logout, updateUtilisateur }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
