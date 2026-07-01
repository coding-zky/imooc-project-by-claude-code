import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { useToast } from '../context/ToastContext'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Download } from 'lucide-react'

function ReportList() {
  const { showToast } = useToast()
  const [days, setDays] = useState(7)
  const [expenseTrend, setExpenseTrend] = useState([])
  const [userRanking, setUserRanking] = useState([])
  const [categoryRanking, setCategoryRanking] = useState([])
  const [userTrend, setUserTrend] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadReportData()
  }, [days])

  const loadReportData = async () => {
    setLoading(true)
    try {
      const [expense, userRank, catRank, userT] = await Promise.all([
        api.getExpenseTrend(days),
        api.getUserRanking(20),
        api.getCategoryRanking(),
        api.getUserTrend(30)
      ])
      setExpenseTrend(expense || [])
      setUserRanking(userRank || [])
      setCategoryRanking(catRank || [])
      setUserTrend(userT || [])
    } catch (error) {
      showToast('加载报表数据失败', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      await api.exportReport(days)
      showToast('导出成功', 'success')
    } catch (error) {
      showToast('导出失败', 'error')
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">数据报表</h1>
        <div className="flex items-center gap-4">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value={7}>近7天</option>
            <option value={30}>近30天</option>
          </select>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
          >
            <Download size={18} />
            导出Excel
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">加载中...</div>
      ) : (
        <div className="space-y-6">
          {/* Expense Trend */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">消费趋势</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={expenseTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `¥${value.toFixed(2)}`} />
                  <Line type="monotone" dataKey="amount" stroke="#2563EB" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* User Ranking */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">用户消费排行 TOP20</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userRanking} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="username" type="category" width={80} />
                  <Tooltip formatter={(value) => `¥${value.toFixed(2)}`} />
                  <Bar dataKey="totalAmount" fill="#2563EB" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Ranking */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">分类消费排行</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryRanking} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="categoryName" type="category" width={80} />
                  <Tooltip formatter={(value) => `¥${value.toFixed(2)}`} />
                  <Bar dataKey="totalAmount" fill="#10B981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* User Trend */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">每日新增用户趋势（近30天）</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#F59E0B" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportList