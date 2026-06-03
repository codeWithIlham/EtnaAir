import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAutoRefresh } from '../hooks/useAutoRefresh'
import { Link, useNavigate } from 'react-router-dom'
import { propertyAPI, bookingAPI, userAPI, reviewAPI, getPropertyImage } from '../services/api'
import API from '../services/api'
import RevenueChart from '../components/RevenueChart'
import { useAuth } from '../context/AuthContext'

// ── Navigation ──────────────────────────────────────────────
const TABS = [
  { id: 'overview',    icon: '📊', label: 'Tableau de bord' },
  { id: 'properties',  icon: '🏠', label: 'Logements' },
  { id: 'bookings',    icon: '📅', label: 'Réservations' },
  { id: 'users',       icon: '👥', label: 'Utilisateurs' },
  { id: 'payments',    icon: '💳', label: 'Paiements' },
  { id: 'reviews',     icon: '⭐', label: 'Avis' },
  { id: 'stats',       icon: '📈', label: 'Statistiques' },
  { id: 'audit',       icon: '📋', label: 'Journal d\'audit' },
  { id: 'settings',    icon: '⚙️', label: 'Paramètres' },
]

const STATUS_BADGE = {
  pending:   { cls: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',     label: '⏳ En attente' },
  confirmed: { cls: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30', label: '✅ Confirmée' },
  completed: { cls: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',         label: '🏁 Terminée' },
  cancelled: { cls: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',         label: '❌ Annulée' },
  refunded:  { cls: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',   label: '💸 Remboursée' },
}

const STATUS_NEXT = {
  pending:   ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled', 'refunded'],
  completed: ['refunded'],
  cancelled: ['refunded'],
  refunded:  [],
}

const STATUS_LABELS = {
  confirmed: '✅ Confirmer',
  completed: '🏁 Terminer',
  cancelled: '❌ Annuler',
  refunded:  '💸 Rembourser',
}

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
const fmtShort = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '—'

// ── Utilitaires UI ─────────────────────────────────────────
function Spinner() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
        style={{ borderColor: 'var(--border-2)', borderTopColor: 'var(--primary-1)' }} />
    </div>
  )
}

function ConfirmModal({ msg, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
      <div className="glass-card p-8 max-w-md w-full text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <p className="font-bold text-lg mb-2" style={{ color: 'var(--txt)' }}>Confirmation requise</p>
        <p className="text-sm mb-6" style={{ color: 'var(--txt-2)' }}>{msg}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onConfirm} className="btn-primary px-6 py-2"
            style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}>Confirmer</button>
          <button onClick={onCancel} className="btn-secondary px-6 py-2">Annuler</button>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, sub, color, onClick }) {
  return (
    <div className="glass-card p-5 cursor-pointer hover:scale-105 transition-all"
      onClick={onClick} style={{ borderLeft: `3px solid ${color}` }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="font-black text-2xl" style={{ color }}>{value}</span>
      </div>
      <p className="font-semibold text-sm" style={{ color: 'var(--txt)' }}>{label}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--txt-4)' }}>{sub}</p>}
    </div>
  )
}

// ── Modal édition logement ─────────────────────────────────
function EditPropertyModal({ property, onSave, onClose }) {
  const [form, setForm] = useState({
    title:           property.title || '',
    description:     property.description || '',
    price_per_night: property.price_per_night || '',
    max_guests:      property.max_guests || '',
    bedrooms:        property.bedrooms || '1',
    bathrooms:       property.bathrooms || '1',
    property_type:   property.property_type || 'apartment',
    city:            property.city || '',
    country:         property.country || 'France',
    address:         property.address || '',
    status:          property.status || 'active',
  })
  const [error, setError]   = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      await propertyAPI.update(property.id, {
        ...form,
        price_per_night: parseFloat(form.price_per_night),
        max_guests:      parseInt(form.max_guests),
        bedrooms:        parseInt(form.bedrooms),
        bathrooms:       parseInt(form.bathrooms),
      })
      onSave()
    } catch (e) { setError(e.response?.data?.message || 'Erreur lors de la sauvegarde') }
    finally { setSaving(false) }
  }

  const F = ({ label, k, type = 'text', opts }) => (
    <div>
      <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--txt-3)' }}>{label}</label>
      {opts
        ? <select value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} className="input-field">
            {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
        : <input type={type} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
            className="input-field" />
      }
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-card p-6 w-full max-w-2xl my-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-black text-lg" style={{ color: 'var(--txt)' }}>✏️ Modifier le logement #{property.id}</h2>
          <button onClick={onClose} className="text-2xl opacity-50 hover:opacity-100" style={{ color: 'var(--txt)' }}>✕</button>
        </div>
        {error && <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm px-4 py-3 rounded-xl mb-4">⚠️ {error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><F label="Titre" k="title" /></div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--txt-3)' }}>Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="input-field resize-none" rows={3} />
          </div>
          <F label="Prix/nuit (€)" k="price_per_night" type="number" />
          <F label="Capacité max" k="max_guests" type="number" />
          <F label="Chambres" k="bedrooms" type="number" />
          <F label="Salles de bain" k="bathrooms" type="number" />
          <F label="Type" k="property_type" opts={[
            { v: 'studio', l: '🏠 Studio' }, { v: 'apartment', l: '🏢 Appartement' },
            { v: 'house', l: '🏡 Maison' }, { v: 'villa', l: '🌴 Villa' },
          ]} />
          <F label="Statut" k="status" opts={[{ v: 'active', l: '✅ Actif' }, { v: 'inactive', l: '❌ Inactif' }]} />
          <F label="Ville" k="city" />
          <F label="Pays" k="country" />
          <div className="sm:col-span-2"><F label="Adresse" k="address" /></div>
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={onClose} className="btn-secondary px-5 py-2">Annuler</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary px-6 py-2 btn-shimmer">
            {saving ? '⏳ Sauvegarde...' : '✅ Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// ADMIN PRINCIPAL
// ══════════════════════════════════════════════════════════════
export default function Admin() {
  const navigate = useNavigate()
  const { user: adminUser } = useAuth()
  const [tab,        setTab]        = useState('overview')
  const [users,      setUsers]      = useState([])
  const [properties, setProperties] = useState([])
  const [bookings,   setBookings]   = useState([])
  const [reviews,    setReviews]    = useState([])
  const [auditLog,   setAuditLog]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('etnair_audit_log') || '[]') } catch { return [] }
  })
  const [loading,    setLoading]    = useState(true)
  const [confirm,    setConfirm]    = useState(null)
  const [editProp,   setEditProp]   = useState(null)
  const [search,     setSearch]     = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Enregistre une action dans le journal d'audit
  const logAction = (action, details = '') => {
    const entry = {
      id:      Date.now(),
      time:    new Date().toISOString(),
      admin:   adminUser?.email || 'admin',
      action,
      details,
    }
    setAuditLog(prev => {
      const updated = [entry, ...prev].slice(0, 100)
      localStorage.setItem('etnair_audit_log', JSON.stringify(updated))
      return updated
    })
  }

  const reload = () => {
    setLoading(true)
    Promise.all([
      userAPI.getAll().catch(() => ({ data: [] })),
      propertyAPI.getAll({ limit: 100 }).catch(() => ({ data: [] })),
      bookingAPI.getAll().catch(() => ({ data: [] })),
    ]).then(([u, p, b]) => {
      setUsers(u.data); setProperties(p.data); setBookings(b.data)
      // Charger les avis pour chaque propriété
      const ids = [...new Set(p.data.map(x => x.id))]
      Promise.all(ids.slice(0, 20).map(id => reviewAPI.getByProperty(id).catch(() => ({ data: [] }))))
        .then(all => setReviews(all.flatMap(r => r.data)))
    }).finally(() => setLoading(false))
  }

  // Auto-refresh quand l'admin revient sur l'onglet
  useAutoRefresh(reload, 20000)

  // ── Stats globales ─────────────────────────────────────────
  const totalRevenue = bookings
    .filter(b => b.booking_status !== 'cancelled')
    .reduce((s, b) => s + parseFloat(b.total_price || 0), 0)

  const monthRevenue = useMemo(() => {
    const now = new Date(); const m = now.getMonth(); const y = now.getFullYear()
    return bookings
      .filter(b => b.booking_status !== 'cancelled')
      .filter(b => { const d = new Date(b.created_at || 0); return d.getMonth() === m && d.getFullYear() === y })
      .reduce((s, b) => s + parseFloat(b.total_price || 0), 0)
  }, [bookings])

  const byCounts = useMemo(() => ({
    pending:   bookings.filter(b => b.booking_status === 'pending').length,
    confirmed: bookings.filter(b => b.booking_status === 'confirmed').length,
    completed: bookings.filter(b => b.booking_status === 'completed').length,
    cancelled: bookings.filter(b => b.booking_status === 'cancelled').length,
  }), [bookings])

  const occupancyRate = properties.length
    ? Math.round((properties.filter(p => p.status === 'active').length / properties.length) * 100)
    : 0

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—'

  // ── Actions avec journal d'audit ──────────────────────────
  const updateBookingStatus = async (id, status) => {
    await API.patch(`/bookings/${id}/status`, { status })
    setBookings(prev => prev.map(b => b.id === id ? { ...b, booking_status: status } : b))
    logAction(`Réservation #${id} → ${status}`, `Statut modifié par l'admin`)
  }
  const archiveBooking = async (id) => {
    // Archive = passage en cancelled (traçable) plutôt que suppression définitive
    await API.patch(`/bookings/${id}/status`, { status: 'cancelled' })
    setBookings(prev => prev.map(b => b.id === id ? { ...b, booking_status: 'cancelled' } : b))
    logAction(`Réservation #${id} archivée (annulée)`)
  }
  const deleteBookingPermanent = async (id) => {
    await bookingAPI.delete(id)
    setBookings(prev => prev.filter(b => b.id !== id))
    logAction(`Réservation #${id} supprimée définitivement`)
  }
  const archiveProperty = async (id, title) => {
    await propertyAPI.update(id, { status: 'inactive' })
    setProperties(prev => prev.map(p => p.id === id ? { ...p, status: 'inactive' } : p))
    logAction(`Logement "${title}" archivé (désactivé)`)
  }
  const deleteProperty = async (id, title) => {
    await propertyAPI.delete(id)
    setProperties(prev => prev.filter(p => p.id !== id))
    logAction(`Logement "${title}" supprimé définitivement`)
  }
  const togglePropertyStatus = async (p) => {
    const newStatus = p.status === 'active' ? 'inactive' : 'active'
    await propertyAPI.update(p.id, { status: newStatus })
    setProperties(prev => prev.map(x => x.id === p.id ? { ...x, status: newStatus } : x))
    logAction(`Logement "${p.title}" → ${newStatus}`)
  }
  const updateUserRole = async (id, role) => {
    await userAPI.updateRole(id, role)
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u))
    const u = users.find(x => x.id === id)
    logAction(`Rôle de ${u?.email} → ${role}`)
  }
  const suspendUser = async (id) => {
    // Suspension = désactivation via updateRole en "suspended" ou is_verified=false
    await userAPI.updateRole(id, 'guest') // Rétrograde en guest + log
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role: 'guest', suspended: true } : u))
    const u = users.find(x => x.id === id)
    logAction(`Utilisateur ${u?.email} suspendu`)
  }
  const deleteUser = async (id) => {
    const u = users.find(x => x.id === id)
    await userAPI.deleteUser(id)
    setUsers(prev => prev.filter(u => u.id !== id))
    logAction(`Utilisateur ${u?.email} supprimé définitivement`)
  }
  const deleteReview = async (id) => {
    try {
      await API.delete(`/reviews/${id}`)
      setReviews(prev => prev.filter(r => r.id !== id))
      logAction(`Avis #${id} supprimé`)
    } catch {}
  }

  if (loading) return <Spinner />

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen z-40 flex flex-col
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `} style={{ width: '15rem', background: 'var(--bg-2)', borderRight: '1px solid var(--border)', paddingTop: '5rem' }}>

        <div className="px-3 pb-2 flex-1 overflow-y-auto">
          <p className="text-xs font-bold uppercase tracking-widest px-3 mb-3" style={{ color: 'var(--txt-4)' }}>
            Navigation
          </p>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setSidebarOpen(false) }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold mb-0.5 transition-all text-left"
              style={tab === t.id ? {
                background: 'linear-gradient(135deg, var(--primary-1), var(--primary-2))',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(255,107,53,0.30)',
              } : { color: 'var(--txt-3)', background: 'transparent' }}
              onMouseEnter={e => { if (tab !== t.id) e.currentTarget.style.background = 'var(--surface)' }}
              onMouseLeave={e => { if (tab !== t.id) e.currentTarget.style.background = 'transparent' }}>
              <span className="text-lg shrink-0">{t.icon}</span>
              <span>{t.label}</span>
              {t.id === 'bookings' && byCounts.pending > 0 && (
                <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full font-bold"
                  style={{ background: '#FFC857', color: '#1B263B' }}>{byCounts.pending}</span>
              )}
            </button>
          ))}
        </div>

        {/* Voir comme client */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid var(--border)' }}>
          <Link to="/" className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'rgba(0,184,217,0.12)', color: '#00B8D9', border: '1px solid rgba(0,184,217,0.25)' }}>
            <span>👁️</span>
            <span>Voir comme client</span>
          </Link>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Contenu principal ─────────────────────────────── */}
      <main className="flex-1 min-w-0 pt-20 pb-8 px-4 lg:px-6 overflow-x-hidden">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {/* Toggle sidebar mobile */}
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--txt)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-black" style={{ color: 'var(--txt)' }}>
                {TABS.find(t => t.id === tab)?.icon} {TABS.find(t => t.id === tab)?.label}
              </h1>
              <p className="text-xs" style={{ color: 'var(--txt-4)' }}>
                Contrôle total · {users.length} users · {properties.length} logements · {bookings.length} réservations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {byCounts.pending > 0 && (
              <span className="text-xs px-2 py-1 rounded-full font-semibold animate-pulse"
                style={{ background: 'rgba(245,158,11,0.20)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
                ⏳ {byCounts.pending} en attente
              </span>
            )}
            <span className="text-xs px-2 py-1 rounded-full font-semibold" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
              🟢 En direct
            </span>
            <button onClick={reload} className="btn-secondary text-sm py-2 px-4">🔄 Actualiser</button>
          </div>
        </div>

        {/* ════ TABLEAU DE BORD ════ */}
        {tab === 'overview' && (
          <div className="space-y-6">
            {/* Stats KPI */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon="👥" label="Utilisateurs" value={users.length}
                sub={`${users.filter(u => u.role==='host').length} hôtes · ${users.filter(u => u.role==='guest').length} voyageurs`}
                color="#00B8D9" onClick={() => setTab('users')} />
              <StatCard icon="🏠" label="Logements" value={properties.length}
                sub={`${properties.filter(p => p.status==='active').length} actifs · ${properties.filter(p => p.status!=='active').length} inactifs`}
                color="#FF6B35" onClick={() => setTab('properties')} />
              <StatCard icon="📅" label="Réservations" value={bookings.length}
                sub={`${byCounts.pending} en attente · ${byCounts.confirmed} confirmées`}
                color="#FFC857" onClick={() => setTab('bookings')} />
              <StatCard icon="💶" label="Revenus totaux" value={`${totalRevenue.toFixed(0)} €`}
                sub={`${monthRevenue.toFixed(0)} € ce mois`}
                color="#10b981" onClick={() => setTab('payments')} />
            </div>

            {/* Stats secondaires */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon="⭐" label="Note moyenne" value={avgRating} sub={`${reviews.length} avis`}
                color="#FFC857" onClick={() => setTab('reviews')} />
              <StatCard icon="📊" label="Taux occupation" value={`${occupancyRate}%`}
                sub="logements actifs / total" color="#00B8D9" onClick={() => setTab('stats')} />
              <StatCard icon="⏳" label="En attente" value={byCounts.pending}
                sub="réservations à valider" color="#f59e0b" onClick={() => setTab('bookings')} />
              <StatCard icon="✅" label="Terminées" value={byCounts.completed}
                sub="séjours complétés" color="#10b981" onClick={() => setTab('bookings')} />
            </div>

            {/* Graphique revenus */}
            <RevenueChart bookings={bookings} />

            {/* Activité récente + répartition */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Réservations récentes */}
              <div className="glass-card p-5">
                <h3 className="font-black mb-4" style={{ color: 'var(--txt)' }}>📅 Réservations récentes</h3>
                {bookings.length === 0
                  ? <p className="text-sm text-center py-4" style={{ color: 'var(--txt-3)' }}>Aucune activité</p>
                  : [...bookings].sort((a,b) => new Date(b.created_at||0)-new Date(a.created_at||0)).slice(0,5).map(b => {
                      const st = STATUS_BADGE[b.booking_status] || STATUS_BADGE.pending
                      return (
                        <div key={b.id} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                          <div>
                            <p className="font-semibold text-sm" style={{ color: 'var(--txt)' }}>
                              {b.property?.title || `Logement #${b.property_id}`}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--txt-3)' }}>
                              {fmtShort(b.start_date)} → {fmtShort(b.end_date)}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                            <p className="text-sm font-black gradient-text mt-0.5">{parseFloat(b.total_price||0).toFixed(0)} €</p>
                          </div>
                        </div>
                      )
                    })
                }
              </div>

              {/* Répartition rôles + statuts */}
              <div className="glass-card p-5 space-y-5">
                <div>
                  <h3 className="font-black mb-3" style={{ color: 'var(--txt)' }}>👥 Répartition des rôles</h3>
                  {[
                    { r: 'admin', l: 'Admins',    color: '#FFC857' },
                    { r: 'host',  l: 'Hôtes',     color: '#10b981' },
                    { r: 'guest', l: 'Voyageurs', color: '#00B8D9' },
                  ].map(({ r, l, color }) => {
                    const count = users.filter(u => u.role === r).length
                    const pct   = users.length ? (count / users.length) * 100 : 0
                    return (
                      <div key={r} className="mb-2">
                        <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--txt-2)' }}>
                          <span>{l}</span><span className="font-bold">{count}</span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: color }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  <h3 className="font-black mb-3" style={{ color: 'var(--txt)' }}>📅 Statuts réservations</h3>
                  {Object.entries(byCounts).map(([s, count]) => {
                    const st = STATUS_BADGE[s] || STATUS_BADGE.pending
                    const pct = bookings.length ? (count / bookings.length) * 100 : 0
                    return (
                      <div key={s} className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className={`px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                          <span className="font-bold" style={{ color: 'var(--txt-2)' }}>{count}</span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: 'var(--primary-1)' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Accès rapides */}
            <div className="glass-card p-5">
              <h3 className="font-black mb-4" style={{ color: 'var(--txt)' }}>🔧 Outils rapides</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { href: 'http://localhost:3000/api-docs', icon: '📄', label: 'Swagger API',  desc: 'Documentation' },
                  { href: 'http://localhost:5050',           icon: '🐘', label: 'pgAdmin',      desc: 'Base de données' },
                  { href: 'http://localhost:9001',           icon: '🗂️', label: 'MinIO',         desc: 'Stockage images' },
                  { href: 'http://localhost:3001',           icon: '📊', label: 'Grafana',       desc: 'Monitoring' },
                ].map(t => (
                  <a key={t.href} href={t.href} target="_blank" rel="noreferrer"
                    className="glass-card p-4 hover:scale-105 transition-all flex items-center gap-3">
                    <span className="text-2xl">{t.icon}</span>
                    <div>
                      <p className="font-bold text-sm" style={{ color: 'var(--txt)' }}>{t.label}</p>
                      <p className="text-xs" style={{ color: 'var(--txt-3)' }}>{t.desc}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════ LOGEMENTS ════ */}
        {tab === 'properties' && (
          <PropertiesTab
            properties={properties} bookings={bookings} search={search} setSearch={setSearch}
            onEdit={p => setEditProp(p)}
            onToggle={p => togglePropertyStatus(p)}
            onArchive={p => setConfirm({ msg: `Archiver "${p.title}" ? Le logement sera désactivé mais conservé.`, action: () => archiveProperty(p.id, p.title) })}
            onDelete={p => setConfirm({ msg: `Supprimer définitivement "${p.title}" ? Action irréversible.`, action: () => deleteProperty(p.id, p.title) })}
          />
        )}

        {/* ════ RÉSERVATIONS ════ */}
        {tab === 'bookings' && (
          <BookingsTab
            bookings={bookings} search={search} setSearch={setSearch}
            onStatus={(id, s) => updateBookingStatus(id, s)}
            onArchive={id => setConfirm({ msg: `Archiver la réservation #${id} ? Elle sera marquée annulée.`, action: () => archiveBooking(id) })}
            onDelete={id => setConfirm({ msg: `Supprimer définitivement la réservation #${id} ?`, action: () => deleteBookingPermanent(id) })}
          />
        )}

        {/* ════ UTILISATEURS ════ */}
        {tab === 'users' && (
          <UsersTab
            users={users} bookings={bookings} search={search} setSearch={setSearch}
            onRole={(id, role) => updateUserRole(id, role)}
            onSuspend={id => setConfirm({ msg: 'Suspendre cet utilisateur ? Son rôle sera rétrogradé.', action: () => suspendUser(id) })}
            onDelete={id => setConfirm({ msg: 'Supprimer cet utilisateur ? Action irréversible.', action: () => deleteUser(id) })}
          />
        )}

        {/* ════ PAIEMENTS ════ */}
        {tab === 'payments' && <PaymentsTab bookings={bookings} />}

        {/* ════ AVIS ════ */}
        {tab === 'reviews' && (
          <ReviewsTab reviews={reviews}
            onDelete={id => setConfirm({ msg: 'Supprimer cet avis ?', action: () => deleteReview(id) })} />
        )}

        {/* ════ STATISTIQUES ════ */}
        {tab === 'stats' && <StatsTab bookings={bookings} properties={properties} users={users} reviews={reviews} />}

        {/* ════ JOURNAL D'AUDIT ════ */}
        {tab === 'audit' && (
          <AuditTab
            auditLog={auditLog}
            onClear={() => { setAuditLog([]); localStorage.removeItem('etnair_audit_log') }}
          />
        )}

        {/* ════ PARAMÈTRES ════ */}
        {tab === 'settings' && <SettingsTab />}
      </main>

      {/* Modals */}
      {confirm && <ConfirmModal msg={confirm.msg} onConfirm={() => { confirm.action(); setConfirm(null) }} onCancel={() => setConfirm(null)} />}
      {editProp && <EditPropertyModal property={editProp} onClose={() => setEditProp(null)} onSave={() => { setEditProp(null); reload() }} />}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// ONGLET LOGEMENTS
// ══════════════════════════════════════════════════════════════
function PropertiesTab({ properties, bookings, search, setSearch, onEdit, onToggle, onArchive, onDelete }) {
  const [filter, setFilter] = useState('all')

  const filtered = properties
    .filter(p => filter === 'all' || p.status === filter)
    .filter(p => !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.city?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          {[['all','Tous'], ['active','Actifs'], ['inactive','Inactifs']].map(([v,l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className="text-sm px-4 py-2 rounded-xl font-semibold transition-all"
              style={filter === v
                ? { background: 'linear-gradient(135deg,var(--primary-1),var(--primary-2))', color:'#fff' }
                : { background:'var(--surface)', color:'var(--txt-2)', border:'1px solid var(--border)' }}>
              {l} ({filter === v ? filtered.length : (v === 'all' ? properties.length : properties.filter(p => p.status === v).length)})
            </button>
          ))}
        </div>
        <input placeholder="🔍 Titre ou ville..." value={search} onChange={e => setSearch(e.target.value)}
          className="input-field w-56 py-2 text-sm" />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                {['Photo','Logement','Ville','Type','Prix/nuit','Capacité','Résa','Statut','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide"
                    style={{ color: 'var(--txt-3)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={9} className="text-center py-12 text-sm" style={{ color: 'var(--txt-3)' }}>Aucun logement</td></tr>
                : filtered.map(p => {
                  const rev = bookings.filter(b => b.property_id === p.id && b.booking_status !== 'cancelled').reduce((s,b) => s+parseFloat(b.total_price||0), 0)
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td className="px-4 py-3">
                        <img src={getPropertyImage(p)} alt=""
                          className="w-12 h-12 rounded-xl object-cover"
                          onError={e => { e.target.src='https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=80&q=60' }} />
                      </td>
                      <td className="px-4 py-3 font-semibold max-w-[180px]" style={{ color: 'var(--txt)' }}>
                        <p className="truncate">{p.title}</p>
                        <p className="text-xs font-normal" style={{ color: 'var(--txt-4)' }}>#{p.id}</p>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--txt-2)' }}>📍 {p.city}</td>
                      <td className="px-4 py-3 text-sm capitalize" style={{ color: 'var(--txt-2)' }}>{p.property_type || '—'}</td>
                      <td className="px-4 py-3"><span className="font-black text-sm gradient-text">{parseFloat(p.price_per_night).toFixed(0)} €</span></td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--txt-2)' }}>👥 {p.max_guests}</td>
                      <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--primary-1)' }}>
                        {bookings.filter(b => b.property_id === p.id).length} · {rev.toFixed(0)} €
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => onToggle(p)}
                          className="text-xs px-2.5 py-1 rounded-full font-semibold transition-all"
                          style={p.status === 'active'
                            ? { background: '#10b98120', color: '#10b981', border: '1px solid #10b98133' }
                            : { background: 'var(--surface-2)', color: 'var(--txt-3)', border: '1px solid var(--border)' }}>
                          {p.status === 'active' ? '✅ Actif' : '❌ Inactif'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5 flex-wrap">
                          <button onClick={() => onEdit(p)}
                            className="text-xs px-2.5 py-1 rounded-lg transition-all"
                            style={{ background: 'var(--surface-2)', color: 'var(--primary-1)' }}>✏️ Éditer</button>
                          <Link to={`/annonces/${p.id}`}
                            className="text-xs px-2.5 py-1 rounded-lg transition-all"
                            style={{ background: 'var(--surface-2)', color: 'var(--txt-2)' }}>👁️ Voir</Link>
                          <button onClick={() => onArchive(p)}
                            className="text-xs px-2.5 py-1 rounded-lg transition-all"
                            style={{ background: 'rgba(255,200,87,0.12)', color: '#FFC857' }}
                            title="Archiver (désactiver)">📦 Archiver</button>
                          <button onClick={() => onDelete(p)}
                            className="text-xs text-rose-400 hover:text-rose-300 px-1"
                            title="Supprimer définitivement">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs" style={{ color: 'var(--txt-4)' }}>{filtered.length} logement{filtered.length !== 1 ? 's' : ''} affiché{filtered.length !== 1 ? 's' : ''}</p>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// ONGLET RÉSERVATIONS
// ══════════════════════════════════════════════════════════════
function BookingsTab({ bookings, search, setSearch, onStatus, onArchive, onDelete }) {
  const [filter, setFilter] = useState('all')
  const [updating, setUpdating] = useState(null)

  const filtered = bookings
    .filter(b => filter === 'all' || b.booking_status === filter)
    .filter(b => !search || String(b.id).includes(search) || b.property?.title?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))

  const handleStatus = async (id, s) => {
    setUpdating(id); await onStatus(id, s); setUpdating(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {[['all','Toutes'], ['pending','En attente'], ['confirmed','Confirmées'], ['completed','Terminées'], ['cancelled','Annulées'], ['refunded','Remboursées']].map(([v,l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className="text-xs px-3 py-1.5 rounded-xl font-semibold transition-all"
              style={filter === v
                ? { background: 'linear-gradient(135deg,var(--primary-1),var(--primary-2))', color:'#fff' }
                : { background:'var(--surface)', color:'var(--txt-2)', border:'1px solid var(--border)' }}>
              {l} ({v === 'all' ? bookings.length : bookings.filter(b => b.booking_status === v).length})
            </button>
          ))}
        </div>
        <input placeholder="🔍 ID réservation ou logement..." value={search} onChange={e => setSearch(e.target.value)}
          className="input-field w-56 py-2 text-sm" />
      </div>

      <div className="space-y-3">
        {filtered.length === 0
          ? <div className="glass p-12 text-center rounded-2xl"><p style={{ color:'var(--txt-3)' }}>Aucune réservation</p></div>
          : filtered.map(b => {
              const st = STATUS_BADGE[b.booking_status] || STATUS_BADGE.pending
              const nights = Math.ceil((new Date(b.end_date) - new Date(b.start_date)) / 86400000)
              return (
                <div key={b.id} className="glass-card p-4 flex items-center flex-wrap gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div>
                      <p className="font-bold text-sm" style={{ color:'var(--txt)' }}>
                        {b.property?.title || `Logement #${b.property_id}`}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color:'var(--txt-3)' }}>
                        ✈️ {b.guest ? `${b.guest.first_name} ${b.guest.last_name}` : `Voyageur #${b.guest_id}`}
                        {b.property?.owner && <span className="ml-1">· 🏠 Hôte : {b.property.owner.first_name} {b.property.owner.last_name}</span>}
                      </p>
                      <p className="text-xs" style={{ color:'var(--txt-4)' }}>
                        {fmtShort(b.start_date)} → {fmtShort(b.end_date)}
                        {nights > 0 && ` · ${nights} nuit${nights > 1 ? 's' : ''}`}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${st.cls}`}>{st.label}</span>
                  <span className="font-black text-sm gradient-text">{parseFloat(b.total_price||0).toFixed(0)} €</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {STATUS_NEXT[b.booking_status]?.map(s => (
                      <button key={s} onClick={() => handleStatus(b.id, s)}
                        disabled={updating === b.id}
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
                        style={s === 'confirmed' ? { background:'#10b98118', color:'#10b981', border:'1px solid #10b98133' }
                          : s === 'completed' ? { background:'#3b82f618', color:'#60a5fa', border:'1px solid #3b82f633' }
                          : s === 'refunded'  ? { background:'rgba(168,85,247,0.12)', color:'#c084fc', border:'1px solid rgba(168,85,247,0.25)' }
                          : { background:'rgba(239,68,68,0.12)', color:'#f87171', border:'1px solid rgba(239,68,68,0.25)' }}>
                        {STATUS_LABELS[s] || s}
                      </button>
                    ))}
                    <button onClick={() => onArchive(b.id)}
                      className="text-xs px-2 py-1.5 rounded-lg transition-all"
                      style={{ background:'rgba(255,200,87,0.10)', color:'#FFC857' }}
                      title="Archiver">📦</button>
                    <button onClick={() => onDelete(b.id)} className="text-xs text-rose-400 hover:text-rose-300 px-1" title="Supprimer définitivement">🗑️</button>
                  </div>
                </div>
              )
            })
        }
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// ONGLET UTILISATEURS
// ══════════════════════════════════════════════════════════════
function UsersTab({ users, bookings, search, setSearch, onRole, onSuspend, onDelete }) {
  const [filter, setFilter] = useState('all')

  const filtered = users
    .filter(u => filter === 'all' || u.role === filter)
    .filter(u => !search || `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {[['all','Tous'], ['admin','Admins'], ['host','Hôtes'], ['guest','Voyageurs']].map(([v,l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className="text-xs px-3 py-1.5 rounded-xl font-semibold transition-all"
              style={filter === v
                ? { background: 'linear-gradient(135deg,var(--primary-1),var(--primary-2))', color:'#fff' }
                : { background:'var(--surface)', color:'var(--txt-2)', border:'1px solid var(--border)' }}>
              {l} ({v === 'all' ? users.length : users.filter(u => u.role === v).length})
            </button>
          ))}
        </div>
        <input placeholder="🔍 Nom, prénom ou email..." value={search} onChange={e => setSearch(e.target.value)}
          className="input-field w-72 py-2 text-sm" />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                {['Avatar','Utilisateur','Email','Rôle','Réservations','Inscrit','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide"
                    style={{ color:'var(--txt-3)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const userBookings = bookings.filter(b => b.guest_id === u.id)
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td className="px-4 py-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white"
                        style={{ background: 'linear-gradient(135deg,var(--primary-1),var(--secondary))' }}>
                        {u.first_name?.[0]?.toUpperCase() || '?'}
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color:'var(--txt)' }}>
                      <p className="font-semibold">{u.first_name} {u.last_name}</p>
                      <p className="text-xs" style={{ color:'var(--txt-4)' }}>#{u.id}</p>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color:'var(--txt-2)' }}>{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-full font-semibold"
                        style={{
                          background: u.role === 'admin' ? 'rgba(245,158,11,0.15)' : u.role === 'host' ? 'rgba(16,185,129,0.15)' : 'rgba(0,184,217,0.15)',
                          color:      u.role === 'admin' ? '#f59e0b'               : u.role === 'host' ? '#10b981'              : '#00B8D9',
                        }}>
                        {u.role === 'admin' ? '⚡ Admin' : u.role === 'host' ? '🏠 Hôte' : '✈️ Voyageur'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      {userBookings.length > 0
                        ? <span className="font-semibold" style={{ color:'var(--primary-1)' }}>{userBookings.length} résa</span>
                        : <span style={{ color:'var(--txt-4)' }}>—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color:'var(--txt-3)' }}>
                      {u.created_at ? fmtDate(u.created_at) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => onSuspend(u.id)}
                          className="text-xs px-2 py-1 rounded-lg transition-all"
                          style={{ background:'rgba(255,200,87,0.10)', color:'#FFC857', border:'1px solid rgba(255,200,87,0.2)' }}
                          title="Suspendre l'accès">
                          🚫 Suspendre
                        </button>
                        <button onClick={() => onDelete(u.id)} className="text-xs text-rose-400 hover:text-rose-300 px-1" title="Supprimer définitivement">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// ONGLET PAIEMENTS
// ══════════════════════════════════════════════════════════════
function PaymentsTab({ bookings }) {
  const payments = bookings
    .filter(b => b.booking_status !== 'cancelled')
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))

  const total      = payments.reduce((s, b) => s + parseFloat(b.total_price || 0), 0)
  const pending    = bookings.filter(b => b.booking_status === 'pending').reduce((s, b) => s + parseFloat(b.total_price || 0), 0)
  const confirmed  = bookings.filter(b => b.booking_status === 'confirmed').reduce((s, b) => s + parseFloat(b.total_price || 0), 0)
  const completed  = bookings.filter(b => b.booking_status === 'completed').reduce((s, b) => s + parseFloat(b.total_price || 0), 0)

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="💶" label="Volume total" value={`${total.toFixed(0)} €`} sub="hors annulations" color="#10b981" />
        <StatCard icon="⏳" label="En attente" value={`${pending.toFixed(0)} €`} sub="à encaisser" color="#FFC857" />
        <StatCard icon="✅" label="Confirmés" value={`${confirmed.toFixed(0)} €`} sub="réservations actives" color="#00B8D9" />
        <StatCard icon="🏁" label="Encaissés" value={`${completed.toFixed(0)} €`} sub="séjours terminés" color="#FF6B35" />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="font-black" style={{ color: 'var(--txt)' }}>💳 Historique des paiements</h3>
          <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
            Simulation — intégration Stripe possible
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                {['#','Logement','Voyageur','Dates','Montant','Statut'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide"
                    style={{ color: 'var(--txt-3)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.slice(0, 20).map(b => {
                const st = STATUS_BADGE[b.booking_status]
                return (
                  <tr key={b.id} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td className="px-4 py-3 text-xs" style={{ color:'var(--txt-4)' }}>#{b.id}</td>
                    <td className="px-4 py-3 font-medium" style={{ color:'var(--txt)' }}>{b.property?.title || `#${b.property_id}`}</td>
                    <td className="px-4 py-3 text-xs" style={{ color:'var(--txt-3)' }}>Voyageur #{b.guest_id}</td>
                    <td className="px-4 py-3 text-xs" style={{ color:'var(--txt-3)' }}>{fmtShort(b.start_date)} → {fmtShort(b.end_date)}</td>
                    <td className="px-4 py-3 font-black gradient-text">{parseFloat(b.total_price||0).toFixed(2)} €</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${st?.cls}`}>{st?.label}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// ONGLET AVIS
// ══════════════════════════════════════════════════════════════
function ReviewsTab({ reviews, onDelete }) {
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0

  const ratingDist = [5,4,3,2,1].map(n => ({
    n, count: reviews.filter(r => r.rating === n).length,
    pct: reviews.length ? Math.round((reviews.filter(r => r.rating === n).length / reviews.length) * 100) : 0,
  }))

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="glass-card p-5 text-center">
          <p className="text-5xl font-black gradient-text">{avgRating}</p>
          <div className="flex justify-center gap-0.5 my-2">
            {[1,2,3,4,5].map(s => (
              <span key={s} className="text-xl" style={{ color: s <= Math.round(avgRating) ? '#FFC857' : 'var(--border-2)' }}>★</span>
            ))}
          </div>
          <p className="text-sm" style={{ color: 'var(--txt-3)' }}>Note moyenne sur {reviews.length} avis</p>
        </div>
        <div className="glass-card p-5 lg:col-span-2">
          <h3 className="font-black mb-4" style={{ color: 'var(--txt)' }}>Distribution des notes</h3>
          {ratingDist.map(({ n, count, pct }) => (
            <div key={n} className="flex items-center gap-3 mb-2">
              <span className="text-xs w-6 text-right font-bold" style={{ color: 'var(--txt-2)' }}>{n}★</span>
              <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--border)' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: n >= 4 ? '#10b981' : n === 3 ? '#FFC857' : '#ef4444' }} />
              </div>
              <span className="text-xs w-6 font-semibold" style={{ color: 'var(--txt-3)' }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="font-black mb-4" style={{ color: 'var(--txt)' }}>⭐ Tous les avis ({reviews.length})</h3>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {reviews.length === 0
            ? <p className="text-center py-8 text-sm" style={{ color: 'var(--txt-3)' }}>Aucun avis disponible</p>
            : reviews.map(r => (
              <div key={r.id} className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white shrink-0"
                  style={{ background: 'linear-gradient(135deg, var(--primary-1), var(--secondary))' }}>
                  {r.reviewer?.first_name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm" style={{ color: 'var(--txt)' }}>
                      {r.reviewer ? `${r.reviewer.first_name} ${r.reviewer.last_name}` : `Voyageur #${r.reviewer_id}`}
                    </p>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} className="text-sm" style={{ color: s <= r.rating ? '#FFC857' : 'var(--border-2)' }}>★</span>
                      ))}
                    </div>
                    <span className="text-xs" style={{ color: 'var(--txt-4)' }}>{fmtDate(r.created_at)}</span>
                  </div>
                  <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--txt-2)' }}>{r.comment}</p>
                </div>
                <button onClick={() => onDelete(r.id)}
                  className="text-xs text-rose-400 hover:text-rose-300 shrink-0 px-1">🗑️</button>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// ONGLET STATISTIQUES
// ══════════════════════════════════════════════════════════════
function StatsTab({ bookings, properties, users, reviews }) {
  const totalRev = bookings.filter(b => b.booking_status !== 'cancelled').reduce((s,b) => s+parseFloat(b.total_price||0), 0)
  const avgBookingValue = bookings.length ? (totalRev / bookings.length).toFixed(0) : 0
  const cancellationRate = bookings.length ? Math.round((bookings.filter(b => b.booking_status==='cancelled').length / bookings.length) * 100) : 0
  const occupancyRate = properties.length ? Math.round((properties.filter(p => p.status==='active').length / properties.length) * 100) : 0

  const topProperties = properties.map(p => ({
    ...p,
    revenue: bookings.filter(b => b.property_id === p.id && b.booking_status !== 'cancelled').reduce((s,b) => s+parseFloat(b.total_price||0),0),
    bookingCount: bookings.filter(b => b.property_id === p.id).length,
  })).sort((a,b) => b.revenue - a.revenue).slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="💶" label="Revenu moyen/résa" value={`${avgBookingValue} €`} sub="par réservation" color="#10b981" />
        <StatCard icon="❌" label="Taux annulation" value={`${cancellationRate}%`} sub="des réservations" color="#ef4444" />
        <StatCard icon="📊" label="Taux occupation" value={`${occupancyRate}%`} sub="logements actifs" color="#00B8D9" />
        <StatCard icon="⭐" label="Satisfaction" value={reviews.length ? (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1)+'/5' : '—'} sub={`${reviews.length} avis`} color="#FFC857" />
      </div>

      <RevenueChart bookings={bookings} height={200} />

      <div className="glass-card p-5">
        <h3 className="font-black mb-4" style={{ color: 'var(--txt)' }}>🏆 Top 5 logements (revenus)</h3>
        {topProperties.map((p, i) => (
          <div key={p.id} className="flex items-center gap-4 py-3 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
            <span className="font-black text-xl w-8 shrink-0" style={{ color: i === 0 ? '#FFC857' : 'var(--txt-4)' }}>
              #{i + 1}
            </span>
            <img src={getPropertyImage(p)} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0"
              onError={e => { e.target.src='https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=80' }} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate" style={{ color: 'var(--txt)' }}>{p.title}</p>
              <p className="text-xs" style={{ color: 'var(--txt-3)' }}>📍 {p.city} · {p.bookingCount} résa</p>
            </div>
            <p className="font-black gradient-text text-lg shrink-0">{p.revenue.toFixed(0)} €</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// ONGLET JOURNAL D'AUDIT
// ══════════════════════════════════════════════════════════════
function AuditTab({ auditLog, onClear }) {
  const timeAgo = (iso) => {
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1)  return 'À l\'instant'
    if (m < 60) return `Il y a ${m} min`
    const h = Math.floor(m / 60)
    if (h < 24) return `Il y a ${h}h`
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  const iconFor = (action = '') => {
    if (action.includes('supprimé')) return '🗑️'
    if (action.includes('archivé') || action.includes('archivée')) return '📦'
    if (action.includes('suspendu')) return '🚫'
    if (action.includes('Rôle'))    return '🔄'
    if (action.includes('Réservation')) return '📅'
    if (action.includes('Logement')) return '🏠'
    if (action.includes('Avis'))    return '⭐'
    return '📋'
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-black text-xl" style={{ color: 'var(--txt)' }}>📋 Journal d'audit</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--txt-3)' }}>
            {auditLog.length} action{auditLog.length !== 1 ? 's' : ''} enregistrée{auditLog.length !== 1 ? 's' : ''} · 100 max conservées
          </p>
        </div>
        {auditLog.length > 0 && (
          <button onClick={onClear}
            className="text-sm px-4 py-2 rounded-xl transition-all"
            style={{ background: 'rgba(239,68,68,0.10)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
            🗑️ Effacer le journal
          </button>
        )}
      </div>

      {auditLog.length === 0 ? (
        <div className="glass p-16 text-center rounded-2xl">
          <div className="text-5xl mb-3">📋</div>
          <p className="font-bold text-lg mb-1" style={{ color: 'var(--txt)' }}>Journal vide</p>
          <p className="text-sm" style={{ color: 'var(--txt-3)' }}>Les actions administratives apparaîtront ici.</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--txt-3)' }}>
              Historique des actions
            </span>
          </div>
          <div className="divide-y" style={{ '--tw-divide-opacity': 1 }}>
            {auditLog.map((entry, i) => (
              <div key={entry.id} className="flex items-start gap-3 px-5 py-3"
                style={{ borderBottom: i < auditLog.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  {iconFor(entry.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: 'var(--txt)' }}>{entry.action}</p>
                  {entry.details && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--txt-3)' }}>{entry.details}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                      style={{ background: 'rgba(255,107,53,0.12)', color: 'var(--primary-1)' }}>
                      👤 {entry.admin}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--txt-4)' }}>{timeAgo(entry.time)}</span>
                  </div>
                </div>
                <span className="text-xs shrink-0" style={{ color: 'var(--txt-4)' }}>
                  {new Date(entry.time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// ONGLET PARAMÈTRES
// ══════════════════════════════════════════════════════════════
function SettingsTab() {
  const [saved, setSaved] = useState(false)
  const [settings, setSettings] = useState({
    siteName:     'ETNAir',
    contactEmail: 'admin@etnair.com',
    currency:     'EUR',
    language:     'fr',
    commissionRate: '10',
    maxGuests:    '20',
    maintenanceMode: false,
  })

  const save = () => {
    localStorage.setItem('etnair_admin_settings', JSON.stringify(settings))
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const F = ({ label, k, type='text', opts }) => (
    <div>
      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--txt-2)' }}>{label}</label>
      {opts
        ? <select value={settings[k]} onChange={e => setSettings(s => ({...s, [k]: e.target.value}))} className="input-field">
            {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
        : <input type={type} value={settings[k]} onChange={e => setSettings(s => ({...s, [k]: e.target.value}))}
            className="input-field" />
      }
    </div>
  )

  return (
    <div className="max-w-2xl space-y-5">
      <div className="glass-card p-6">
        <h3 className="font-black text-lg mb-5" style={{ color: 'var(--txt)' }}>🌐 Paramètres généraux</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <F label="Nom du site" k="siteName" />
          <F label="Email de contact" k="contactEmail" type="email" />
          <F label="Devise" k="currency" opts={[{v:'EUR',l:'€ Euro'},{v:'USD',l:'$ Dollar'},{v:'GBP',l:'£ Livre'}]} />
          <F label="Langue" k="language" opts={[{v:'fr',l:'🇫🇷 Français'},{v:'en',l:'🇬🇧 English'}]} />
          <F label="Commission (%)" k="commissionRate" type="number" />
          <F label="Capacité max par défaut" k="maxGuests" type="number" />
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-black text-lg mb-5" style={{ color: 'var(--txt)' }}>⚙️ Maintenance</h3>
        <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <div>
            <p className="font-semibold" style={{ color: 'var(--txt)' }}>Mode maintenance</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--txt-4)' }}>Affiche une page de maintenance aux visiteurs</p>
          </div>
          <button onClick={() => setSettings(s => ({...s, maintenanceMode: !s.maintenanceMode}))}
            className="relative w-14 h-7 rounded-full transition-all duration-300"
            style={{ background: settings.maintenanceMode ? 'var(--primary-1)' : 'var(--border-2)' }}>
            <span className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all duration-300"
              style={{ left: settings.maintenanceMode ? '1.75rem' : '0.125rem' }} />
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={save} className="btn-primary px-8 py-3 btn-shimmer">
          {saved ? '✅ Sauvegardé !' : '💾 Sauvegarder'}
        </button>
      </div>

      <div className="glass-card p-5" style={{ border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.04)' }}>
        <h3 className="font-bold text-base mb-2" style={{ color: '#f87171' }}>⚠️ Zone de danger</h3>
        <p className="text-sm mb-4" style={{ color: 'var(--txt-3)' }}>Ces actions sont irréversibles. Utilisez avec précaution.</p>
        <div className="flex gap-3 flex-wrap">
          <button className="text-sm px-4 py-2 rounded-xl font-semibold"
            style={{ background: 'rgba(239,68,68,0.10)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
            🗑️ Vider le cache
          </button>
          <button className="text-sm px-4 py-2 rounded-xl font-semibold"
            style={{ background: 'rgba(239,68,68,0.10)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
            📧 Envoyer email test
          </button>
        </div>
      </div>
    </div>
  )
}
