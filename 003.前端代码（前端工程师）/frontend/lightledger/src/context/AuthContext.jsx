import { createContext, useContext, useState, useEffect } from 'react'
import { storage } from '../utils/storage'

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
    const session = storage.getSession()
    if (session) {
      setUser({ username: session.username })
    }
    setLoading(false)
  }, [])

  const login = (username) => {
    storage.setSession(username)
    setUser({ username })
  }

  const logout = () => {
    storage.clearSession()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}