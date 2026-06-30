import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { api } from '../utils/api'
import { formatCurrency } from '../utils/format'

const COLORS = ['#2563EB', '#006c49', '#784b00', '#EF4444', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#6366F1', '#64748B']

export const Stats = () => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [timeRange, setTimeRange] = useState('7')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    loadStats()
  }, [timeRange])

  const loadStats = async () => {
    setLoading(true)
    try {
      const data = await api.getStats(parseInt(timeRange))
      setStats(data)
    } catch (err) {
      showToast('加载统计数据失败', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      await api.exportExcel(parseInt(timeRange))
      showToast('Excel 导出成功', 'success')
    } catch (err) {
      showToast('导出失败', 'error')
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
      </div>
    )
  }

  const totalAmount = stats?.totalAmount || 0
  const avgDaily = stats?.avgDaily || 0
  const maxRecord = stats?.categoryData?.[0]

  return (
    <div className="pb-20 md:pb-8">
      {/* Header */}
      <div className="mb-lg flex flex-col md:flex-row md:items-end md:justify-between gap-md">
        <div>
          <h1 className="font-display-title text-display-title mb-xs">统计报表</h1>
          <p className="text-text-secondary font-body-secondary">洞察您的消费习惯，优化财务结构</p>
        </div>
        <div className="flex items-center gap-md">
          {/* Time Range Selector */}
          <div className="flex items-center bg-surface border border-border rounded-lg p-1">
            <button
              onClick={() => setTimeRange('7')}
              className={`px-md py-xs rounded-md text-sm font-medium transition-all ${
                timeRange === '7' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:bg-surface-container-low'
              }`}
            >
              最近7天
            </button>
            <button
              onClick={() => setTimeRange('30')}
              className={`px-md py-xs rounded-md text-sm font-medium transition-all ${
                timeRange === '30' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:bg-surface-container-low'
              }`}
            >
              最近30天
            </button>
          </div>
          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-xs px-md py-xs bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">{exporting ? 'sync' : 'download'}</span>
            {exporting ? '导出中...' : '导出Excel'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-12 gap-md mb-lg">
        {/* Total Card */}
        <div className="col-span-12 md:col-span-4 bg-surface border border-border rounded-xl p-lg flex flex-col justify-between">
          <div>
            <span className="text-text-secondary text-label-helper font-label-helper uppercase tracking-wider">总支出 (CNY)</span>
            <h2 className="text-3xl font-bold text-text-primary mt-sm">¥ {totalAmount.toFixed(2)}</h2>
          </div>
          <div className="mt-lg pt-lg border-t border-border">
            <div className="flex justify-between items-center mb-sm">
              <span className="text-text-secondary text-sm">日均消费</span>
              <span className="font-semibold text-text-primary">¥ {avgDaily.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary text-sm">最高分类</span>
              <span className="font-semibold text-error">
                {maxRecord ? `${maxRecord.emoji} ¥${Number(maxRecord.amount).toFixed(2)}` : '¥0.00'}
              </span>
            </div>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="col-span-12 md:col-span-8 bg-surface border border-border rounded-xl p-lg">
          <div className="flex items-center justify-between mb-lg">
            <h3 className="font-semibold text-text-primary">消费趋势分析</h3>
          </div>
          <div className="h-48 flex items-end justify-between px-md relative">
            <div className="absolute inset-0 flex items-end justify-between px-lg pb-8 border-b border-dashed border-border">
              {(stats?.dailyData || []).map((day, i) => (
                <div
                  key={i}
                  className="w-12 bg-primary/20 rounded-t-lg relative group transition-all hover:bg-primary/40"
                  style={{ height: `${totalAmount > 0 ? (Number(day.amount) / Math.max(...(stats.dailyData?.map(d => Number(d.amount)) || [1]), 1)) * 100 : 0}%`, minHeight: Number(day.amount) > 0 ? '8px' : '4px' }}
                >
                  <div className="hidden group-hover:block absolute -top-6 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                    ¥{Number(day.amount).toFixed(0)}
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute bottom-0 left-0 w-full flex justify-between px-lg text-label-helper text-text-secondary">
              {(stats?.dailyData || []).map((day, i) => (
                <span key={i}>{day.label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        {/* Pie Chart */}
        <div className="bg-surface border border-border rounded-xl p-lg">
          <h3 className="font-headline-card text-headline-card mb-lg">消费分类占比</h3>
          <div className="flex flex-col items-center">
            <div className="relative w-40 h-40 mb-lg">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#E5E7EB" strokeWidth="3" />
                {totalAmount > 0 && stats?.categoryData ? stats.categoryData.reduce((acc, cat, i) => {
                  const percentage = (Number(cat.amount) / totalAmount) * 100
                  const offset = acc.reduce((sum, _, j) => {
                    return sum + ((Number(stats.categoryData[j].amount) / totalAmount) * 100)
                  }, 0)
                  if (percentage > 0) {
                    acc.push(
                      <circle
                        key={cat.categoryId}
                        cx="18"
                        cy="18"
                        fill="transparent"
                        r="15.915"
                        stroke={COLORS[i % COLORS.length]}
                        strokeDasharray={`${percentage} ${100 - percentage}`}
                        strokeDashoffset={-offset}
                        strokeWidth="3"
                      />
                    )
                  }
                  return acc
                }, []) : (
                  <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#E5E7EB" strokeWidth="3" strokeDasharray="100 0" />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-label-helper text-text-secondary">总计</span>
                <span className="font-bold text-text-primary">¥{(totalAmount / 1000).toFixed(1)}k</span>
              </div>
            </div>
            {/* Legend */}
            <div className="w-full space-y-sm">
              {stats?.categoryData?.slice(0, 5).map((cat, i) => (
                <div key={cat.categoryId} className="flex items-center justify-between">
                  <div className="flex items-center gap-sm">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="text-body-secondary">{cat.emoji} {cat.name}</span>
                  </div>
                  <div className="flex items-center gap-md">
                    <span className="text-body-secondary">¥{Number(cat.amount).toFixed(2)}</span>
                    <span className="text-body-secondary font-semibold w-10 text-right">{cat.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Ranking */}
        <div className="bg-surface border border-border rounded-xl p-lg">
          <h3 className="font-headline-card text-headline-card mb-lg">分类金额排名</h3>
          <div className="space-y-md">
            {stats?.categoryData?.map((cat, i) => (
              <div key={cat.categoryId} className="space-y-xs">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-sm">
                    <span className="w-5 h-5 rounded-full bg-surface-container flex items-center justify-center text-xs font-semibold text-text-secondary">
                      {i + 1}
                    </span>
                    <span className="text-body-secondary">{cat.emoji} {cat.name}</span>
                  </div>
                  <span className="font-semibold text-text-primary">¥{Number(cat.amount).toFixed(2)}</span>
                </div>
                <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${totalAmount > 0 ? (Number(cat.amount) / totalAmount) * 100 : 0}%`,
                      backgroundColor: COLORS[i % COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}