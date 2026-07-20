import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { API_URL } from '../api/client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const { utilisateur } = useAuth()
  const socketRef = useRef(null)
  const [connecte, setConnecte] = useState(false)

  useEffect(() => {
    if (!utilisateur) return
    const socket = io(API_URL, { transports: ['websocket'], reconnectionAttempts: Infinity })
    socketRef.current = socket

    socket.on('connect', () => setConnecte(true))
    socket.on('disconnect', () => setConnecte(false))

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [utilisateur])

  function rejoindreCanne(canneId) {
    socketRef.current?.emit('canne:join', canneId)
  }
  function quitterCanne(canneId) {
    socketRef.current?.emit('canne:leave', canneId)
  }
  function onEvent(event, handler) {
    socketRef.current?.on(event, handler)
    return () => socketRef.current?.off(event, handler)
  }

  return (
    <SocketContext.Provider value={{ connecte, rejoindreCanne, quitterCanne, onEvent }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}
