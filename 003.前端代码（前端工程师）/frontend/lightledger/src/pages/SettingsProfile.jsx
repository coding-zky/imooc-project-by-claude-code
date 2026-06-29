import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useAvatar } from '../context/AvatarContext'
import { Sidebar } from '../components/Sidebar'

export const SettingsProfile = () => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { setAvatar } = useAvatar()
  const fileInputRef = useRef(null)
  const [email, setEmail] = useState('dev@lightledger.io')
  const [avatar, setLocalAvatar] = useState(null)
  const [saving, setSaving] = useState(false)

  // Load avatar from localStorage on mount
  useEffect(() => {
    if (user?.username) {
      const savedAvatar = localStorage.getItem(`lightledger_avatar_${user.username}`)
      if (savedAvatar) {
        setLocalAvatar(savedAvatar)
      }
    }
  }, [user])

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('请选择图片文件', 'error')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast('图片大小不能超过 2MB', 'error')
      return
    }

    // Read file as data URL
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result
      setLocalAvatar(dataUrl)
      // Save to localStorage
      if (user?.username) {
        localStorage.setItem(`lightledger_avatar_${user.username}`, dataUrl)
        // Notify Header to update avatar
        window.dispatchEvent(new Event('avatar-updated'))
      }
      showToast('头像已更新', 'success')
    }
    reader.onerror = () => {
      showToast('读取图片失败', 'error')
    }
    reader.readAsDataURL(file)

    // Reset input so same file can be selected again
    e.target.value = ''
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSaving(true)
    // Update global avatar state
    if (avatar) {
      setAvatar(avatar)
    }
    setTimeout(() => {
      // Notify Header to update avatar
      window.dispatchEvent(new Event('avatar-updated'))
      showToast('设置已成功保存', 'success')
      setSaving(false)
    }, 1000)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-layout-margin lg:p-xl">
        <div className="max-w-3xl">
          <h1 className="font-display-title text-display-title text-on-surface mb-xl">个人信息设置</h1>

          <form onSubmit={handleSubmit} className="space-y-lg">
            {/* Section 1: Basic Info */}
            <div className="bg-surface rounded-xl border border-border p-lg space-y-lg">
              <div className="flex items-center gap-md pb-xs border-b border-border">
                <span className="material-symbols-outlined text-primary">account_circle</span>
                <h3 className="font-headline-card text-headline-card">基本资料</h3>
              </div>

              <div className="flex flex-col md:flex-row gap-lg">
                {/* Avatar */}
                <div className="flex flex-col items-center gap-sm">
                  <div
                    onClick={handleAvatarClick}
                    className="relative w-24 h-24 rounded-full bg-surface-container flex items-center justify-center border-2 border-border cursor-pointer hover:border-primary transition-all overflow-hidden group"
                  >
                    {avatar ? (
                      <img src={avatar} alt="头像" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant">person</span>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-2xl">photo_camera</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    className="text-primary font-body-secondary text-body-secondary hover:underline"
                  >
                    更换头像
                  </button>
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* Fields */}
                <div className="flex-1 space-y-md">
                  <div className="grid grid-cols-1 gap-md">
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-helper text-label-helper text-text-secondary">用户名</label>
                      <div className="px-md py-sm bg-surface-container-low border border-border rounded-lg font-body-main text-body-main text-on-surface-variant flex items-center gap-xs">
                        <span>{user?.username || 'User'}</span>
                        <span className="material-symbols-outlined text-label-helper opacity-40">lock</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-xs">
                      <label className="font-label-helper text-label-helper text-text-secondary" htmlFor="email">电子邮箱</label>
                      <input
                        className="px-md py-sm border border-border rounded-lg font-body-main text-body-main focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end pt-lg">
              <button
                type="submit"
                disabled={saving}
                className="px-xl py-md bg-primary text-on-primary rounded-lg font-body-main text-body-main font-semibold hover:bg-primary-hover shadow-sm active-scale transition-all disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存修改'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}