import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { api } from '../utils/api'
import { formatCurrency } from '../utils/format'

const CATEGORY_COLORS = ['#2563EB', '#006c49', '#784b00', '#EF4444']

export const Dashboard = () => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState([])
  const [stats, setStats] = useState(null)
  const [monthTotal, setMonthTotal] = useState(0)
  const [todayTotal, setTodayTotal] = useState(0)

  useEffect(() => {
    loadData()
    const handleRecordAdded = () => loadData()
    window.addEventListener('record-added', handleRecordAdded)
    return () => window.removeEventListener('record-added', handleRecordAdded)
  }, [user])

  const loadData = async () => {
    if (!user?.username) return
    setLoading(true)
    try {
      const now = new Date()
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

      // Fetch stats (7 days), recent 3 records, and all month records for total in parallel
      const [statsData, recentData, monthData] = await Promise.all([
        api.getStats(7).catch(() => null),
        api.getRecords({ month: currentMonth, pageSize: 3 }).catch(() => ({ records: [] })),
        api.getRecords({ month: currentMonth, pageSize: 500 }).catch(() => ({ records: [] })),
      ])

      setStats(statsData)
      setRecords(recentData.records || [])

      // Calculate month total from ALL month records
      if (monthData.records) {
        const total = monthData.records.reduce((sum, r) => sum + Number(r.amount), 0)
        setMonthTotal(total)
      }

      // Calculate today total from stats daily data
      if (statsData?.dailyData) {
        const todayLocal = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
        const todayData = statsData.dailyData.find(d => d.date === todayLocal)
        setTodayTotal(todayData ? Number(todayData.amount) : 0)
      }
    } catch (err) {
      showToast('加载数据失败', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Get last 7 days data from stats
  const getLast7DaysData = () => {
    if (!stats?.dailyData) {
      const data = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        data.push({
          date: date.toISOString().split('T')[0],
          label: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()],
          amount: 0,
        })
      }
      return data
    }
    return stats.dailyData.map(d => ({
      ...d,
      label: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][new Date(d.date).getDay()],
    }))
  }

  const last7Days = getLast7DaysData()
  const maxAmount = Math.max(...last7Days.map(d => d.amount), 1)

  const getRelativeTime = (dateStr) => {
    if (!dateStr) return '未知'
    const dateStrClean = dateStr.split('T')[0]
    const date = new Date(dateStrClean)
    if (isNaN(date.getTime())) return '未知'
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return '今天'
    if (diffDays === 1) return '昨天'
    if (diffDays < 7) return `${diffDays}天前`
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
      </div>
    )
  }

  return (
    <div className="pb-20 md:pb-8">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between mb-lg gap-4">
        <div>
          <h1 className="font-display-title text-display-title text-text-primary mb-1">
            您好, {user?.username || '用户'}
          </h1>
          <p className="text-text-secondary font-body-secondary">这是您本月的财务概览，继续保持良好的记账习惯。</p>
        </div>
        <Link
          to="/add"
          className="bg-primary hover:bg-primary-hover text-white px-lg py-sm rounded-lg font-semibold flex items-center gap-xs transition-all active:scale-[0.98] shadow-sm"
        >
          <span className="material-symbols-outlined">add_circle</span>
          立即记录
        </Link>
      </section>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-lg">
        {/* Month Total Card */}
        <div className="bg-surface border border-border rounded-xl p-lg flex flex-col justify-between card-hover">
          <div>
            <div className="flex items-center gap-sm mb-md">
              <div className="p-2 bg-primary/10 rounded-lg">
                <span className="material-symbols-outlined text-primary">calendar_month</span>
              </div>
              <span className="font-label-helper text-text-secondary uppercase tracking-wider">本月总支出</span>
            </div>
            <div className="flex items-baseline gap-xs">
              <span className="text-body-main font-semibold text-text-primary">¥</span>
              <span className="text-[40px] font-bold tracking-tight text-text-primary">{monthTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Today Total Card */}
        <div className="bg-surface border border-border rounded-xl p-lg flex flex-col justify-between card-hover">
          <div>
            <div className="flex items-center gap-sm mb-md">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <span className="material-symbols-outlined text-secondary">today</span>
              </div>
              <span className="font-label-helper text-text-secondary uppercase tracking-wider">今日支出</span>
            </div>
            <div className="flex items-baseline gap-xs">
              <span className="text-body-main font-semibold text-text-primary">¥</span>
              <span className="text-[40px] font-bold tracking-tight text-text-primary">{todayTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-md mb-lg">
        {/* Bar Chart */}
        <div className="lg:col-span-8 bg-surface border border-border rounded-xl p-lg">
          <div className="flex justify-between items-center mb-lg">
            <h2 className="font-headline-card text-headline-card">最近7天消费趋势</h2>
          </div>
          <div className="h-48 flex items-end justify-between px-lg pb-6 relative">
            <div className="absolute inset-0 flex items-end justify-between px-lg pb-10 border-b border-border mb-md">
              {last7Days.map((day, i) => (
                <div
                  key={i}
                  className="w-12 bg-primary/20 rounded-t-lg relative group transition-all hover:bg-primary/40"
                  style={{ height: `${(day.amount / maxAmount) * 100}%`, minHeight: day.amount > 0 ? '20px' : '4px' }}
                >
                  <div className="hidden group-hover:block absolute -top-6 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                    ¥{day.amount.toFixed(0)}
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute bottom-0 left-0 w-full flex justify-between px-lg text-label-helper text-text-secondary">
              {last7Days.map((day, i) => (
                <span key={i}>{day.label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="lg:col-span-4 bg-surface border border-border rounded-xl p-lg">
          <h2 className="font-headline-card text-headline-card mb-lg">消费分类占比</h2>
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 mb-lg">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#E5E7EB" strokeWidth="3" />
                {stats && stats.totalAmount > 0 ? (
                  stats.categoryData.slice(0, 4).reduce((acc, cat, i) => {
                    const percentage = (cat.amount / stats.totalAmount) * 100
                    const offset = acc.reduce((sum, _, j) => {
                      return sum + ((stats.categoryData[j]?.amount / stats.totalAmount) * 100)
                    }, 0)
                    acc.push(
                      <circle
                        key={cat.categoryId}
                        cx="18"
                        cy="18"
                        fill="transparent"
                        r="15.915"
                        stroke={CATEGORY_COLORS[i]}
                        strokeDasharray={`${percentage} ${100 - percentage}`}
                        strokeDashoffset={-offset}
                        strokeWidth="3"
                      />
                    )
                    return acc
                  }, [])
                ) : (
                  <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#E5E7EB" strokeWidth="3" strokeDasharray="100 0" />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-label-helper text-text-secondary">总计</span>
                <span className="font-bold text-text-primary">¥{stats ? (stats.totalAmount / 1000).toFixed(1) : '0'}k</span>
              </div>
            </div>
            {/* Legend */}
            <div className="w-full space-y-sm">
              {stats?.categoryData?.slice(0, 4).map((cat, i) => (
                <div key={cat.categoryId} className="flex items-center justify-between">
                  <div className="flex items-center gap-sm">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[i] }} />
                    <span className="text-body-secondary">{cat.emoji} {cat.name}</span>
                  </div>
                  <span className="text-body-secondary font-semibold">{cat.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Records */}
      <section className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-lg border-b border-border flex justify-between items-center">
          <h2 className="font-headline-card text-headline-card">最近记账</h2>
          <Link to="/records" className="text-primary text-body-secondary font-semibold hover:underline">
            查看全部
          </Link>
        </div>
        {records.length === 0 ? (
          <div className="p-lg text-center">
            <p className="text-text-secondary mb-md">还没有消费记录</p>
            <Link to="/add" className="text-primary hover:underline">开始记录第一笔</Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {records.map((record) => (
              <div key={record.id} className="px-lg py-md flex items-center justify-between hover:bg-surface-container-low transition-all">
                <div className="flex items-center gap-md">
                  <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
                    <span className="text-lg">{record.category?.emoji || '📌'}</span>
                  </div>
                  <div>
                    <p className="font-body-main font-semibold">{record.note || record.category?.name || '未知分类'}</p>
                    <p className="text-label-helper text-text-secondary">
                      {getRelativeTime(record.recordDate)} · {record.category?.name || '未知'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-body-main font-bold text-error">- {formatCurrency(record.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}