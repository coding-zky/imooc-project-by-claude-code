import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../utils/api'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('lightledger_token')
    const username = localStorage.getItem('lightledger_session')
    if (token && username) {
      setUser({ username })
    }
    setLoading(false)
  }, [])

  const login = (username) => {
    localStorage.setItem('lightledger_session', username)
    setUser({ username })
  }

  const logout = () => {
    localStorage.removeItem('lightledger_token')
    localStorage.removeItem('lightledger_session')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}