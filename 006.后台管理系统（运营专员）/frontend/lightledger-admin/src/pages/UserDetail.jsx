import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import { useToast } from '../context/ToastContext'
import { ArrowLeft } from 'lucide-react'

function UserDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUserDetail()
  }, [id])

  const loadUserDetail = async () => {
    try {
      console.log('Loading user detail, id:', id, typeof id)
      const data = await api.getUserDetail(id)
      console.log('User detail result:', data)
      setUser(data)
    } catch (error) {
      console.error('Load user detail error:', error)
      showToast('加载用户详情失败: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      await api.updateUserStatus(id, newStatus)
      showToast('状态更新成功', 'success')
      loadUserDetail()
    } catch (error) {
      showToast('更新状态失败', 'error')
    }
  }

  if (loading) {
    return <div className="p-6 text-center text-gray-500">加载中...</div>
  }

  if (!user) {
    return <div className="p-6 text-center text-gray-500">用户不存在</div>
  }

  return (
    <div className="p-6">
      <button onClick={() => navigate('/admin/users')} className="flex items-center text-gray-600 hover:text-gray-800 mb-4">
        <ArrowLeft size={20} className="mr-1" /> 返回列表
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">用户详情</h1>

      {/* User Info */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">基本信息</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">用户名</p>
            <p className="font-medium">{user.username}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">邮箱</p>
            <p className="font-medium">{user.email || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">手机号</p>
            <p className="font-medium">{user.phone || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">注册时间</p>
            <p className="font-medium">{user.createdAt?.slice(0, 19) || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">状态</p>
            <span className={`inline-block px-2 py-1 text-xs rounded-full ${user.status === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {user.status === 1 ? '正常' : '禁用'}
            </span>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={() => handleStatusChange(user.status === 1 ? 0 : 1)}
            className={`px-4 py-2 rounded-lg ${user.status === 1 ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-500 text-white hover:bg-green-600'}`}
          >
            {user.status === 1 ? '禁用用户' : '启用用户'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500">累计消费总额</p>
          <p className="text-2xl font-bold text-primary mt-2">¥{typeof user.totalAmount === 'number' ? user.totalAmount.toFixed(2) : parseFloat(user.totalAmount || 0).toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500">消费笔数</p>
          <p className="text-2xl font-bold text-green-500 mt-2">{user.recordCount || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500">日均消费</p>
          <p className="text-2xl font-bold text-orange-500 mt-2">¥{typeof user.dailyAverage === 'number' ? user.dailyAverage.toFixed(2) : parseFloat(user.dailyAverage || 0).toFixed(2)}</p>
        </div>
      </div>

      {/* Recent Records */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">最近消费记录</h2>
        {user.recentRecords && user.recentRecords.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">金额</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">日期</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">备注</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {user.recentRecords.map(record => (
                <tr key={record.id}>
                  <td className="px-4 py-2 text-sm font-medium text-gray-800">¥{typeof record.amount === 'number' ? record.amount.toFixed(2) : parseFloat(record.amount || 0).toFixed(2)}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{record.recordDate}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{record.note || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-center py-4">暂无消费记录</p>
        )}
      </div>
    </div>
  )
}

export default UserDetail