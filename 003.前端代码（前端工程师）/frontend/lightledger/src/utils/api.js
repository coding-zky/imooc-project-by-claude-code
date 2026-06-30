// Java 后端端口
const API_BASE_URL = 'http://localhost:8080'

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL
  }

  getToken() {
    return localStorage.getItem('lightledger_token')
  }

  setToken(token) {
    localStorage.setItem('lightledger_token', token)
  }

  removeToken() {
    localStorage.removeItem('lightledger_token')
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

      // Java 后端返回格式：{ code, message, data }
      // 抛出后端返回的错误信息
      if (!response.ok || result.code !== 200) {
        throw new Error(result.message || result.response?.message || '请求失败')
      }

      // 返回 data 字段内容
      return result
    } catch (error) {
      throw error
    }
  }

  // Auth APIs
  async register(username, password, email = null) {
    const result = await this.request('/api/auth/register', {
      method: 'POST',
      body: { username, password, email },
    })
    // Java 后端返回 { code, message, data: { token, userId, username } }
    const data = result.data
    if (data && data.token) {
      this.setToken(data.token)
    }
    // 返回带 user 属性的对象，兼容前端
    return { user: data }
  }

  async login(username, password) {
    const result = await this.request('/api/auth/login', {
      method: 'POST',
      body: { username, password },
    })
    const data = result.data
    if (data && data.token) {
      this.setToken(data.token)
    }
    // 返回带 user 属性的对象，兼容前端
    return { user: data }
  }

  // User APIs
  async getProfile() {
    const result = await this.request('/api/users/profile')
    return result.data
  }

  async updateProfile(data) {
    return this.request('/api/users/profile', {
      method: 'PUT',
      body: data,
    })
  }

  async changePassword(oldPassword, newPassword) {
    return this.request('/api/users/password', {
      method: 'PUT',
      body: { oldPassword, newPassword },
    })
  }

  async bindPhone(phone, code) {
    return this.request('/api/users/phone', {
      method: 'POST',
      body: { phone, code },
    })
  }

  async getPreferences() {
    const result = await this.request('/api/users/preferences')
    return result.data
  }

  async updatePreferences(data) {
    return this.request('/api/users/preferences', {
      method: 'PUT',
      body: data,
    })
  }

  // Categories API
  async getCategories() {
    const result = await this.request('/api/categories')
    return result.data || []
  }

  // Records APIs
  async getRecords(params = {}) {
    const query = new URLSearchParams(params).toString()
    const result = await this.request(`/api/records${query ? `?${query}` : ''}`)
    return result.data
  }

  async createRecord(data) {
    return this.request('/api/records', {
      method: 'POST',
      body: data,
    })
  }

  async updateRecord(id, data) {
    return this.request(`/api/records/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  async deleteRecord(id) {
    return this.request(`/api/records/${id}`, {
      method: 'DELETE',
    })
  }

  // Stats APIs
  async getStats(days = 7) {
    const result = await this.request(`/api/stats?days=${days}`)
    return result.data
  }

  async exportExcel(days = 7) {
    const token = this.getToken()
    const response = await fetch(`${this.baseUrl}/api/stats/export?days=${days}`, {
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
    a.download = `轻账本统计报表_${days}天_${new Date().toISOString().split('T')[0]}.xlsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }
}

export const api = new ApiService()
