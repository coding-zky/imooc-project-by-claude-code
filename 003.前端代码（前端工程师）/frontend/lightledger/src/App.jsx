import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Pages
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { AddRecord } from './pages/AddRecord'
import { Records } from './pages/Records'
import { Stats } from './pages/Stats'
import { SettingsProfile } from './pages/SettingsProfile'
import { SettingsSecurity } from './pages/SettingsSecurity'
import { SettingsPreferences } from './pages/SettingsPreferences'

// Components
import { Layout, SettingsLayout } from './components/Layout'

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-md">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
          <p className="text-text-secondary">加载中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Public Route Wrapper (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-md">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
          <p className="text-text-secondary">加载中...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Protected Routes - Main Layout */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="add" element={<AddRecord />} />
        <Route path="records" element={<Records />} />
        <Route path="stats" element={<Stats />} />
      </Route>

      {/* Protected Routes - Settings Layout */}
      <Route path="/settings" element={<ProtectedRoute><SettingsLayout /></ProtectedRoute>}>
        <Route path="profile" element={<SettingsProfile />} />
        <Route path="security" element={<SettingsSecurity />} />
        <Route path="preferences" element={<SettingsPreferences />} />
      </Route>

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App