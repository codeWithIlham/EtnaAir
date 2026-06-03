import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)
  const [token, setToken] = useState(localStorage.getItem('etnair_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('etnair_token')
    const savedUser = localStorage.getItem('etnair_user')
    if (saved && savedUser) {
      setToken(saved)
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = (token, userData) => {
    localStorage.setItem('etnair_token', token)
    localStorage.setItem('etnair_user', JSON.stringify(userData))
    setToken(token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('etnair_token')
    localStorage.removeItem('etnair_user')
    setToken(null)
    setUser(null)
  }

  // Met à jour la session sans déconnexion (ex: après changement de rôle)
  const refreshUser = (newToken, newUserData) => {
    localStorage.setItem('etnair_token', newToken)
    localStorage.setItem('etnair_user', JSON.stringify(newUserData))
    setToken(newToken)
    setUser(newUserData)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshUser, loading, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
