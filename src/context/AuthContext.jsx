import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('secAuditUser')
    return storedUser ? JSON.parse(storedUser) : null
  })

  const login = (userData) => {
    // Mock default user if none provided
    const userObj = userData || {
      name: 'Alex Developer',
      email: 'alex@company.com',
      role: 'DevSecOps Admin',
      avatar: 'AD'
    }
    setUser(userObj)
    localStorage.setItem('secAuditUser', JSON.stringify(userObj))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('secAuditUser')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
