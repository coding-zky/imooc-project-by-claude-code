// Format date to YYYY-MM-DD
export const formatDate = (date) => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Format date with weekday
export const formatDateWithWeekday = (date) => {
  const d = new Date(date)
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekday = weekDays[d.getDay()]
  return `${formatDate(d)}（${weekday}）`
}

// Format currency
export const formatCurrency = (amount) => {
  return `¥ ${Number(amount).toFixed(2)}`
}

// Format currency without symbol
export const formatAmount = (amount) => {
  return Number(amount).toFixed(2)
}

// Get relative time string
export const getRelativeTime = (date) => {
  const now = new Date()
  const d = new Date(date)
  const diff = now - d
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  return formatDate(date)
}

// Get month string
export const getMonthString = (date) => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

// Group records by date
export const groupRecordsByDate = (records) => {
  const groups = {}
  records.forEach(record => {
    const dateKey = formatDate(record.date)
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(record)
  })
  return groups
}

// Calculate total amount
export const calculateTotal = (records) => {
  return records.reduce((sum, record) => sum + Number(record.amount), 0)
}

// Calculate category breakdown
export const calculateCategoryBreakdown = (records) => {
  const breakdown = {}
  records.forEach(record => {
    if (!breakdown[record.category]) {
      breakdown[record.category] = 0
    }
    breakdown[record.category] += Number(record.amount)
  })
  return breakdown
}