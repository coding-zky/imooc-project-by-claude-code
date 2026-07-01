import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { useToast } from '../context/ToastContext'

function CategoryList() {
  const { showToast } = useToast()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const data = await api.getCategoryList()
      setCategories(data || [])
    } catch (error) {
      showToast('加载分类列表失败', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (categoryId, currentStatus) => {
    const newStatus = currentStatus === 1 ? 0 : 1
    try {
      await api.updateCategoryStatus(categoryId, newStatus)
      showToast('状态更新成功', 'success')
      loadCategories()
    } catch (error) {
      showToast('更新状态失败', 'error')
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">分类管理</h1>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">图标</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">名称</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">颜色</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">排序</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">类型</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">状态</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-gray-500">加载中...</td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-gray-500">暂无数据</td>
              </tr>
            ) : (
              categories.map(category => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">{category.id}</td>
                  <td className="px-4 py-3 text-2xl">{category.icon}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{category.name}</td>
                  <td className="px-4 py-3">
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: category.color }}></div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{category.sortOrder}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{category.type === 'system' ? '系统' : '自定义'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${category.status === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {category.status === 1 ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleStatusChange(category.id, category.status)}
                      className="text-primary hover:underline"
                    >
                      {category.status === 1 ? '禁用' : '启用'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CategoryList