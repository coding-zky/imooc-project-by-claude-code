import { createContext, useContext, useState, useEffect } from 'react'

const AvatarContext = createContext(null)

export const useAvatar = () => {
  const context = useContext(AvatarContext)
  if (!context) {
    throw new Error('useAvatar must be used within AvatarProvider')
  }
  return context
}

export const AvatarProvider = ({ children }) => {
  const [avatar, setAvatar] = useState(null)

  // Initial load and listen for updates
  useEffect(() => {
    const loadAvatar = () => {
      const session = localStorage.getItem('lightledger_session')
      let username = null
      if (session) {
        try {
          const parsed = JSON.parse(session)
          username = parsed.username || parsed
        } catch {
          username = session
        }
      }
      if (username) {
        const savedAvatar = localStorage.getItem(`lightledger_avatar_${username}`)
        setAvatar(savedAvatar || null)
      }
    }

    loadAvatar()

    window.addEventListener('avatar-updated', loadAvatar)
    return () => window.removeEventListener('avatar-updated', loadAvatar)
  }, [])

  return (
    <AvatarContext.Provider value={{ avatar, setAvatar }}>
      {children}
    </AvatarContext.Provider>
  )
}