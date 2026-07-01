import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { useToast } from '../context/ToastContext'
import { Search, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'

function RecordList() {
  const { showToast } = useToast()
  const [records, setRecords] = useState([])
  const [categories, setCategories] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [keyword, setKeyword] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [month, setMonth] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    loadRecords()
  }, [page, categoryId, month])

  const loadCategories = async () => {
    try {
      const data = await api.getCategoryList()
      setCategories(data || [])
    } catch (error) {
      console.error('加载分类失败:', error)
    }
  }

  const loadRecords = async () => {
    setLoading(true)
    try {
      const params = { page, pageSize }
      if (keyword) params.keyword = keyword
      if (categoryId) params.categoryId = categoryId
      if (month) params.month = month

      const result = await api.getRecordList(params)
      setRecords(result.records || [])
      setTotal(result.total || 0)
    } catch (error) {
      showToast('加载消费记录失败', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    loadRecords()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await api.deleteRecord(deleteId)
      showToast('删除成功', 'success')
      setShowDeleteModal(false)
      setDeleteId(null)
      loadRecords()
    } catch (error) {
      showToast('删除失败', 'error')
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">消费记录管理</h1>

      {/* Filters */}
      <form onSubmit={handleSearch} className="mb-6 flex flex-wrap gap-4">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="搜索用户名..."
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={categoryId}
          onChange={(e) => { setCategoryId(e.target.value); setPage(1); loadRecords(); }}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">全部分类</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <input
          type="month"
          value={month}
          onChange={(e) => { setMonth(e.target.value); setPage(1); loadRecords(); }}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover">
          搜索
        </button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">用户</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">分类</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">金额</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">日期</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">备注</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">状态</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-gray-500">加载中...</td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-gray-500">暂无数据</td>
              </tr>
            ) : (
              records.map(record => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">{record.id}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{record.username}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{record.categoryName}</td>
                  <td className="px-4 py-3 text-sm font-medium text-orange-500">¥{typeof record.amount === 'number' ? record.amount.toFixed(2) : parseFloat(record.amount || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{record.recordDate}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{record.note || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${record.status === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {record.status === 1 ? '正常' : '已删除'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => { setDeleteId(record.id); setShowDeleteModal(true); }}
                      className="text-red-500 hover:underline"
                      disabled={record.status === 0}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">共 {total} 条记录，第 {page}/{totalPages} 页</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">确认删除</h3>
            <p className="text-gray-600 mb-6">确定要删除这条消费记录吗？此操作不可撤销。</p>
            <div className="flex gap-4 justify-end">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">取消</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RecordList