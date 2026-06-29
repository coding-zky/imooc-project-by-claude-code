import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { storage, CATEGORIES, getCategoryById } from '../utils/storage'
import { formatCurrency, formatDate, getRelativeTime, calculateTotal, calculateCategoryBreakdown } from '../utils/format'

export const Dashboard = () => {
  const { user } = useAuth()
  const [records, setRecords] = useState([])
  const [monthTotal, setMonthTotal] = useState(0)
  const [todayTotal, setTodayTotal] = useState(0)
  const [categoryBreakdown, setCategoryBreakdown] = useState([])

  useEffect(() => {
    if (user?.username) {
      const allRecords = storage.getRecords(user.username)
      setRecords(allRecords.slice(0, 5)) // Recent 5 records

      // Calculate month total
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthRecords = allRecords.filter(r => new Date(r.date) >= monthStart)
      setMonthTotal(calculateTotal(monthRecords))

      // Calculate today total
      const today = formatDate(new Date())
      const todayRecords = allRecords.filter(r => r.date === today)
      setTodayTotal(calculateTotal(todayRecords))

      // Calculate category breakdown
      const monthTotalValue = calculateTotal(monthRecords)
      const breakdown = calculateCategoryBreakdown(monthRecords)
      const sorted = Object.entries(breakdown)
        .map(([category, amount]) => ({
          category: getCategoryById(category),
          amount,
          percentage: monthTotalValue > 0 ? Math.round((amount / monthTotalValue) * 100) : 0
        }))
        .sort((a, b) => b.amount - a.amount)
      setCategoryBreakdown(sorted.slice(0, 4))
    }
  }, [user])

  // Get last 7 days data
  const getLast7DaysData = () => {
    const data = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = formatDate(date)
      const dayRecords = records.filter(r => r.date === dateStr)
      const total = calculateTotal(dayRecords)
      data.push({
        date: dateStr,
        label: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()],
        amount: total
      })
    }
    return data
  }

  const last7Days = getLast7DaysData()
  const maxAmount = Math.max(...last7Days.map(d => d.amount), 1)

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
        {/* Line Chart */}
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
                  <div className="hidden group-hover:block absolute -top-6 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
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
            {/* Simple pie chart representation */}
            <div className="relative w-32 h-32 mb-lg">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#E5E7EB" strokeWidth="3" />
                {monthTotal > 0 ? (
                  categoryBreakdown.reduce((acc, cat, i) => {
                    const percentage = monthTotal > 0 ? (cat.amount / monthTotal) * 100 : 0
                    const offset = acc.reduce((sum, _, j) => {
                      return sum + (monthTotal > 0 ? ((categoryBreakdown[j]?.amount || 0) / monthTotal) * 100 : 0)
                    }, 0)
                    acc.push(
                      <circle
                        key={cat.category.id}
                        cx="18"
                        cy="18"
                        fill="transparent"
                        r="15.915"
                        stroke={['#2563EB', '#006c49', '#784b00', '#EF4444'][i]}
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
                <span className="font-bold text-text-primary">¥{(monthTotal / 1000).toFixed(1)}k</span>
              </div>
            </div>
            {/* Legend */}
            <div className="w-full space-y-sm">
              {categoryBreakdown.map((cat, i) => (
                <div key={cat.category.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-sm">
                    <span className={`w-3 h-3 rounded-full bg-[${
                      ['#2563EB', '#006c49', '#784b00', '#EF4444'][i]
                    }]`} />
                    <span className="text-body-secondary">{cat.category.name}</span>
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
          <h2 className="font-headline-card text-headline-card">最近记录</h2>
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
            {records.map((record) => {
              const category = getCategoryById(record.category)
              return (
                <div key={record.id} className="px-lg py-md flex items-center justify-between hover:bg-surface-container-low transition-all">
                  <div className="flex items-center gap-md">
                    <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-surface-variant">
                        {category.icon}
                      </span>
                    </div>
                    <div>
                      <p className="font-body-main font-semibold">{record.note || category.name}</p>
                      <p className="text-label-helper text-text-secondary">
                        {getRelativeTime(record.date)} · {category.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-body-main font-bold text-text-primary">- {formatCurrency(record.amount)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}