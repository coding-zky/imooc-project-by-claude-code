import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { storage, CATEGORIES, getCategoryById } from '../utils/storage'
import { formatCurrency, formatDate, getRelativeTime, calculateTotal, groupRecordsByDate } from '../utils/format'

export const Records = () => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [records, setRecords] = useState([])
  const [filteredRecords, setFilteredRecords] = useState([])
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)

  useEffect(() => {
    if (user?.username) {
      const allRecords = storage.getRecords(user.username)
      setRecords(allRecords)
      setFilteredRecords(allRecords)
    }
  }, [user])

  useEffect(() => {
    let filtered = records

    // Filter by month
    if (selectedMonth) {
      filtered = filtered.filter(r => r.date.startsWith(selectedMonth))
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(r => r.category === selectedCategory)
    }

    setFilteredRecords(filtered)
  }, [records, selectedMonth, selectedCategory])

  const handleDelete = (recordId) => {
    storage.deleteRecord(user.username, recordId)
    setRecords(prev => prev.filter(r => r.id !== recordId))
    showToast('记录已删除', 'success')
    setShowDeleteConfirm(null)
  }

  const groupedRecords = groupRecordsByDate(filteredRecords)
  const sortedDates = Object.keys(groupedRecords).sort((a, b) => new Date(b) - new Date(a))

  // Get current month for default filter
  const currentMonth = new Date().toISOString().slice(0, 7)

  return (
    <div className="pb-20 md:pb-8">
      {/* Header */}
      <div className="mb-lg flex flex-col md:flex-row md:items-end md:justify-between gap-md">
        <div>
          <h1 className="font-display-title text-display-title mb-xs">消费明细</h1>
          <p className="text-text-secondary font-body-secondary">追踪每一笔资金流动，保持财务清晰。</p>
        </div>
        <Link
          to="/add"
          className="bg-primary text-on-primary px-lg py-sm rounded-lg font-semibold flex items-center gap-xs hover:bg-primary-hover transition-all active:scale-[0.98]"
        >
          <span className="material-symbols-outlined">add</span>
          添加记录
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-sm bg-surface p-sm rounded-xl border border-border shadow-sm mb-lg">
        {/* Month Filter */}
        <div className="relative group">
          <label className="absolute -top-2 left-3 bg-surface px-1 font-label-helper text-label-helper text-text-secondary z-10">
            月份
          </label>
          <div className="flex items-center px-md py-sm border border-border rounded-lg group-hover:border-primary transition-colors cursor-pointer min-w-[140px]">
            <span className="material-symbols-outlined text-sm mr-sm text-primary">calendar_month</span>
            <input
              type="month"
              className="bg-transparent outline-none text-body-secondary cursor-pointer"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              max={currentMonth}
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="relative group">
          <label className="absolute -top-2 left-3 bg-surface px-1 font-label-helper text-label-helper text-text-secondary z-10">
            分类
          </label>
          <div className="relative">
            <select
              className="flex items-center px-md py-sm border border-border rounded-lg group-hover:border-primary transition-colors cursor-pointer min-w-[140px] appearance-none bg-surface pr-lg"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">全部分类</option>
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary text-sm">
              expand_more
            </span>
          </div>
        </div>

        {/* Clear Filters */}
        {(selectedMonth || selectedCategory) && (
          <button
            onClick={() => {
              setSelectedMonth('')
              setSelectedCategory('')
            }}
            className="px-md py-sm text-text-secondary hover:text-primary transition-colors text-body-secondary"
          >
            清除筛选
          </button>
        )}
      </div>

      {/* Records List */}
      {filteredRecords.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-xl text-center">
          <span className="material-symbols-outlined text-6xl text-outline mb-md">receipt_long</span>
          <p className="text-text-secondary mb-md">该筛选条件下没有消费记录</p>
          <Link to="/add" className="text-primary hover:underline">开始记录</Link>
        </div>
      ) : (
        <div className="space-y-lg">
          {sortedDates.map(date => {
            const dayRecords = groupedRecords[date]
            const dayTotal = calculateTotal(dayRecords)

            return (
              <section key={date}>
                <div className="flex items-center justify-between mb-sm pb-sm border-b border-border">
                  <h2 className="font-headline-card text-headline-card text-text-primary">
                    {date}（{['周日', '周一', '周二', '周三', '周四', '周五', '周六'][new Date(date).getDay()]}）
                  </h2>
                  <span className="font-label-helper text-text-secondary">当日支出: ¥ {dayTotal.toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-1 gap-sm">
                  {dayRecords.map(record => {
                    const category = getCategoryById(record.category)
                    return (
                      <div
                        key={record.id}
                        className="bg-surface border border-border rounded-xl p-md flex items-center group transition-all hover:border-primary/30 hover:shadow-md"
                      >
                        <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-primary mr-md">
                          <span className="material-symbols-outlined">{category.icon}</span>
                        </div>
                        <div className="flex-grow">
                          <div className="font-body-main font-semibold text-text-primary">
                            {record.note || category.name}
                          </div>
                          <div className="font-label-helper text-text-secondary">
                            {category.name}
                          </div>
                        </div>
                        <div className="text-right mr-md">
                          <div className="font-headline-card text-error">- {formatCurrency(record.amount)}</div>
                          {record.note && (
                            <div className="font-label-helper text-text-secondary">备注: {record.note}</div>
                          )}
                        </div>
                        <button
                          onClick={() => setShowDeleteConfirm(record.id)}
                          className="opacity-0 group-hover:opacity-100 p-sm text-text-secondary hover:text-error transition-all"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      )}

      {/* FAB */}
      <Link
        to="/add"
        className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </Link>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-xl p-lg max-w-sm mx-4">
            <h3 className="font-headline-card text-headline-card mb-sm">确认删除</h3>
            <p className="text-text-secondary mb-lg">确定要删除这笔记录吗？此操作无法撤销。</p>
            <div className="flex gap-sm">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-md py-sm border border-border rounded-lg hover:bg-surface-container-low transition-all"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 px-md py-sm bg-error text-white rounded-lg hover:bg-error/90 transition-all"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}