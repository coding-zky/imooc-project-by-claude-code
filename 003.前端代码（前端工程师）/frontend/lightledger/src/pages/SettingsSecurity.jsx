import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { api } from '../utils/api'

export const SettingsSecurity = () => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [phone, setPhone] = useState('')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [phoneForm, setPhoneForm] = useState({ phone: '', code: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const profile = await api.getProfile()
      setPhone(profile.phone || '')
    } catch (err) {
      // silent fail
    }
  }

  const handleChangePassword = () => {
    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
    setShowPasswordModal(true)
  }

  const handleBindPhone = () => {
    setPhoneForm({ phone: phone || '', code: '' })
    setShowPhoneModal(true)
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('两次密码输入不一致', 'error')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      showToast('密码长度不能少于6位', 'error')
      return
    }

    setSaving(true)
    try {
      await api.changePassword(passwordForm.oldPassword, passwordForm.newPassword)
      showToast('密码修改成功', 'success')
      setShowPasswordModal(false)
    } catch (err) {
      showToast(err.message || '修改失败', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handlePhoneSubmit = async (e) => {
    e.preventDefault()
    if (!phoneForm.phone || phoneForm.phone.length < 11) {
      showToast('请输入有效的手机号', 'error')
      return
    }

    setSaving(true)
    try {
      await api.bindPhone(phoneForm.phone, phoneForm.code)
      showToast('手机绑定成功', 'success')
      setPhone(phoneForm.phone)
      setShowPhoneModal(false)
    } catch (err) {
      showToast(err.message || '绑定失败', 'error')
    } finally {
      setSaving(false)
    }
  }

  const formatPhone = (p) => {
    if (!p) return '未绑定'
    return p.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-display-title text-display-title text-on-surface mb-xl">账户安全</h1>

      <form className="space-y-lg">
        {/* Section: Account Security */}
        <div className="bg-surface rounded-xl border border-border p-lg space-y-lg">
          <div className="flex items-center gap-md pb-xs border-b border-border">
            <span className="material-symbols-outlined text-primary">security</span>
            <h3 className="font-headline-card text-headline-card">账户安全</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            {/* Change Password */}
            <div
              onClick={handleChangePassword}
              className="p-md border border-border rounded-xl flex items-center justify-between hover:border-outline transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-md">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface-variant">lock_reset</span>
                </div>
                <div>
                  <p className="font-body-main text-body-main font-semibold">修改密码</p>
                  <p className="font-label-helper text-label-helper text-text-secondary">上次修改：3个月前</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-text-secondary group-hover:translate-x-1 transition-transform">chevron_right</span>
            </div>

            {/* Bind Phone */}
            <div
              onClick={handleBindPhone}
              className="p-md border border-border rounded-xl flex items-center justify-between hover:border-outline transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-md">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface-variant">smartphone</span>
                </div>
                <div>
                  <p className="font-body-main text-body-main font-semibold">绑定手机</p>
                  <p className="font-on-secondary-container bg-secondary-container/20 px-xs rounded">
                    {formatPhone(phone)}
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-text-secondary group-hover:translate-x-1 transition-transform">chevron_right</span>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-lg">
          <div className="flex items-start gap-md">
            <span className="material-symbols-outlined text-primary">info</span>
            <div>
              <p className="font-body-main text-body-main font-semibold mb-xs">安全提示</p>
              <p className="text-body-secondary text-text-secondary">
                我们高度重视您的账户安全。建议您定期更换密码，并确保使用强密码（包含字母、数字和特殊字符）。
              </p>
            </div>
          </div>
        </div>
      </form>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-xl p-lg max-w-md w-full mx-4">
            <h3 className="font-headline-card text-headline-card mb-lg">修改密码</h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-md">
              <div className="space-y-xs">
                <label className="text-text-secondary font-label-helper">原密码</label>
                <input
                  type="password"
                  className="w-full px-md py-sm border border-border rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none"
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm(p => ({ ...p, oldPassword: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-xs">
                <label className="text-text-secondary font-label-helper">新密码</label>
                <input
                  type="password"
                  className="w-full px-md py-sm border border-border rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-xs">
                <label className="text-text-secondary font-label-helper">确认新密码</label>
                <input
                  type="password"
                  className="w-full px-md py-sm border border-border rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  required
                />
              </div>
              <div className="flex gap-sm pt-md">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-md py-sm border border-border rounded-lg hover:bg-surface-container-low transition-all"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-md py-sm bg-primary text-white rounded-lg hover:bg-primary-hover transition-all disabled:opacity-50"
                >
                  {saving ? '保存中...' : '确认修改'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Phone Modal */}
      {showPhoneModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-xl p-lg max-w-md w-full mx-4">
            <h3 className="font-headline-card text-headline-card mb-lg">绑定手机</h3>
            <form onSubmit={handlePhoneSubmit} className="space-y-md">
              <div className="space-y-xs">
                <label className="text-text-secondary font-label-helper">手机号</label>
                <input
                  type="tel"
                  className="w-full px-md py-sm border border-border rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none"
                  value={phoneForm.phone}
                  onChange={(e) => setPhoneForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="请输入手机号"
                  required
                />
              </div>
              <div className="space-y-xs">
                <label className="text-text-secondary font-label-helper">验证码</label>
                <div className="flex gap-sm">
                  <input
                    type="text"
                    className="flex-1 px-md py-sm border border-border rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none"
                    value={phoneForm.code}
                    onChange={(e) => setPhoneForm(p => ({ ...p, code: e.target.value }))}
                    placeholder="请输入验证码"
                    required
                  />
                  <button
                    type="button"
                    className="px-md py-sm border border-primary text-primary rounded-lg hover:bg-primary/5 transition-all"
                  >
                    获取验证码
                  </button>
                </div>
              </div>
              <div className="flex gap-sm pt-md">
                <button
                  type="button"
                  onClick={() => setShowPhoneModal(false)}
                  className="flex-1 px-md py-sm border border-border rounded-lg hover:bg-surface-container-low transition-all"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-md py-sm bg-primary text-white rounded-lg hover:bg-primary-hover transition-all disabled:opacity-50"
                >
                  {saving ? '保存中...' : '确认绑定'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}