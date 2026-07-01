const API_BASE_URL = 'http://localhost:8081'

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL
  }

  getToken() {
    return localStorage.getItem('lightledger_admin_token')
  }

  setToken(token) {
    localStorage.setItem('lightledger_admin_token', token)
  }

  removeToken() {
    localStorage.removeItem('lightledger_admin_token')
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const token = this.getToken()

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body)
    }

    try {
      const response = await fetch(url, config)
      const result = await response.json()

      if (!response.ok || result.code !== 200) {
        throw new Error(result.message || '请求失败')
      }

      return result
    } catch (error) {
      throw error
    }
  }

  // Auth APIs
  async login(username, password) {
    const result = await this.request('/api/admin/auth/login', {
      method: 'POST',
      body: { username, password },
    })
    const data = result.data
    if (data && data.token) {
      this.setToken(data.token)
    }
    return { user: data }
  }

  // Dashboard APIs
  async getDashboardStats() {
    const result = await this.request('/api/admin/dashboard')
    return result.data
  }

  async getDashboardTrend(days = 7) {
    const result = await this.request(`/api/admin/dashboard/trend?days=${days}`)
    return result.data
  }

  async getCategoryDistribution() {
    const result = await this.request('/api/admin/dashboard/category-distribution')
    return result.data
  }

  // User APIs
  async getUserList(params = {}) {
    // Filter out undefined values and convert to strings
    const cleanParams = {}
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        cleanParams[key] = String(value)
      }
    }
    const query = new URLSearchParams(cleanParams).toString()
    const result = await this.request(`/api/admin/users${query ? `?${query}` : ''}`)
    return result.data
  }

  async getUserDetail(id) {
    const result = await this.request(`/api/admin/users/${id}`)
    return result.data
  }

  async updateUserStatus(id, status) {
    return this.request(`/api/admin/users/${id}/status?status=${status}`, {
      method: 'PUT',
    })
  }

  // Record APIs
  async getRecordList(params = {}) {
    const query = new URLSearchParams(params).toString()
    const result = await this.request(`/api/admin/records${query ? `?${query}` : ''}`)
    return result.data
  }

  async getRecordDetail(id) {
    const result = await this.request(`/api/admin/records/${id}`)
    return result.data
  }

  async deleteRecord(id) {
    return this.request(`/api/admin/records/${id}`, {
      method: 'DELETE',
    })
  }

  // Category APIs
  async getCategoryList() {
    const result = await this.request('/api/admin/categories')
    return result.data
  }

  async updateCategoryStatus(id, status) {
    return this.request(`/api/admin/categories/${id}/status?status=${status}`, {
      method: 'PUT',
    })
  }

  // Report APIs
  async getExpenseTrend(days = 7) {
    const result = await this.request(`/api/admin/reports/trend?days=${days}`)
    return result.data
  }

  async getUserRanking(limit = 20) {
    const result = await this.request(`/api/admin/reports/user-ranking?limit=${limit}`)
    return result.data
  }

  async getCategoryRanking() {
    const result = await this.request('/api/admin/reports/category-ranking')
    return result.data
  }

  async getUserTrend(days = 30) {
    const result = await this.request(`/api/admin/reports/user-trend?days=${days}`)
    return result.data
  }

  async exportReport(days = 7) {
    const token = this.getToken()
    const response = await fetch(`${this.baseUrl}/api/admin/reports/export?days=${days}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('导出失败')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `轻账本后台管理报表_${days}天_${new Date().toISOString().split('T')[0]}.xlsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }
}

export const api = new ApiService()