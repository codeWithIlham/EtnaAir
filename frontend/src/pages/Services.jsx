import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { serviceAPI } from '../services/api'
import ScrollReveal from '../components/ScrollReveal'

// ── Config catégories ──────────────────────────────────────
const CATEGORIES = [
  { id: 'all',           label: 'Tous',            icon: '✨', color: '#FF6B35' },
  { id: 'wellness',      label: 'Bien-être',        icon: '🛁', color: '#10b981' },
  { id: 'gastronomy',    label: 'Gastronomie',      icon: '👨‍🍳', color: '#f59e0b' },
  { id: 'adventure',     label: 'Aventure',         icon: '🏄', color: '#3b82f6' },
  { id: 'culture',       label: 'Culture',          icon: '🎭', color: '#8b5cf6' },
  { id: 'sport',         label: 'Sport',            icon: '⚽', color: '#06b6d4' },
  { id: 'entertainment', label: 'Divertissement',   icon: '🎮', color: '#ec4899' },
  { id: 'transport',     label: 'Transport',        icon: '🚗', color: '#64748b' },
  { id: 'nature',        label: 'Nature',           icon: '🌿', color: '#16a34a' },
]

const getCat = (id) => CATEGORIES.find(c => c.id === id) || CATEGORIES[0]

// ── Modal de réservation d'un service ──────────────────────
function BookingModal({ service, onClose, onBooked }) {
  const { isAuth } = useAuth()
  const [form, setForm] = useState({ date: '', persons: 1, notes: '' })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState(false)

  const total = parseFloat(service.price) * form.persons

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isAuth) { setError('Connectez-vous pour réserver ce service.'); return }
    setLoading(true); setError('')
    try {
      await serviceAPI.book(service.id, form)
      setSuccess(true)
      setTimeout(() => { onBooked(); onClose() }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la réservation.')
    } finally { setLoading(false) }
  }

  const cat = getCat(service.category)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="glass-card w-full max-w-md"
        style={{ border: '1px solid rgba(255,107,53,0.25)' }}>

        {/* Header */}
        <div className="relative h-40 overflow-hidden rounded-t-2xl">
          <img src={service.image_url || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'}
            alt={service.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <button onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.5)', color: 'white' }}>✕</button>
          <div className="absolute bottom-3 left-4">
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: cat.color + '33', color: cat.color, border: `1px solid ${cat.color}44` }}>
              {cat.icon} {cat.label}
            </span>
            <p className="text-white font-black text-lg leading-tight mt-1">{service.title}</p>
          </div>
        </div>

        <div className="p-5">
          {/* Infos rapides */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 glass p-2.5 rounded-xl text-center">
              <p className="text-lg font-black gradient-text">{parseFloat(service.price).toFixed(0)} €</p>
              <p className="text-xs" style={{ color: 'var(--txt-4)' }}>par personne</p>
            </div>
            {service.duration && (
              <div className="flex-1 glass p-2.5 rounded-xl text-center">
                <p className="text-lg font-black" style={{ color: 'var(--txt)' }}>⏱</p>
                <p className="text-xs" style={{ color: 'var(--txt-4)' }}>{service.duration}</p>
              </div>
            )}
            <div className="flex-1 glass p-2.5 rounded-xl text-center">
              <p className="text-lg font-black" style={{ color: '#FFC857' }}>
                {service.rating ? `${service.rating}★` : '—'}
              </p>
              <p className="text-xs" style={{ color: 'var(--txt-4)' }}>note</p>
            </div>
          </div>

          {success ? (
            <div className="text-center py-6">
              <div className="text-5xl mb-3">🎉</div>
              <p className="font-black text-lg" style={{ color: 'var(--txt)' }}>Réservation envoyée !</p>
              <p className="text-sm mt-1" style={{ color: 'var(--txt-3)' }}>Vous recevrez une confirmation sous 24h.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              {error && (
                <div className="px-3 py-2 rounded-xl text-sm"
                  style={{ background: 'rgba(239,68,68,0.10)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                  ⚠️ {error}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--txt-3)' }}>Date souhaitée</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--txt-3)' }}>
                  Nombre de personnes (max {service.max_persons})
                </label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setForm(f => ({ ...f, persons: Math.max(1, f.persons - 1) }))}
                    className="w-9 h-9 rounded-xl font-bold"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--txt)' }}>−</button>
                  <span className="flex-1 text-center font-black" style={{ color: 'var(--txt)' }}>{form.persons}</span>
                  <button type="button" onClick={() => setForm(f => ({ ...f, persons: Math.min(service.max_persons, f.persons + 1) }))}
                    className="w-9 h-9 rounded-xl font-bold"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--txt)' }}>+</button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--txt-3)' }}>Remarques (optionnel)</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="input-field resize-none" rows={2} placeholder="Allergie, préférence, message..." />
              </div>
              <div className="pt-2 flex items-center justify-between">
                <div>
                  <p className="text-xs" style={{ color: 'var(--txt-4)' }}>Total</p>
                  <p className="text-xl font-black gradient-text">{total.toFixed(0)} €</p>
                </div>
                <button type="submit" disabled={loading}
                  className="btn-primary btn-shimmer px-6 py-2.5 flex items-center gap-2 disabled:opacity-60">
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Réservation...</>
                    : '🎯 Réserver'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Carte service ──────────────────────────────────────────
function ServiceCard({ service, onBook }) {
  const cat = getCat(service.category)
  const [imgHover, setImgHover] = useState(false)

  return (
    <div className="glass-card overflow-hidden group hover:scale-[1.02] transition-all duration-300">
      {/* Image */}
      <div className="relative h-48 overflow-hidden cursor-pointer"
        onMouseEnter={() => setImgHover(true)}
        onMouseLeave={() => setImgHover(false)}
        onClick={() => onBook(service)}>
        <img src={service.image_url || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'}
          alt={service.title}
          className={`w-full h-full object-cover transition-transform duration-500 ${imgHover ? 'scale-110' : 'scale-100'}`}
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Badge catégorie */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
          style={{ background: cat.color + '22', color: cat.color, border: `1px solid ${cat.color}44`, backdropFilter: 'blur(8px)' }}>
          {cat.icon} {cat.label}
        </div>

        {/* Note */}
        {service.rating && (
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-bold"
            style={{ background: 'rgba(0,0,0,0.55)', color: '#FFC857', backdropFilter: 'blur(4px)' }}>
            ★ {parseFloat(service.rating).toFixed(1)}
          </div>
        )}

        {/* Overlay hover */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${imgHover ? 'opacity-100' : 'opacity-0'}`}
          style={{ background: 'rgba(0,0,0,0.3)' }}>
          <span className="text-white font-semibold text-sm px-4 py-2 rounded-full"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(4px)' }}>
            Réserver →
          </span>
        </div>

        <div className="absolute bottom-3 left-3 right-3">
          <p className="font-black text-sm leading-tight"
            style={{
              color: 'rgba(255,255,255,0.90)',
              textShadow: '0 1px 8px rgba(0,0,0,0.70)',
            }}>
            {service.title}
          </p>
          {service.provider && (
            <p className="text-xs mt-0.5"
              style={{ color: 'rgba(255,255,255,0.55)', textShadow: '0 1px 4px rgba(0,0,0,0.60)' }}>
              par {service.provider}
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4">
        <h3 className="font-bold text-sm mb-1 line-clamp-1" style={{ color: 'var(--txt)' }}>{service.title}</h3>
        <p className="text-xs line-clamp-2 mb-3" style={{ color: 'var(--txt-3)' }}>{service.description}</p>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {service.duration && (
            <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
              style={{ background: 'var(--surface-2)', color: 'var(--txt-3)' }}>
              ⏱ {service.duration}
            </span>
          )}
          <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
            style={{ background: 'var(--surface-2)', color: 'var(--txt-3)' }}>
            👥 max {service.max_persons}
          </span>
          {service.location && (
            <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
              style={{ background: 'var(--surface-2)', color: 'var(--txt-3)' }}>
              📍 {service.location}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-black gradient-text">{parseFloat(service.price).toFixed(0)} €</span>
            <span className="text-xs ml-1" style={{ color: 'var(--txt-4)' }}>/ personne</span>
          </div>
          <button onClick={() => onBook(service)}
            className="btn-primary text-sm py-2 px-4 btn-shimmer">
            🎯 Réserver
          </button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ══════════════════════════════════════════════════════════════
export default function Services() {
  const [services,  setServices]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [category,  setCategory]  = useState('all')
  const [search,    setSearch]    = useState('')
  const [booking,   setBooking]   = useState(null)  // service sélectionné
  const [booked,    setBooked]    = useState(0)

  useEffect(() => {
    serviceAPI.getAll()
      .then(r => setServices(r.data || []))
      .catch(() => setServices([]))
      .finally(() => setLoading(false))
  }, [booked])

  const filtered = useMemo(() => {
    return services.filter(s => {
      const matchCat = category === 'all' || s.category === category
      const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [services, category, search])

  return (
    <div className="pt-20 pb-16 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="label-hotel mb-2">Expériences exclusives</p>
          <h1 className="font-display text-4xl md:text-5xl font-black mb-4" style={{ color: 'var(--txt)' }}>
            Services & <span className="gradient-text">Activités</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--txt-3)' }}>
            Enrichissez votre séjour avec nos expériences soigneusement sélectionnées.
            Massage, chef privé, aventure, culture et bien plus.
          </p>
        </div>

        {/* Recherche */}
        <div className="flex items-center gap-3 max-w-xl mx-auto mb-8">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--txt-4)' }}
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une activité..."
              className="input-field pl-10 text-base" />
          </div>
          {search && (
            <button onClick={() => setSearch('')} className="btn-secondary py-2.5 px-4 text-sm">✕</button>
          )}
        </div>

        {/* Filtres catégories */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setCategory(cat.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold transition-all hover:scale-105"
              style={category === cat.id ? {
                background: `linear-gradient(135deg, ${cat.color}, ${cat.color}bb)`,
                color: '#fff',
                boxShadow: `0 4px 14px ${cat.color}44`,
              } : {
                background: 'var(--surface)',
                border: '1px solid var(--border-2)',
                color: 'var(--txt-2)',
              }}>
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              {cat.id !== 'all' && (
                <span className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{
                    background: category === cat.id ? 'rgba(255,255,255,0.25)' : 'var(--surface-2)',
                    color: category === cat.id ? '#fff' : 'var(--txt-4)',
                  }}>
                  {services.filter(s => s.category === cat.id).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Résultats */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <div key={i} className="glass-card h-72 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass p-16 text-center rounded-2xl">
            <div className="text-6xl mb-4">🔍</div>
            <p className="font-bold text-xl mb-2" style={{ color: 'var(--txt)' }}>Aucun service trouvé</p>
            <p className="text-sm mb-5" style={{ color: 'var(--txt-3)' }}>Essayez une autre catégorie ou recherche.</p>
            <button onClick={() => { setCategory('all'); setSearch('') }} className="btn-primary px-6 py-2.5">
              Voir tout
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm mb-5" style={{ color: 'var(--txt-3)' }}>
              <span className="font-bold" style={{ color: 'var(--primary-1)' }}>{filtered.length}</span> expérience{filtered.length !== 1 ? 's' : ''} disponible{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((s, i) => (
                <ScrollReveal key={s.id} variant="fadeUp" delay={i * 40}>
                  <ServiceCard service={s} onBook={setBooking} />
                </ScrollReveal>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal réservation */}
      {booking && (
        <BookingModal
          service={booking}
          onClose={() => setBooking(null)}
          onBooked={() => setBooked(b => b + 1)}
        />
      )}
    </div>
  )
}
