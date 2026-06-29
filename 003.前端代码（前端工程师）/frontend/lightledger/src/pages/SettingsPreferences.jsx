import { useState } from 'react'
import { useToast } from '../context/ToastContext'

export const SettingsPreferences = () => {
  const { showToast } = useToast()
  const [settings, setSettings] = useState({
    defaultPage: 'dashboard',
    pageSize: '20',
    reminderEnabled: true
  })
  const [saving, setSaving] = useState(false)

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSaving(true)
    setTimeout(() => {
      showToast('设置已成功保存', 'success')
      setSaving(false)
    }, 1000)
  }

  return (
    <div className="max-w-[720px]">
      <header className="mb-xl">
        <h2 className="text-display-title font-display-title text-on-background">偏好设置</h2>
        <p className="text-text-secondary font-body-main text-body-main mt-xs">自定义您的个性化理财体验</p>
      </header>

      <form className="space-y-lg">
        {/* Display Settings */}
        <div className="bg-surface border border-border rounded-xl p-lg space-y-md">
          <h3 className="font-headline-card text-headline-card text-on-surface">显示设置</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            {/* Default Page */}
            <div className="space-y-xs">
              <label className="text-text-secondary font-label-helper text-label-helper px-base">默认显示页面</label>
              <div className="relative">
                <select
                  className="w-full bg-surface border border-border rounded-lg px-md py-sm text-body-main focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none appearance-none cursor-pointer"
                  value={settings.defaultPage}
                  onChange={(e) => setSettings(prev => ({ ...prev, defaultPage: e.target.value }))}
                >
                  <option value="dashboard">首页 / 仪表盘</option>
                  <option value="records">消费明细</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                  expand_more
                </span>
              </div>
            </div>

            {/* Items Per Page */}
            <div className="space-y-xs">
              <label className="text-text-secondary font-label-helper text-label-helper px-base">每页显示条数</label>
              <div className="relative">
                <select
                  className="w-full bg-surface border border-border rounded-lg px-md py-sm text-body-main focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none appearance-none cursor-pointer"
                  value={settings.pageSize}
                  onChange={(e) => setSettings(prev => ({ ...prev, pageSize: e.target.value }))}
                >
                  <option value="10">10 条</option>
                  <option value="20">20 条</option>
                  <option value="50">50 条</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                  expand_more
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-surface border border-border rounded-xl p-lg space-y-md">
          <h3 className="font-headline-card text-headline-card text-on-surface">消息通知</h3>
          <div className="space-y-sm">
            {/* Reminder Toggle */}
            <div className="flex items-center justify-between p-md bg-surface-container-low rounded-lg transition-all hover:bg-surface-container">
              <div className="flex items-center gap-md">
                <div className="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">schedule</span>
                </div>
                <div>
                  <p className="font-body-main text-body-main text-on-surface font-semibold">每日记账提醒</p>
                  <p className="font-label-helper text-label-helper text-text-secondary">在设定的时间提醒您记录今日支出</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.reminderEnabled}
                  onChange={() => handleToggle('reminderEnabled')}
                />
                <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container" />
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-lg flex items-center justify-end border-t border-border mt-xl">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={saving}
            className="px-xl py-md bg-primary text-on-primary font-body-main text-body-main rounded-lg font-semibold hover:bg-primary-hover active:scale-95 transition-all shadow-md disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存修改'}
          </button>
        </div>
      </form>
    </div>
  )
}