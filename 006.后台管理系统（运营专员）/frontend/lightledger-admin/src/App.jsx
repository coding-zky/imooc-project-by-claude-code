import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import UserList from './pages/UserList'
import UserDetail from './pages/UserDetail'
import RecordList from './pages/RecordList'
import CategoryList from './pages/CategoryList'
import ReportList from './pages/ReportList'
import Layout from './components/Layout'

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={<Layout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users" element={<UserList />} />
              <Route path="users/:id" element={<UserDetail />} />
              <Route path="records" element={<RecordList />} />
              <Route path="categories" element={<CategoryList />} />
              <Route path="reports" element={<ReportList />} />
            </Route>
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App