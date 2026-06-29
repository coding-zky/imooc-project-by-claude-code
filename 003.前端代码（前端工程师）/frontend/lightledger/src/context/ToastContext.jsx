import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    setToast({ message, type, id: Date.now() })
    setTimeout(() => {
      setToast(null)
    }, duration)
  }, [])

  const hideToast = useCallback(() => {
    setToast(null)
  }, [])

  return (
    <ToastContext.Provider value={{ toast, showToast, hideToast }}>
      {children}
      {toast && <Toast toast={toast} onClose={hideToast} />}
    </ToastContext.Provider>
  )
}

// Toast Component
const Toast = ({ toast, onClose }) => {
  const isSuccess = toast.type === 'success'

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100]">
      <div
        className={`
          px-6 py-3 rounded-full shadow-2xl flex items-center gap-3
          ${isSuccess ? 'bg-on-surface text-surface' : 'bg-error text-white'}
          toast-enter
        `}
      >
        <span className="material-symbols-outlined">
          {isSuccess ? 'check_circle' : 'error'}
        </span>
        <span className="font-medium">{toast.message}</span>
        {!isSuccess && (
          <button onClick={onClose} className="ml-2 hover:opacity-70">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        )}
      </div>
    </div>
  )
}