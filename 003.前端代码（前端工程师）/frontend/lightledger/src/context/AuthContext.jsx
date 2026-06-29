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
    const session = localStorage.getItem('lightledger_session')
    if (token && session) {
      let username = null
      try {
        const parsed = JSON.parse(session)
        username = parsed.username || parsed
      } catch {
        username = session
      }
      if (username) setUser({ username })
    }
    setLoading(false)
  }, [])

  const login = (username) => {
    localStorage.setItem('lightledger_session', JSON.stringify({ username }))
    setUser({ username })
  }

  const logout = () => {
    localStorage.removeItem('lightledger_token')
    localStorage.removeItem('lightledger_session')
    window.dispatchEvent(new Event('avatar-updated'))
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}