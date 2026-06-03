import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { notificationAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

// Icône selon le titre/contenu de la notification
function notifIcon(title = '', content = '') {
  const t = (title + content).toLowerCase()
  if (t.includes('réserv') || t.includes('booking'))   return '📅'
  if (t.includes('confirm'))                            return '✅'
  if (t.includes('annul') || t.includes('cancel'))     return '❌'
  if (t.includes('avis') || t.includes('review'))      return '⭐'
  if (t.includes('message'))                            return '💬'
  if (t.includes('bienvenue') || t.includes('welcome'))return '🎉'
  if (t.includes('paiement') || t.includes('payment')) return '💶'
  return '🔔'
}

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'À l\'instant'
  if (m < 60) return `Il y a ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `Il y a ${h}h`
  const d = Math.floor(h / 24)
  if (d < 7)  return `Il y a ${d} jour${d > 1 ? 's' : ''}`
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function Notifications() {
  const { user } = useAuth()
  const [notifs,   setNotifs]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('all') // 'all' | 'unread' | 'read'

  useEffect(() => {
    notificationAPI.getAll()
      .then(r => setNotifs(r.data?.data || r.data || []))
      .catch(() => setNotifs([]))
      .finally(() => setLoading(false))
  }, [])

  const handleRead = async (id) => {
    try {
      await notificationAPI.markRead(id)
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch {}
  }

  const handleReadAll = async () => {
    try {
      await notificationAPI.markAllRead()
      setNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch {}
  }

  const displayed = notifs.filter(n => {
    if (filter === 'unread') return !n.is_read
    if (filter === 'read')   return n.is_read
    return true
  })

  const unreadCount = notifs.filter(n => !n.is_read).length

  return (
    <div className="pt-20 pb-16 px-4 min-h-screen">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black" style={{ color: 'var(--txt)' }}>
              🔔 Mes <span className="gradient-text">notifications</span>
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--txt-3)' }}>
              {loading ? '…' : `${notifs.length} notification${notifs.length !== 1 ? 's' : ''}`}
              {unreadCount > 0 && <span className="ml-2 font-bold" style={{ color: 'var(--primary-1)' }}>· {unreadCount} non lue{unreadCount > 1 ? 's' : ''}</span>}
            </p>
          </div>
          {unreadCount > 0 && (
            <button onClick={handleReadAll}
              className="btn-secondary text-sm py-2 px-4 flex items-center gap-2">
              ✓ Tout marquer comme lu
            </button>
          )}
        </div>

        {/* Filtres */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'all',    label: 'Toutes',      count: notifs.length },
            { id: 'unread', label: 'Non lues',    count: unreadCount },
            { id: 'read',   label: 'Déjà lues',   count: notifs.length - unreadCount },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold transition-all"
              style={filter === f.id ? {
                background: 'linear-gradient(135deg, var(--primary-1), var(--primary-2))',
                color: '#fff',
                boxShadow: '0 4px 14px rgba(255,107,53,0.30)',
              } : {
                background: 'var(--surface)',
                border: '1px solid var(--border-2)',
                color: 'var(--txt-3)',
              }}>
              {f.label}
              {f.count > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                  style={{
                    background: filter === f.id ? 'rgba(255,255,255,0.25)' : 'var(--surface-2)',
                    color: filter === f.id ? '#fff' : 'var(--txt-4)',
                  }}>
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Liste */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="glass-card h-20 animate-pulse" />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="glass p-16 text-center rounded-2xl">
            <div className="text-6xl mb-4">🔔</div>
            <p className="font-bold text-lg mb-2" style={{ color: 'var(--txt)' }}>
              {filter === 'unread' ? 'Tout est à jour !' : 'Aucune notification'}
            </p>
            <p className="text-sm" style={{ color: 'var(--txt-3)' }}>
              {filter === 'unread'
                ? 'Vous n\'avez aucune notification non lue.'
                : 'Vos notifications apparaîtront ici.'}
            </p>
            {filter !== 'all' && (
              <button onClick={() => setFilter('all')} className="btn-primary mt-5 px-5 py-2 text-sm">
                Voir toutes les notifications
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {displayed.map(n => (
              <div key={n.id}
                className="glass-card p-4 flex items-start gap-4 transition-all hover:scale-[1.01] cursor-pointer group"
                style={!n.is_read ? { borderLeft: '3px solid var(--primary-1)' } : {}}
                onClick={() => !n.is_read && handleRead(n.id)}>

                {/* Icône */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{
                    background: n.is_read ? 'var(--surface-2)' : 'rgba(255,107,53,0.12)',
                    border: n.is_read ? '1px solid var(--border)' : '1px solid rgba(255,107,53,0.25)',
                  }}>
                  {notifIcon(n.title, n.content)}
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  {n.title && (
                    <p className="font-bold text-sm leading-snug" style={{ color: 'var(--txt)' }}>
                      {n.title}
                    </p>
                  )}
                  {n.content && (
                    <p className="text-sm mt-0.5 line-clamp-2" style={{ color: 'var(--txt-3)' }}>
                      {n.content}
                    </p>
                  )}
                  <p className="text-xs mt-1.5" style={{ color: 'var(--txt-4)' }}>
                    {timeAgo(n.created_at)}
                  </p>
                </div>

                {/* Badge non lu */}
                <div className="shrink-0 flex items-center gap-2">
                  {!n.is_read && (
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--primary-1)' }} />
                  )}
                  {n.is_read && (
                    <span className="text-xs" style={{ color: 'var(--txt-4)' }}>Lu</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lien retour */}
        <div className="flex justify-center mt-8">
          <Link to="/" className="btn-ghost-gold text-sm">← Retour à l'accueil</Link>
        </div>
      </div>
    </div>
  )
}
