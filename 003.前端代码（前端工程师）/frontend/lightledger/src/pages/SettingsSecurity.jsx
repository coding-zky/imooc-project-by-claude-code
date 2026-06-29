import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export const SettingsSecurity = () => {
  const { user } = useAuth()
  const { showToast } = useToast()

  const handleChangePassword = () => {
    showToast('密码修改功能开发中', 'error')
  }

  const handleBindPhone = () => {
    showToast('手机绑定功能开发中', 'error')
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
                  <p className="font-label-helper text-on-secondary-container bg-secondary-container/20 px-xs rounded">已绑定: 138****0000</p>
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
    </div>
  )
}