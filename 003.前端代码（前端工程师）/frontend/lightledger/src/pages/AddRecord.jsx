import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { api } from '../utils/api'

export const AddRecord = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    amount: '',
    categoryId: '',
    recordDate: new Date().toISOString().split('T')[0],
    note: '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const data = await api.getCategories()
      setCategories(data)
    } catch (err) {
      showToast('加载分类失败', 'error')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleCategorySelect = (categoryId) => {
    setFormData(prev => ({ ...prev, categoryId }))
    setErrors(prev => ({ ...prev, categoryId: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.amount || Number(formData.amount) <= 0) {
      newErrors.amount = '请输入有效的消费金额'
    }
    if (!formData.categoryId) {
      newErrors.categoryId = '请选择消费分类'
    }
    if (!formData.recordDate) {
      newErrors.recordDate = '请选择消费日期'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      await api.createRecord({
        amount: Number(formData.amount),
        categoryId: formData.categoryId,
        recordDate: formData.recordDate,
        note: formData.note,
      })
      showToast('账目已保存成功', 'success')
      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      showToast(err.message || '保存失败，请重试', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate(-1)
  }

  return (
    <div className="pb-20 md:pb-8 max-w-[520px] mx-auto">
      {/* Header */}
      <div className="mb-lg">
        <h1 className="font-display-title text-display-title text-text-primary mb-xs">添加新账目</h1>
        <p className="text-text-secondary font-body-secondary">简单几步，理清您的每一笔开支。</p>
      </div>

      {/* Form Card */}
      <div className="bg-surface rounded-xl border border-border p-lg md:p-xl">
        <form onSubmit={handleSubmit} className="space-y-lg">
          {/* Amount Input */}
          <div className="space-y-sm">
            <label className="font-label-helper text-label-helper text-text-secondary block uppercase tracking-wider">
              账目金额 (元)
            </label>
            <div className="relative group">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-4xl font-semibold text-text-primary">¥</span>
              <input
                className={`w-full pl-10 py-4 text-5xl font-bold text-text-primary bg-transparent border-b-2 transition-all appearance-none ${
                  errors.amount ? 'border-error' : 'border-border focus:border-primary'
                }`}
                placeholder="0.00"
                step="0.01"
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                autoFocus
              />
            </div>
            {errors.amount && (
              <p className="text-error text-xs">{errors.amount}</p>
            )}
          </div>

          {/* Category Selection */}
          <div className="space-y-sm">
            <label className="font-label-helper text-label-helper text-text-secondary block uppercase tracking-wider">
              消费类别
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-sm">
              {categories.slice(0, 6).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.id.toString())}
                  className={`
                    flex items-center gap-xs p-sm border rounded-lg transition-all active:scale-95 text-body-secondary
                    ${formData.categoryId === cat.id.toString()
                      ? 'bg-primary-container text-on-primary-container border-primary'
                      : 'border-border hover:bg-surface-container-low'
                    }
                  `}
                >
                  <span>{cat.emoji}</span>
                  <span className="text-sm">{cat.name}</span>
                </button>
              ))}
            </div>
            {/* Dropdown for more */}
            <div className="relative">
              <select
                className={`w-full p-sm rounded-lg border text-body-secondary appearance-none cursor-pointer ${
                  errors.categoryId ? 'border-error' : 'border-border focus:border-primary'
                } ${formData.categoryId ? 'text-text-primary' : ''}`}
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
              >
                <option value="">选择更多分类...</option>
                {categories.slice(6).map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                expand_more
              </span>
            </div>
            {errors.categoryId && (
              <p className="text-error text-xs">{errors.categoryId}</p>
            )}
          </div>

          {/* Date & Note */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div className="space-y-sm">
              <label className="font-label-helper text-label-helper text-text-secondary block uppercase tracking-wider">
                日期
              </label>
              <div className="relative">
                <input
                  className={`w-full p-sm rounded-lg border text-body-secondary ${
                    errors.recordDate ? 'border-error' : 'border-border focus:border-primary'
                  }`}
                  type="date"
                  name="recordDate"
                  value={formData.recordDate}
                  onChange={handleChange}
                />
              </div>
              {errors.recordDate && (
                <p className="text-error text-xs">{errors.recordDate}</p>
              )}
            </div>
            <div className="space-y-sm">
              <label className="font-label-helper text-label-helper text-text-secondary block uppercase tracking-wider">
                备注 (可选)
              </label>
              <input
                className="w-full p-sm rounded-lg border border-border text-body-secondary focus:border-primary"
                placeholder="添加一些描述..."
                type="text"
                name="note"
                value={formData.note}
                onChange={handleChange}
                maxLength={200}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-md border-t border-border flex flex-col sm:flex-row gap-sm">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-on-primary py-sm rounded-xl font-semibold hover:bg-primary-hover transition-all active:scale-[0.98] shadow-lg shadow-primary/10 flex items-center justify-center gap-xs disabled:opacity-50"
            >
              <span className="material-symbols-outlined">check</span>
              {loading ? '保存中...' : '确认保存'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-lg py-sm bg-surface border border-border text-text-secondary rounded-xl font-semibold hover:bg-surface-container-low transition-all active:scale-[0.98]"
            >
              取消
            </button>
          </div>
        </form>
      </div>

      {/* Tips */}
      <div className="mt-lg grid grid-cols-1 md:grid-cols-2 gap-sm">
        <div className="p-sm bg-primary/5 rounded-lg border border-primary/10 flex items-start gap-sm">
          <span className="material-symbols-outlined text-primary text-lg">lightbulb</span>
          <p className="text-body-secondary text-on-primary-fixed-variant leading-tight text-sm">提示：您可以直接在首页设置快捷记账模板。</p>
        </div>
        <div className="p-sm bg-secondary/5 rounded-lg border border-secondary/10 flex items-start gap-sm">
          <span className="material-symbols-outlined text-secondary text-lg">shield</span>
          <p className="text-body-secondary text-on-secondary-fixed-variant leading-tight text-sm">安全：您的数据已进行加密存储。</p>
        </div>
      </div>
    </div>
  )
}