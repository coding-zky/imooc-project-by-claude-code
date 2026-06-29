import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { storage } from '../utils/storage'

export const Register = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
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
    } else if (!/^[a-zA-Z0-9_]{4,20}$/.test(formData.username)) {
      newErrors.username = '用户名只能包含字母、数字和下划线，4-20个字符'
    }

    if (!formData.password) {
      newErrors.password = '请输入密码'
    } else if (formData.password.length < 6) {
      newErrors.password = '密码至少需要6个字符'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '请再次输入密码'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    const result = storage.createUser(formData.username, formData.password)

    if (result.success) {
      login(formData.username)
      showToast('注册成功', 'success')
      navigate('/')
    } else {
      showToast(result.error, 'error')
      setErrors({ username: result.error })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />

      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl" />

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
              <h2 className="font-display-title text-2xl text-text-primary mb-sm">创建新账号</h2>
              <p className="text-body-secondary text-text-secondary">加入轻账本，开始简单高效的记账生活</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-lg">
              {/* Username */}
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
                    placeholder="4-20个字符，支持字母、数字、下划线"
                    value={formData.username}
                    onChange={handleChange}
                    autoComplete="username"
                  />
                </div>
                {errors.username && (
                  <p className="text-error text-xs ml-1">{errors.username}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-sm">
                <label className="font-label-helper text-label-helper text-on-surface-variant block ml-1" htmlFor="password">
                  密码
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">lock</span>
                  <input
                    className={`w-full pl-10 pr-md py-md bg-surface border rounded-xl text-body-main focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${
                      errors.password ? 'border-error' : 'border-border'
                    }`}
                    id="password"
                    name="password"
                    type="password"
                    placeholder="至少6个字符"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                </div>
                {errors.password && (
                  <p className="text-error text-xs ml-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-sm">
                <label className="font-label-helper text-label-helper text-on-surface-variant block ml-1" htmlFor="confirmPassword">
                  确认密码
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">lock_reset</span>
                  <input
                    className={`w-full pl-10 pr-md py-md bg-surface border rounded-xl text-body-main focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${
                      errors.confirmPassword ? 'border-error' : 'border-border'
                    }`}
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="请再次输入密码"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-error text-xs ml-1">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-md bg-primary text-white font-semibold text-body-main rounded-xl hover:bg-primary-hover active:scale-[0.98] transition-all flex items-center justify-center gap-sm shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed mt-md"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">sync</span>
                    正在创建...
                  </>
                ) : (
                  <>
                    立即注册
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-xl pt-lg border-t border-border/50 text-center">
              <p className="text-body-secondary text-text-secondary">
                已有账号？
                <Link className="text-primary font-semibold hover:underline ml-1" to="/login">立即登录</Link>
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