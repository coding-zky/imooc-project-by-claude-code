// Storage keys
const STORAGE_KEYS = {
  USERS: 'lightledger_users',
  SESSION: 'lightledger_session',
  RECORDS_PREFIX: 'lightledger_records_',
}

// Simple password hashing (NOT secure for production - just base64)
const hashPassword = (password) => {
  return btoa(password)
}

const verifyPassword = (password, hash) => {
  return btoa(password) === hash
}

// Storage utility
export const storage = {
  get(key) {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  },

  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  },

  remove(key) {
    localStorage.removeItem(key)
  },

  // Users management
  getUsers() {
    return this.get(STORAGE_KEYS.USERS) ?? []
  },

  createUser(username, password) {
    const users = this.getUsers()
    if (users.find(u => u.username === username)) {
      return { success: false, error: '用户名已存在' }
    }
    users.push({
      username,
      password: hashPassword(password),
      createdAt: Date.now()
    })
    this.set(STORAGE_KEYS.USERS, users)
    return { success: true }
  },

  verifyUser(username, password) {
    const users = this.getUsers()
    const user = users.find(u => u.username === username)
    if (!user) {
      return { success: false, error: '用户名不存在' }
    }
    if (!verifyPassword(password, user.password)) {
      return { success: false, error: '密码错误' }
    }
    return { success: true, user: { username: user.username } }
  },

  // Session management
  getSession() {
    return this.get(STORAGE_KEYS.SESSION)
  },

  setSession(username) {
    this.set(STORAGE_KEYS.SESSION, { username, loginAt: Date.now() })
  },

  clearSession() {
    this.remove(STORAGE_KEYS.SESSION)
  },

  // Records management
  getRecords(username) {
    if (!username) return []
    const data = this.get(STORAGE_KEYS.RECORDS_PREFIX + username)
    return data?.records ?? []
  },

  saveRecord(username, record) {
    const records = this.getRecords(username)
    const newRecord = {
      ...record,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    }
    records.unshift(newRecord)
    this.set(STORAGE_KEYS.RECORDS_PREFIX + username, { records })
    return newRecord
  },

  deleteRecord(username, recordId) {
    const records = this.getRecords(username)
    const filtered = records.filter(r => r.id !== recordId)
    this.set(STORAGE_KEYS.RECORDS_PREFIX + username, { records: filtered })
    return true
  },

  updateRecord(username, recordId, updates) {
    const records = this.getRecords(username)
    const index = records.findIndex(r => r.id === recordId)
    if (index !== -1) {
      records[index] = { ...records[index], ...updates }
      this.set(STORAGE_KEYS.RECORDS_PREFIX + username, { records })
    }
    return records[index]
  }
}

// Expense categories
export const CATEGORIES = [
  { id: 'dining', name: '餐饮', emoji: '🍜', icon: 'restaurant' },
  { id: 'transport', name: '交通', emoji: '🚗', icon: 'directions_car' },
  { id: 'shopping', name: '购物', emoji: '🛒', icon: 'shopping_bag' },
  { id: 'entertainment', name: '娱乐', emoji: '🎮', icon: 'sports_esports' },
  { id: 'housing', name: '居住', emoji: '🏠', icon: 'home' },
  { id: 'medical', name: '医疗', emoji: '💊', icon: 'medical_services' },
  { id: 'education', name: '教育', emoji: '📚', icon: 'school' },
  { id: 'communication', name: '通讯', emoji: '📱', icon: 'phone' },
  { id: 'social', name: '社交', emoji: '🎁', icon: 'card_giftcard' },
  { id: 'others', name: '其他', emoji: '📌', icon: 'more_horiz' },
]

export const getCategoryById = (id) => {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1]
}

export const getCategoryIcon = (id) => {
  const category = getCategoryById(id)
  return category?.icon || 'more_horiz'
}