import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useLanguage } from '../context/LanguageContext'
import { LANGUAGES } from '../i18n/translations'
import { notificationAPI } from '../services/api'

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
  return `Il y a ${d} jour${d > 1 ? 's' : ''}`
}

function NotifDropdown({ notifs, onMarkRead, onReadAll, onClose, navigate }) {
  const go = (to) => { onClose(); navigate(to) }
  const preview = notifs.slice(0, 4)

  return (
    <div style={{
      position: 'absolute', right: 0, top: 'calc(100% + 8px)',
      width: '22rem', borderRadius: '1rem', overflow: 'hidden',
      background: 'var(--bg-2)', border: '1px solid var(--border-2)',
      boxShadow: '0 20px 60px rgba(0,0,0,0.5)', zIndex: 9999,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--txt)' }}>Notifications</span>
        {notifs.filter(n => !n.is_read).length > 0 && (
          <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.5rem', borderRadius: '9999px', fontWeight: 700, background: 'rgba(255,107,53,0.15)', color: 'var(--primary-1)' }}>
            {notifs.filter(n => !n.is_read).length} non lu{notifs.filter(n => !n.is_read).length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {preview.length === 0 ? (
        <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--txt-4)', fontSize: '0.85rem' }}>
          🔔 Aucune notification
        </div>
      ) : preview.map((n, i) => (
        <div key={n.id}
          onClick={() => { if (!n.is_read) onMarkRead(n.id); go('/notifications') }}
          style={{
            display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
            padding: '0.875rem 1rem', cursor: 'pointer',
            borderBottom: i < preview.length - 1 ? '1px solid var(--border)' : 'none',
            background: 'transparent', transition: 'background 0.15s',
            borderLeft: !n.is_read ? '3px solid var(--primary-1)' : '3px solid transparent',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.5rem', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: n.is_read ? 'var(--surface-2)' : 'rgba(255,107,53,0.12)', border: '1px solid var(--border)', fontSize: '1rem' }}>
            {notifIcon(n.title, n.content)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--txt)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {n.title || 'Notification'}
            </p>
            {n.content && (
              <p style={{ fontSize: '0.72rem', color: 'var(--txt-3)', margin: '0.1rem 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {n.content}
              </p>
            )}
            <p style={{ fontSize: '0.68rem', color: 'var(--txt-4)', marginTop: '0.15rem' }}>{timeAgo(n.created_at)}</p>
          </div>
          {!n.is_read && <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: 'var(--primary-1)', flexShrink: 0, marginTop: '0.35rem' }} />}
        </div>
      ))}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
        <button onClick={onReadAll} style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--txt-3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          ✓ Tout lire
        </button>
        <button onClick={() => go('/notifications')} style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-1)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          Voir tout →
        </button>
      </div>
    </div>
  )
}

// ── Logo vidéo avec cache-buster ───────────────────────────
function LogoVideo({ size = 36 }) {
  return (
    <video src="/iosna.mp4?v=3" autoPlay loop muted playsInline
      style={{ width: size, height: size, objectFit: 'contain', borderRadius: '8px', display: 'block' }} />
  )
}

// ── User dropdown ──────────────────────────────────────────
function UserMenu({ user, onLogout, onClose }) {
  const roleBg    = { admin: 'rgba(245,158,11,0.15)', host: 'rgba(16,185,129,0.15)', guest: 'rgba(201,168,76,0.12)' }
  const roleColor = { admin: '#f59e0b', host: '#10b981', guest: 'var(--primary-1)' }
  const roleLabel = { admin: '⚡ Admin', host: '🏠 Hôte', guest: '✈️ Voyageur' }

  const links = [
    { to: '/profile',  label: '👤 Mon profil' },
    { to: '/bookings', label: '📅 Réservations' },
    { to: '/wishlist', label: '❤️ Favoris' },
    { to: '/messages', label: '💬 Messages' },
    ...(user?.role === 'host' || user?.role === 'admin' ? [{ to: '/host', label: '🏠 Espace hôte', color: '#10b981' }] : []),
    ...(user?.role === 'admin' ? [{ to: '/admin', label: '⚡ Dashboard Admin', color: '#f59e0b' }] : []),
  ]

  return (
    <div className="absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl py-2 z-50 animate-fade-in-down"
      style={{ background: 'var(--bg-2)', border: '1px solid var(--border-2)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
      <div className="px-4 py-3.5 mb-1" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--primary-1), var(--secondary))', color: '#0d0a04' }}>
            {user?.first_name?.[0]?.toUpperCase()}{user?.last_name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: 'var(--txt)' }}>{user?.first_name} {user?.last_name}</p>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: roleBg[user?.role] || roleBg.guest, color: roleColor[user?.role] || roleColor.guest }}>
              {roleLabel[user?.role] || '✈️ Voyageur'}
            </span>
          </div>
        </div>
      </div>
      {links.map(x => (
        <Link key={x.to} to={x.to} onClick={onClose}
          className="flex items-center px-4 py-2.5 text-sm transition-all"
          style={{ color: x.color || 'var(--txt-2)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface)'; if (!x.color) e.currentTarget.style.color = 'var(--txt)' }}
          onMouseLeave={e => { e.currentTarget.style.background = ''; if (!x.color) e.currentTarget.style.color = 'var(--txt-2)' }}>
          {x.label}
        </Link>
      ))}
      <div className="mx-4 my-1.5" style={{ borderTop: '1px solid var(--border)' }} />
      <button onClick={onLogout} className="flex items-center w-full px-4 py-2.5 text-sm"
        style={{ color: '#f87171' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,107,53,0.08)'}
        onMouseLeave={e => e.currentTarget.style.background = ''}>
        🚪 Déconnexion
      </button>
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// MAIN NAVBAR
// ══════════════════════════════════════════════════════════
// ── Sélecteur de langue ────────────────────────────────────
function LangSelector() {
  const { lang, setLang } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = LANGUAGES.find(l => l.code === lang)

  useEffect(() => {
    const fn = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--txt-2)' }}>
        <span className="text-xs font-black" style={{ color: 'var(--primary-1)' }}>{current?.short}</span>
        <span className="hidden sm:inline text-xs">{current?.label}</span>
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--txt-4)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-2xl py-2 z-50 animate-fade-in-down"
          style={{ background: 'var(--bg-2)', border: '1px solid var(--border-2)', boxShadow: '0 16px 40px rgba(0,0,0,0.25)' }}>
          {LANGUAGES.map(l => (
            <button key={l.code} onClick={() => { setLang(l.code); setOpen(false) }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-all text-left"
              style={lang === l.code
                ? { background: 'var(--surface-2)', color: 'var(--primary-1)' }
                : { color: 'var(--txt-2)' }}
              onMouseEnter={e => { if (lang !== l.code) e.currentTarget.style.background = 'var(--surface)' }}
              onMouseLeave={e => { if (lang !== l.code) e.currentTarget.style.background = '' }}>
              <span className="text-lg">{l.flag}</span>
              <span>{l.label}</span>
              {lang === l.code && <span className="ml-auto text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const { user, isAuth, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()

  const [menuOpen,  setMenuOpen]  = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifs,    setNotifs]    = useState([])
  const [scrolled,  setScrolled]  = useState(false)

  const notifRef = useRef(null)
  const menuRef  = useRef(null)

  const unread = notifs.filter(n => !n.is_read).length

  // Charger les notifications + refresh sur focus (pour voir les nouvelles réservations)
  const fetchNotifs = () => {
    if (!isAuth) { setNotifs([]); return }
    notificationAPI.getAll()
      .then(r => setNotifs(r.data?.data || r.data || []))
      .catch(() => {})
  }
  useEffect(() => {
    fetchNotifs()
    const onFocus = () => fetchNotifs()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [isAuth])
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  useEffect(() => {
    const fn = (e) => {
      if (!notifRef.current?.contains(e.target)) setNotifOpen(false)
      if (!menuRef.current?.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])
  useEffect(() => { setMenuOpen(false); setNotifOpen(false) }, [location.pathname])

  const isActive = (p) => location.pathname === p || (p !== '/' && location.pathname.startsWith(p))

  // ── Nav items selon rôle ──────────────────────────────
  const navItems = [
    { to: '/',         label: t.nav.home,      icon: '🏠' },
    { to: '/search',   label: t.nav.explore,   icon: '🔍' },
    { to: '/ai',       label: 'IA Voyage',     icon: '🤖' },
    { to: '/services', label: 'Activités',     icon: '🎯' },
    ...(isAuth ? [
      { to: '/bookings', label: t.nav.bookings,  icon: '📅' },
      { to: '/wishlist', label: t.nav.favorites, icon: '❤️' },
      { to: '/messages', label: t.nav.messages,  icon: '✉️', badge: unread > 0 ? unread : null },
    ] : [
      { to: '/login',    label: t.nav.login,    icon: '🔐' },
    ]),
    ...(user?.role === 'host' || user?.role === 'admin'
      ? [{ to: '/host',  label: t.nav.mySpace, icon: '🏡', accent: '#10b981' }] : []),
    ...(user?.role === 'admin'
      ? [{ to: '/admin', label: t.nav.admin,   icon: '⚡', accent: '#f59e0b' }] : []),
    ...(!user || user?.role === 'guest' || user?.role === 'host'
      ? [{ to: '/contact', label: 'Contact', icon: '📞' }] : []),
    ...(!isAuth
      ? [{ to: '/register', label: t.nav.register, icon: '👤' }]
      : []),
  ]

  return (
    <>
      {/* ══ TOP BAR — minimaliste ══════════════════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-navbar border-b' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="transition-transform group-hover:scale-105">
                <LogoVideo size={36} />
              </div>
              <div>
                <span className="font-black text-xl tracking-tight" style={{ color: 'var(--txt)' }}>
                  ETN<span className="gradient-text">Air</span>
                </span>
                <div className="hidden sm:block -mt-0.5" style={{ color: 'var(--txt-4)', fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                  Luxury Stays
                </div>
              </div>
            </Link>

            {/* Droite : langue + thème + notif + avatar */}
            <div className="flex items-center gap-2">
              {/* Sélecteur de langue */}
              <LangSelector />

              {/* Toggle thème */}
              <button onClick={toggle}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                {dark ? '☀️' : '🌙'}
              </button>

              {/* Notifications */}
              {isAuth && (
                <div style={{ position: 'relative' }} ref={notifRef}>
                  <button onClick={() => { setNotifOpen(o => !o); setMenuOpen(false) }}
                    style={{ position: 'relative', width: '2.25rem', height: '2.25rem', borderRadius: '0.75rem', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      style={{ color: unread > 0 ? 'var(--primary-1)' : 'var(--txt-2)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                    </svg>
                    {unread > 0 && (
                      <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '1.1rem', height: '1.1rem', borderRadius: '50%', background: 'var(--primary-1)', color: '#0d0a04', fontSize: '0.58rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {unread}
                      </span>
                    )}
                  </button>
                  {notifOpen && (
                    <NotifDropdown
                      notifs={notifs}
                      onMarkRead={(id) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))}
                      onReadAll={async () => {
                        try { await notificationAPI.markAllRead() } catch {}
                        setNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
                      }}
                      onClose={() => setNotifOpen(false)}
                      navigate={navigate}
                    />
                  )}
                </div>
              )}

              {/* Avatar / Connexion */}
              <div style={{ position: 'relative' }} ref={menuRef}>
                {isAuth ? (
                  <>
                    <button onClick={() => { setMenuOpen(m => !m); setNotifOpen(false) }}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-2xl transition-all hover:scale-105"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border-2)' }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0"
                        style={{ background: 'linear-gradient(135deg, var(--primary-1), var(--primary-2))', color: '#0d0a04' }}>
                        {user?.first_name?.[0]?.toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold hidden sm:block" style={{ color: 'var(--txt)' }}>{user?.first_name}</span>
                      <svg className={`w-3 h-3 transition-transform hidden sm:block ${menuOpen ? 'rotate-180' : ''}`}
                        style={{ color: 'var(--txt-4)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                      </svg>
                    </button>
                    {menuOpen && <UserMenu user={user} onLogout={() => { logout(); navigate('/') }} onClose={() => setMenuOpen(false)} />}
                  </>
                ) : (
                  <Link to="/login" className="btn-primary btn-shimmer text-sm py-2 px-4">
                    {t.nav.login}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ══ BOTTOM NAV — premium sliding blob ══════════════ */}
      <BottomNav items={navItems} isActive={isActive} dark={dark} />
    </>
  )
}

// ══════════════════════════════════════════════════════════
// PREMIUM BOTTOM NAV — blob glissant + spring animation
// ══════════════════════════════════════════════════════════
function BottomNav({ items, isActive, dark }) {
  const navRef      = useRef(null)
  const itemRefs    = useRef([])
  const isFirst     = useRef(true)
  const [blob, setBlob]       = useState({ left: 0, width: 64, ready: false })
  const [ripple, setRipple]   = useState(null)
  const [hoveredIdx, setHoveredIdx] = useState(null)

  const activeIdx = items.findIndex(item => isActive(item.to))

  // Recalcule la position du blob sous l'item actif
  const updateBlob = (animate) => {
    const el   = itemRefs.current[activeIdx]
    const nav  = navRef.current
    if (!el || !nav) return
    const navRect = nav.getBoundingClientRect()
    const elRect  = el.getBoundingClientRect()
    setBlob({
      left:  elRect.left - navRect.left,
      width: elRect.width,
      ready: true,
      animate,
    })
  }

  // Premier rendu : positionner sans animation
  useLayoutEffect(() => {
    updateBlob(false)
    const t = setTimeout(() => { isFirst.current = false }, 50)
    return () => clearTimeout(t)
  }, [])

  // Changement d'item actif : animation spring
  // Double recalcul : immédiat + après l'animation d'expansion (450ms)
  useEffect(() => {
    if (isFirst.current) return
    updateBlob(true)
    const t = setTimeout(() => updateBlob(true), 480)
    return () => clearTimeout(t)
  }, [activeIdx, items.length])

  // Recalcul sur resize (pas d'animation pour éviter le glitch)
  useEffect(() => {
    const onResize = () => updateBlob(false)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [activeIdx])

  // Reset hover quand la route change
  useEffect(() => { setHoveredIdx(null) }, [activeIdx])

  const handleClick = (e) => {
    setHoveredIdx(null)
    const rect = e.currentTarget.getBoundingClientRect()
    setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top, id: Date.now() })
    setTimeout(() => setRipple(null), 600)
  }

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up select-none"
      style={{ pointerEvents: 'none', animationDelay: '0.2s', animationFillMode: 'both' }}>

      {/* Halo glow derrière la nav */}
      <div style={{
        position: 'absolute', inset: '-8px',
        borderRadius: '9999px',
        background: dark
          ? 'radial-gradient(ellipse, rgba(255,107,53,0.18) 0%, transparent 70%)'
          : 'radial-gradient(ellipse, rgba(255,107,53,0.10) 0%, transparent 70%)',
        filter: 'blur(12px)',
        pointerEvents: 'none',
        zIndex: -1,
      }} />

      <nav ref={navRef}
        style={{
          pointerEvents: 'all',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          padding: '5px',
          borderRadius: '9999px',
          background: dark
            ? 'rgba(15,17,23,0.94)'
            : 'rgba(255,251,248,0.96)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: dark
            ? '1px solid rgba(255,107,53,0.16)'
            : '1px solid rgba(255,107,53,0.14)',
          boxShadow: dark
            ? '0 12px 48px rgba(0,0,0,0.55), 0 2px 8px rgba(255,107,53,0.12), inset 0 1px 0 rgba(255,255,255,0.05)'
            : '0 8px 32px rgba(255,107,53,0.10), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
        }}>

        {/* ── Blob glissant ──────────────────────────────── */}
        {blob.ready && (
          <div style={{
            position: 'absolute',
            top: 5,
            left: blob.left,
            width: blob.width,
            height: 'calc(100% - 10px)',
            borderRadius: '9999px',
            background: 'linear-gradient(135deg, #FF6B35 0%, #E8521A 60%, #FF5533 100%)',
            boxShadow: '0 4px 20px rgba(255,107,53,0.50), 0 0 0 1px rgba(255,107,53,0.30)',
            transition: blob.animate
              ? 'left 0.45s cubic-bezier(0.34,1.56,0.64,1), width 0.45s cubic-bezier(0.34,1.56,0.64,1)'
              : 'none',
            zIndex: 0,
            pointerEvents: 'none',
            // Shimmer interne
            overflow: 'hidden',
          }}>
            {/* Shimmer sweep */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.20) 50%, transparent 65%)',
              backgroundSize: '200% 100%',
              animation: 'shimmerBlob 2.5s ease infinite',
            }} />
          </div>
        )}

        {/* ── Items ──────────────────────────────────────── */}
        {items.map((item, i) => {
          const active = isActive(item.to)
          return (
            <Link
              key={item.to}
              ref={el => { itemRefs.current[i] = el }}
              to={item.to}
              onClick={handleClick}
              style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: active ? '0.35rem' : 0,
                padding: active ? '0.5rem 1rem' : '0.5rem 0.85rem',
                borderRadius: '9999px',
                color: active
                  ? '#ffffff'
                  : hoveredIdx === i
                    ? (item.accent || (dark ? 'rgba(255,248,245,0.95)' : '#E8521A'))
                    : (item.accent || (dark ? 'rgba(255,248,245,0.45)' : 'rgba(160,85,106,0.65)')),
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'padding 0.45s cubic-bezier(0.34,1.56,0.64,1), gap 0.45s cubic-bezier(0.34,1.56,0.64,1), color 0.2s ease',
              }}
              onMouseEnter={() => { if (!active) setHoveredIdx(i) }}
              onMouseLeave={() => setHoveredIdx(null)}>

              {/* Ripple */}
              {ripple && active && (
                <span style={{
                  position: 'absolute',
                  left: ripple.x, top: ripple.y,
                  width: 6, height: 6,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.5)',
                  transform: 'translate(-50%,-50%) scale(0)',
                  animation: 'rippleEffect 0.6s ease-out forwards',
                  pointerEvents: 'none',
                  overflow: 'hidden',
                  zIndex: 2,
                }} />
              )}

              {/* Badge notif */}
              {item.badge && (
                <span style={{
                  position: 'absolute', top: 2, right: active ? 6 : 4,
                  width: '1rem', height: '1rem',
                  borderRadius: '50%',
                  background: '#FF6B35',
                  color: 'white',
                  fontSize: '0.5rem',
                  fontWeight: 900,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid ' + (dark ? '#0F1117' : '#ffffff'),
                  zIndex: 3,
                  boxShadow: '0 0 8px rgba(255,107,53,0.6)',
                }}>
                  {item.badge}
                </span>
              )}

              {/* Icon */}
              <span style={{
                fontSize: active ? '1.25rem' : '1.15rem',
                lineHeight: 1,
                display: 'block',
                transition: 'font-size 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                filter: active ? 'drop-shadow(0 0 6px rgba(255,255,255,0.4))' : 'none',
              }}>
                {item.icon}
              </span>

              {/* Label — visible UNIQUEMENT sur l'item actif */}
              {active && (
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.01em',
                  whiteSpace: 'nowrap',
                  color: '#ffffff',
                  animation: 'fadeInLeft 0.2s ease forwards',
                }}>
                  {item.label}
                </span>
              )}

              {/* Tooltip au hover sur item inactif */}
              {!active && hoveredIdx === i && (
                <span style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 10px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: dark ? 'rgba(15,17,23,0.95)' : 'rgba(255,251,248,0.97)',
                  border: '1px solid rgba(255,107,53,0.25)',
                  color: dark ? 'rgba(255,248,245,0.92)' : '#E8521A',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  letterSpacing: '0.03em',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '0.6rem',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.20)',
                  pointerEvents: 'none',
                  zIndex: 10,
                  animation: 'tooltipFadeIn 0.15s ease forwards',
                }}>
                  {item.label}
                  {/* Petite flèche vers le bas */}
                  <span style={{
                    position: 'absolute',
                    bottom: '-5px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0, height: 0,
                    borderLeft: '5px solid transparent',
                    borderRight: '5px solid transparent',
                    borderTop: `5px solid ${dark ? 'rgba(15,17,23,0.95)' : 'rgba(255,251,248,0.97)'}`,
                  }} />
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Keyframes locaux */}
      <style>{`
        @keyframes shimmerBlob {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes rippleEffect {
          to { transform: translate(-50%,-50%) scale(18); opacity: 0; }
        }
        @keyframes tooltipFadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(4px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  )
}
