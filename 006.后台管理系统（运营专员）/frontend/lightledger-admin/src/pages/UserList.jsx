import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'
import { useToast } from '../context/ToastContext'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

function UserList() {
  const { showToast } = useToast()
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [page, keyword])

  const loadUsers = async () => {
    setLoading(true)
    try {
      console.log('Loading users with params:', { page, pageSize, keyword })
      const data = await api.getUserList({
        page,
        pageSize,
        keyword: keyword || undefined
      })
      console.log('Users result:', data)
      console.log('Records:', data?.records)
      console.log('Total:', data?.total)
      if (data && data.records) {
        setUsers(data.records)
        setTotal(parseInt(data.total) || 0)
      } else {
        setUsers([])
        setTotal(0)
      }
    } catch (error) {
      console.error('Load users error:', error)
      showToast('加载用户列表失败: ' + error.message, 'error')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    loadUsers()
  }

  const handleStatusChange = async (userId, currentStatus) => {
    const newStatus = currentStatus === 1 ? 0 : 1
    try {
      await api.updateUserStatus(userId, newStatus)
      showToast('状态更新成功', 'success')
      loadUsers()
    } catch (error) {
      showToast('更新状态失败', 'error')
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">用户管理</h1>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索用户名..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
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
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">用户名</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">邮箱</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">注册时间</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">消费总额</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">消费笔数</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">状态</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-gray-500">加载中...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-gray-500">暂无数据</td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">{user.id}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{user.username}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.email || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.createdAt?.slice(0, 10) || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">¥{typeof user.totalAmount === 'number' ? user.totalAmount.toFixed(2) : parseFloat(user.totalAmount || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.recordCount || 0}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${user.status === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {user.status === 1 ? '正常' : '禁用'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/admin/users/${user.id}`} className="text-primary hover:underline mr-3">详情</Link>
                    <button
                      onClick={() => handleStatusChange(user.id, user.status)}
                      className="text-primary hover:underline"
                    >
                      {user.status === 1 ? '禁用' : '启用'}
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
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserList