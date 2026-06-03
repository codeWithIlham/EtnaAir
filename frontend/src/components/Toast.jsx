import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const ToastContext = createContext(null)

const ICONS = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }
const COLORS = {
  success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  error:   'border-rose-500/40 bg-rose-500/10 text-rose-300',
  info:    'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
  warning: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
}

function ToastItem({ toast, onRemove }) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      setLeaving(true)
      setTimeout(() => onRemove(toast.id), 300)
    }, toast.duration || 4000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl max-w-sm pointer-events-auto transition-all duration-300 ${COLORS[toast.type || 'info']} ${leaving ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'}`}
      style={{ animation: leaving ? undefined : 'slideInRight 0.3s ease' }}
    >
      <span className="text-lg shrink-0 mt-0.5">{ICONS[toast.type || 'info']}</span>
      <div className="flex-1 min-w-0">
        {toast.title && <p className="font-bold text-sm">{toast.title}</p>}
        <p className="text-sm opacity-90">{toast.message}</p>
      </div>
      <button
        onClick={() => { setLeaving(true); setTimeout(() => onRemove(toast.id), 300) }}
        className="text-white/40 hover:text-white/80 transition-colors text-lg leading-none shrink-0"
      >×</button>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const show = useCallback((message, type = 'info', title = '', duration = 4000) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type, title, duration }])
    return id
  }, [])

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = {
    success: (msg, title) => show(msg, 'success', title),
    error:   (msg, title) => show(msg, 'error',   title),
    info:    (msg, title) => show(msg, 'info',     title),
    warning: (msg, title) => show(msg, 'warning',  title),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onRemove={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
