import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { bookingAPI, getPropertyImage } from '../services/api'
import { useAuth } from '../context/AuthContext'

const STATUS_STYLE = {
  pending:   { cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30',     label: '⏳ En attente', bar: '#f59e0b' },
  confirmed: { cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', label: '✅ Confirmée', bar: '#10b981' },
  completed: { cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30',         label: '🏁 Terminée',  bar: '#3b82f6' },
  cancelled: { cls: 'bg-rose-500/20 text-rose-400 border-rose-500/30',         label: '❌ Annulée',   bar: '#f43f5e' },
}

const TABS = ['Toutes', 'En attente', 'Confirmées', 'Terminées', 'Annulées']
const TAB_STATUS = { 'En attente': 'pending', 'Confirmées': 'confirmed', 'Terminées': 'completed', 'Annulées': 'cancelled' }

export default function Bookings() {
  const { user } = useAuth()
  const [bookings, setBookings]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [cancelling, setCancelling] = useState(null)
  const [activeTab, setActiveTab]   = useState('Toutes')

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await bookingAPI.getAll()
      setBookings(data)
    } catch {
      setError('Impossible de charger vos réservations.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCancel = async (id) => {
    if (!confirm('Annuler cette réservation ?')) return
    setCancelling(id)
    try {
      await bookingAPI.delete(id)
      await load()
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'annulation.")
    } finally {
      setCancelling(null)
    }
  }

  const fmt = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  const fmtShort = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

  const filtered = activeTab === 'Toutes'
    ? bookings
    : bookings.filter(b => b.booking_status === TAB_STATUS[activeTab])

  const counts = {
    'Toutes': bookings.length,
    'En attente': bookings.filter(b => b.booking_status === 'pending').length,
    'Confirmées': bookings.filter(b => b.booking_status === 'confirmed').length,
    'Terminées':  bookings.filter(b => b.booking_status === 'completed').length,
    'Annulées':   bookings.filter(b => b.booking_status === 'cancelled').length,
  }

  return (
    <div className="pt-20 pb-16 px-4 min-h-screen">
      <div className="max-w-4xl mx-auto">

        {/* ── Header ── */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--txt)' }}>
              Mes <span className="gradient-text">réservations</span>
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--txt-3)' }}>
              Bonjour {user?.first_name} · {bookings.length} réservation{bookings.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link to="/search" className="btn-primary text-sm py-2.5 px-5 shrink-0">
            + Nouvelle
          </Link>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 overflow-x-auto pb-1 mb-6" style={{ scrollbarWidth: 'none' }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap"
              style={activeTab === tab
                ? { background: 'linear-gradient(135deg, var(--primary-1), var(--primary-2))', color: '#0d0a04', boxShadow: '0 4px 14px var(--gold-glow)' }
                : { background: 'var(--surface)', color: 'var(--txt-3)', border: '1px solid var(--border)' }}>
              {tab}
              {counts[tab] > 0 && (
                <span className="ml-1.5 text-xs opacity-70">({counts[tab]})</span>
              )}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm px-4 py-3 rounded-xl mb-6">
            ⚠️ {error}
          </div>
        )}

        {/* ── Contenu ── */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl shrink-0" style={{ background: 'var(--surface-2)' }} />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 rounded w-3/4" style={{ background: 'var(--surface-2)' }} />
                    <div className="h-3 rounded w-1/2" style={{ background: 'var(--surface-2)' }} />
                    <div className="h-3 rounded w-1/3" style={{ background: 'var(--surface-2)' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass p-12 sm:p-16 text-center rounded-2xl" style={{ border: '1px solid var(--border-2)' }}>
            <div className="text-5xl mb-4">🏖️</div>
            <p className="font-bold text-lg mb-2" style={{ color: 'var(--txt)' }}>
              {activeTab === 'Toutes' ? 'Aucune réservation' : `Aucune réservation "${activeTab}"`}
            </p>
            <p className="text-sm mb-6" style={{ color: 'var(--txt-3)' }}>Découvrez nos logements disponibles</p>
            <Link to="/search" className="btn-primary inline-flex px-6 py-3">Explorer →</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(b => {
              const style = STATUS_STYLE[b.booking_status] || STATUS_STYLE.pending
              const nights  = Math.max(1, Math.ceil((new Date(b.end_date) - new Date(b.start_date)) / 86400000))
              const isPast  = new Date(b.end_date) < new Date()
              const canCancel = (b.booking_status === 'pending' || b.booking_status === 'confirmed') && !isPast
              const canReview = b.booking_status === 'completed' || isPast
              const img = b.property?.images?.[0]?.image_url || getPropertyImage(b.property)

              return (
                <div key={b.id} className="glass-card overflow-hidden">
                  {/* Barre colorée top */}
                  <div className="h-0.5 w-full" style={{ background: style.bar }} />

                  <div className="p-4 sm:p-5">
                    <div className="flex gap-3 sm:gap-4">
                      {/* Image */}
                      {img && (
                        <Link to={`/annonces/${b.property_id}`} className="shrink-0">
                          <img src={img} alt={b.property?.title || ''}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover hover:opacity-80 transition-opacity"
                            onError={e => { e.target.style.display = 'none' }} />
                        </Link>
                      )}

                      <div className="flex-1 min-w-0">
                        {/* Titre + statut + prix */}
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="text-xs font-mono opacity-30" style={{ color: 'var(--txt-3)' }}>#{b.id}</span>
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${style.cls}`}>
                                {style.label}
                              </span>
                            </div>
                            <h3 className="font-bold text-sm sm:text-base leading-snug">
                              <Link to={`/annonces/${b.property_id}`}
                                className="transition-colors hover:underline"
                                style={{ color: 'var(--txt)' }}
                                onMouseOver={e => e.currentTarget.style.color = 'var(--primary-1)'}
                                onMouseOut={e => e.currentTarget.style.color = 'var(--txt)'}>
                                {b.property?.title || `Logement #${b.property_id}`}
                              </Link>
                            </h3>
                            {b.property?.city && (
                              <p className="text-xs mt-0.5" style={{ color: 'var(--txt-4)' }}>📍 {b.property.city}</p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-lg sm:text-xl font-black gradient-text">
                              {parseFloat(b.total_price).toFixed(0)} €
                            </div>
                            <div className="text-xs" style={{ color: 'var(--txt-4)' }}>
                              {nights} nuit{nights > 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm mb-3">
                          <div>
                            <span className="block text-xs mb-0.5" style={{ color: 'var(--txt-4)' }}>Arrivée</span>
                            <span className="font-semibold" style={{ color: 'var(--txt-2)' }}>
                              <span className="hidden sm:inline">{fmt(b.start_date)}</span>
                              <span className="sm:hidden">{fmtShort(b.start_date)}</span>
                            </span>
                          </div>
                          <span style={{ color: 'var(--txt-4)' }}>→</span>
                          <div>
                            <span className="block text-xs mb-0.5" style={{ color: 'var(--txt-4)' }}>Départ</span>
                            <span className="font-semibold" style={{ color: 'var(--txt-2)' }}>
                              <span className="hidden sm:inline">{fmt(b.end_date)}</span>
                              <span className="sm:hidden">{fmtShort(b.end_date)}</span>
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-3 flex flex-wrap items-center gap-3"
                          style={{ borderTop: '1px solid var(--border)' }}>
                          {canCancel && (
                            <button onClick={() => handleCancel(b.id)} disabled={cancelling === b.id}
                              className="text-xs sm:text-sm font-medium transition-colors disabled:opacity-50"
                              style={{ color: '#f87171' }}>
                              {cancelling === b.id ? 'Annulation...' : '✕ Annuler'}
                            </button>
                          )}
                          {canReview && (
                            <Link to={`/annonces/${b.property_id}#reviews`}
                              className="text-xs sm:text-sm font-medium"
                              style={{ color: '#f59e0b' }}>
                              ⭐ Laisser un avis
                            </Link>
                          )}
                          <Link to={`/annonces/${b.property_id}`}
                            className="text-xs sm:text-sm font-semibold ml-auto transition-colors"
                            style={{ color: 'var(--primary-1)' }}>
                            Voir →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

