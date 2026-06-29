const API_BASE_URL = 'http://localhost:3001'

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
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.response?.message || '请求失败')
      }

      return data
    } catch (error) {
      throw error
    }
  }

  // Auth APIs
  async register(username, password, email = null) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: { username, password, email },
    })
    if (data.token) {
      this.setToken(data.token)
    }
    return data
  }

  async login(username, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: { username, password },
    })
    if (data.token) {
      this.setToken(data.token)
    }
    return data
  }

  // User APIs
  async getProfile() {
    return this.request('/users/profile')
  }

  async updateProfile(data) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: data,
    })
  }

  async changePassword(oldPassword, newPassword) {
    return this.request('/users/password', {
      method: 'PUT',
      body: { oldPassword, newPassword },
    })
  }

  async bindPhone(phone, code) {
    return this.request('/users/phone', {
      method: 'PUT',
      body: { phone, code },
    })
  }

  async getPreferences() {
    return this.request('/users/preferences')
  }

  async updatePreferences(data) {
    return this.request('/users/preferences', {
      method: 'PUT',
      body: data,
    })
  }

  // Categories API
  async getCategories() {
    return this.request('/categories')
  }

  // Records APIs
  async getRecords(params = {}) {
    const query = new URLSearchParams(params).toString()
    return this.request(`/records${query ? `?${query}` : ''}`)
  }

  async createRecord(data) {
    return this.request('/records', {
      method: 'POST',
      body: data,
    })
  }

  async updateRecord(id, data) {
    return this.request(`/records/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  async deleteRecord(id) {
    return this.request(`/records/${id}`, {
      method: 'DELETE',
    })
  }

  // Stats APIs
  async getStats(days = 7) {
    return this.request(`/stats?days=${days}`)
  }

  async exportExcel(days = 7) {
    const token = this.getToken()
    const response = await fetch(`${this.baseUrl}/stats/export?days=${days}`, {
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