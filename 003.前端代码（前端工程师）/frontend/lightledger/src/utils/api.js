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
}

export const api = new ApiService()
