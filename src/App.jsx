import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import { Shield } from 'lucide-react'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-navy-900 text-surface-200 flex flex-col">
            <Navbar />

            {/* Main Content Area */}
            <main className="flex-1 pt-20">
              <Routes>
                <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/login" element={<Login />} />
              </Routes>
            </main>

            {/* Global Footer */}
            <footer className="py-8 px-4 border-t border-brand-500/10 mt-auto">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-surface-500">
                  <Shield className="w-4 h-4 text-brand-400" />
                  <span className="text-sm font-medium">
                    © 2026 SecAudit. All rights reserved.
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  {['Privacy', 'Terms', 'Docs'].map((link) => (
                    <a
                      key={link}
                      href="#"
                      className="text-sm text-surface-500 hover:text-white transition-colors duration-200"
                    >
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            </footer>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}
