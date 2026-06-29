import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { api } from '../utils/api'

export const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.username.trim()) {
      newErrors.username = '请输入用户名'
    }
    if (!formData.password) {
      newErrors.password = '请输入密码'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const result = await api.login(formData.username, formData.password)
      login(result.user.username)
      showToast('登录成功', 'success')
      navigate('/')
    } catch (error) {
      showToast(error.message || '登录失败', 'error')
      setErrors({ password: error.message || '登录失败' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

      {/* Header */}
      <header className="relative z-10 w-full flex justify-center pt-md">
        <div className="flex items-center gap-sm">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: 'FILL 1' }}>
              account_balance_wallet
            </span>
          </div>
          <div>
            <h1 className="font-display-title text-xl text-primary font-bold tracking-tight">轻账本</h1>
            <p className="text-[10px] text-text-secondary -mt-0.5">LightLedger</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex items-center justify-center px-layout-margin py-xl">
        <div className="w-full max-w-[420px]">
          <div className="bg-surface/80 backdrop-blur-sm border border-border/50 rounded-2xl p-lg md:p-xl shadow-xl shadow-primary/5">
            <div className="text-center mb-xl">
              <h2 className="font-display-title text-2xl text-text-primary mb-sm">欢迎回来</h2>
              <p className="text-body-secondary text-text-secondary">请登录您的账户以继续管理财务</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-lg">
              {/* Username Field */}
              <div className="space-y-sm">
                <label className="font-label-helper text-label-helper text-on-surface-variant block ml-1" htmlFor="username">
                  用户名
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">person</span>
                  <input
                    className={`w-full pl-10 pr-md py-md bg-surface border rounded-xl text-body-main focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${
                      errors.username ? 'border-error' : 'border-border'
                    }`}
                    id="username"
                    name="username"
                    placeholder="请输入您的用户名"
                    value={formData.username}
                    onChange={handleChange}
                    autoComplete="username"
                  />
                </div>
                {errors.username && (
                  <p className="text-error text-xs ml-1">{errors.username}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-sm">
                <div className="flex justify-between items-center ml-1">
                  <label className="font-label-helper text-label-helper text-on-surface-variant" htmlFor="password">
                    密码
                  </label>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">lock</span>
                  <input
                    className={`w-full pl-10 pr-12 py-md bg-surface border rounded-xl text-body-main focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${
                      errors.password ? 'border-error' : 'border-border'
                    }`}
                    id="password"
                    name="password"
                    type="password"
                    placeholder="请输入您的密码"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                  />
                </div>
                {errors.password && (
                  <p className="text-error text-xs ml-1">{errors.password}</p>
                )}
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-md bg-primary text-white font-semibold text-body-main rounded-xl hover:bg-primary-hover transition-all btn-press shadow-lg shadow-primary/20 flex justify-center items-center gap-sm disabled:opacity-50 disabled:cursor-not-allowed mt-md"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">sync</span>
                    登录中...
                  </>
                ) : (
                  <>
                    登录
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            {/* Registration Redirect */}
            <div className="mt-xl pt-lg border-t border-border/50 text-center">
              <p className="text-body-secondary text-text-secondary">
                还没有账号？
                <Link className="text-primary font-semibold hover:underline ml-1" to="/register">立即注册</Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-lg px-layout-margin">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-md">
          <div className="font-label-helper text-label-helper text-outline">© 2024 轻账本. 保留所有权利.</div>
          <div className="flex items-center gap-lg">
            <a className="font-label-helper text-label-helper text-text-secondary hover:text-primary transition-colors" href="#">帮助中心</a>
            <a className="font-label-helper text-label-helper text-text-secondary hover:text-primary transition-colors" href="#">隐私政策</a>
            <a className="font-label-helper text-label-helper text-text-secondary hover:text-primary transition-colors" href="#">服务条款</a>
          </div>
        </div>
      </footer>
    </div>
  )
}