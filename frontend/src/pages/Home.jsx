import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { propertyAPI, bookingAPI, userAPI, wishlistAPI, serviceAPI, CITY_IMAGES, getPropertyImage } from '../services/api'
import { useLanguage } from '../context/LanguageContext'
import PropertyCard from '../components/PropertyCard'
import ScrollReveal from '../components/ScrollReveal'
import FloatingParticles from '../components/FloatingParticles'
import CityAutocomplete from '../components/CityAutocomplete'
import CompareBar from '../components/CompareBar'
import { useAuth } from '../context/AuthContext'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useCountUp } from '../hooks/useCountUp'
import { useRecentlyViewed } from '../hooks/useRecentlyViewed'
import { useTypeWriter } from '../hooks/useTypeWriter'

// ─── Stat card animée ───────────────────────────────────────
function AnimatedStat({ n, l, e }) {
  const [ref, visible] = useScrollReveal()
  const numericVal = parseInt(n.replace(/[^0-9]/g, '')) || 0
  const count = useCountUp(numericVal, 1400, visible)
  const suffix = n.replace(/[0-9]/g, '')
  return (
    <div ref={ref} className="glass p-6 text-center hover:scale-105 transition-all duration-300 group">
      <div className="text-3xl mb-2">{e}</div>
      <div className="text-3xl font-black gradient-text">{visible ? `${count}${suffix}` : '0'}</div>
      <div className="text-xs mt-1" style={{ color: 'var(--txt-3)' }}>{l}</div>
    </div>
  )
}

const CITIES = [
  { name: 'Paris',      emoji: '🗼', img: CITY_IMAGES.Paris },
  { name: 'Nice',       emoji: '🌊', img: CITY_IMAGES.Nice },
  { name: 'Lyon',       emoji: '🦁', img: CITY_IMAGES.Lyon },
  { name: 'Bordeaux',   emoji: '🍷', img: CITY_IMAGES.Bordeaux },
  { name: 'Marseille',  emoji: '⚓', img: CITY_IMAGES.Marseille },
  { name: 'Chamonix',   emoji: '🏔', img: CITY_IMAGES.Chamonix },
  { name: 'Biarritz',   emoji: '🏄', img: CITY_IMAGES.Biarritz },
  { name: 'Strasbourg', emoji: '🥨', img: CITY_IMAGES.Strasbourg },
]

// ════════════════════════════════════════════════════════════
// ── Widget IA (section home) ────────────────────────────────
function AISearchWidget() {
  const PHRASES = [
    '"Je veux une vue sur mer"',
    '"Escapade romantique 2 nuits"',
    '"Chalet montagne famille 5 pers."',
    '"Budget 400 € télétravail"',
    '"Maison avec piscine privée"',
  ]
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % PHRASES.length), 2800)
    return () => clearInterval(t)
  }, [])

  return (
    <section className="py-14 px-4" style={{ background: 'linear-gradient(135deg, rgba(255,107,53,0.06), rgba(255,200,87,0.04))', borderBottom: '1px solid var(--border)' }}>
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
          style={{ background: 'rgba(255,107,53,0.12)', color: 'var(--primary-1)', border: '1px solid rgba(255,107,53,0.25)' }}>
          🤖 Intelligence artificielle
        </div>
        <h2 className="font-display text-3xl md:text-4xl font-black mb-3" style={{ color: 'var(--txt)' }}>
          Recherche par <span className="gradient-text">ambiance</span>
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--txt-3)' }}>
          Décrivez votre voyage en langage naturel. L'IA trouve les logements qui correspondent.
        </p>
        <div className="glass-card p-5 max-w-xl mx-auto mb-6"
          style={{ border: '1px solid rgba(255,107,53,0.2)' }}>
          <div className="text-sm font-medium mb-3 text-left" style={{ color: 'var(--txt-3)' }}>
            💬 Exemples de recherches :
          </div>
          <div className="text-base font-semibold min-h-[1.5rem] transition-all duration-500 text-left gradient-text">
            {PHRASES[idx]}
          </div>
        </div>
        <Link to="/ai" className="btn-primary btn-shimmer px-8 py-3 text-base inline-flex items-center gap-2">
          🤖 Essayer l'assistant IA
        </Link>
      </div>
    </section>
  )
}

// ── Prévisualisation des services (section transversale) ────
const SERVICE_CATS = [
  { id: 'wellness',      icon: '🛁', label: 'Bien-être',      color: '#10b981' },
  { id: 'gastronomy',    icon: '👨‍🍳', label: 'Gastronomie',    color: '#f59e0b' },
  { id: 'adventure',     icon: '🏄', label: 'Aventure',       color: '#3b82f6' },
  { id: 'culture',       icon: '🎭', label: 'Culture',        color: '#8b5cf6' },
  { id: 'sport',         icon: '⚽', label: 'Sport',          color: '#06b6d4' },
  { id: 'entertainment', icon: '🎮', label: 'Divertissement', color: '#ec4899' },
  { id: 'transport',     icon: '🚗', label: 'Transport',      color: '#64748b' },
  { id: 'nature',        icon: '🌿', label: 'Nature',         color: '#16a34a' },
]

function ServicesPreview() {
  const [services, setServices] = useState([])

  useEffect(() => {
    serviceAPI.getAll({ limit: 4 })
      .then(r => setServices((r.data || []).slice(0, 4)))
      .catch(() => {})
  }, [])

  if (services.length === 0) return null

  return (
    <section className="py-16 px-4" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="label-hotel mb-2">Expériences exclusives</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold" style={{ color: 'var(--txt)' }}>
              Services & <span className="gradient-text">Activités</span>
            </h2>
          </div>
          <Link to="/services" className="btn-ghost-gold hidden md:inline-flex shrink-0">
            Voir tout →
          </Link>
        </div>

        {/* Catégories pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {SERVICE_CATS.map(c => (
            <Link key={c.id} to={`/services`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold transition-all hover:scale-105"
              style={{ background: c.color + '15', color: c.color, border: `1px solid ${c.color}30` }}>
              {c.icon} {c.label}
            </Link>
          ))}
        </div>

        {/* Preview cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((s, i) => {
            const cat = SERVICE_CATS.find(c => c.id === s.category) || SERVICE_CATS[0]
            return (
              <ScrollReveal key={s.id} variant="fadeUp" delay={i * 60}>
                <Link to="/services" className="glass-card overflow-hidden group block hover:scale-[1.02] transition-all">
                  <div className="relative h-40 overflow-hidden">
                    <img src={s.image_url} alt={s.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={e => { e.target.src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ background: cat.color + '22', color: cat.color, border: `1px solid ${cat.color}44`, backdropFilter: 'blur(4px)' }}>
                      {cat.icon} {cat.label}
                    </div>
                    <div className="absolute bottom-2 left-3 right-3">
                      <p className="font-bold text-sm line-clamp-1"
                        style={{ color: 'rgba(255,255,255,0.90)', textShadow: '0 1px 8px rgba(0,0,0,0.70)' }}>
                        {s.title}
                      </p>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-sm mb-2 line-clamp-1" style={{ color: 'var(--txt)' }}>{s.title}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-black gradient-text">{parseFloat(s.price).toFixed(0)} €</p>
                        <p className="text-xs" style={{ color: 'var(--txt-4)' }}>par personne</p>
                      </div>
                      {s.rating && <span className="text-xs font-bold" style={{ color: '#FFC857' }}>★ {s.rating}</span>}
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            )
          })}
        </div>

        <div className="text-center mt-8">
          <Link to="/services" className="btn-ghost-gold md:hidden">Voir tous les services →</Link>
        </div>
      </div>
    </section>
  )
}

// ════════════════════════════════════════════════════════════
// HOME INVITÉ (non connecté)
// ════════════════════════════════════════════════════════════
// Les labels TYPE_TABS sont rendus via t.hero.xxx dans le composant

const POPULAR_CITIES = ['Paris', 'London', 'Barcelona', 'New York', 'Rome', 'Tokyo', 'Dubai', 'Marrakech']

function GuestHome() {
  const [cityFilter, setCityFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [allProps,   setAllProps]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [totalProps, setTotalProps] = useState(null)
  const navigate = useNavigate()
  const { t, lang } = useLanguage()
  const typed = useTypeWriter(t.hero.phrases, 70, 2600)

  const [cityExamples, setCityExamples] = useState({}) // { cityName: property }

  useEffect(() => {
    propertyAPI.getAll({ limit: 24 })
      .then(r => {
        const data = Array.isArray(r.data) ? r.data : []
        setAllProps(data)
        const total = r.headers?.['x-total-count']
        if (total) setTotalProps(parseInt(total))
        // Indexer un exemple de logement par ville
        const examples = {}
        data.forEach(p => {
          if (p.city && !examples[p.city]) examples[p.city] = p
        })
        setCityExamples(examples)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Filtrage LOCAL — aucune navigation
  const filtered = allProps.filter(p => {
    const matchCity = !cityFilter || p.city?.toLowerCase().includes(cityFilter.toLowerCase())
    const matchType = !typeFilter || p.property_type === typeFilter
    return matchCity && matchType
  })

  const hasFilter = cityFilter || typeFilter

  const handleSearch = (e) => {
    e.preventDefault()
    // Le bouton Rechercher → va sur /search uniquement si l'utilisateur veut la vue complète
    const params = new URLSearchParams()
    if (cityFilter) params.set('city', cityFilter)
    if (typeFilter) params.set('type', typeFilter)
    navigate(`/search${params.toString() ? '?' + params.toString() : ''}`)
  }

  return (
    <div className="pt-16">

      {/* HERO */}
      <section className="hero-gradient min-h-screen flex items-end justify-center relative overflow-hidden pb-24">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none animate-pulse-slow"
          style={{ background: 'radial-gradient(circle, rgba(255,107,53,0.10), transparent)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none animate-pulse-slow"
          style={{ background: 'radial-gradient(circle, rgba(255,107,53,0.08), transparent)', animationDelay: '3s' }} />

        <div className="absolute top-0 left-0 right-0 flex flex-col items-center pt-28 px-4 text-center z-10">
          <div className="inline-flex items-center gap-3 mb-8 animate-fade-in-up">
            <div className="h-px w-8" style={{ background: 'var(--primary-1)' }} />
            <span className="font-semibold" style={{ color: 'var(--primary-1)', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase' }}>
              {totalProps ? `${totalProps}+ logements · 🌍 Monde` : t.hero.badge}
            </span>
            <div className="h-px w-8" style={{ background: 'var(--primary-1)' }} />
          </div>
          <h1 className="text-white mb-3 leading-none animate-fade-in-up font-display"
            style={{ fontSize: 'clamp(2.8rem,7vw,5.5rem)', fontWeight: 600, animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
            {t.hero.title1}
          </h1>
          <h1 className="mb-8 leading-none animate-fade-in-up font-display"
            style={{ fontSize: 'clamp(2.8rem,7vw,5.5rem)', fontWeight: 600, animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
            <span className="gradient-text">{typed || ' '}</span>
            <span className="typewriter-cursor" />
          </h1>
          <p className="hero-subtitle max-w-xl mx-auto mb-12 animate-fade-in-up"
            style={{ color: 'rgba(240,244,248,0.65)', fontSize: '1.05rem', animationDelay: '0.3s', opacity: 0, animationFillMode: 'forwards' }}>
            {t.hero.subtitle}
          </p>
        </div>

        <div className="relative z-10 w-full max-w-4xl px-4">
          <form onSubmit={handleSearch}
            className="hero-search-form rounded-2xl shadow-2xl animate-fade-in-up"
            style={{
              background: 'rgba(13,13,28,0.88)', backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,107,53,0.25)',
              animationDelay: '0.4s', opacity: 0, animationFillMode: 'forwards',
              boxShadow: '0 32px 80px rgba(0,0,0,0.55)',
              position: 'relative', zIndex: 30,
            }}>
            <div className="hero-search-divider grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x"
              style={{ borderColor: 'rgba(255,107,53,0.12)' }}>
              {/* Destination */}
              <div className="md:col-span-2 p-5 flex items-center gap-3">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--primary-1)', flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="flex-1">
                  <p style={{ color: 'var(--primary-1)', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '2px' }}>{t.hero.destination}</p>
                  <CityAutocomplete
                    value={cityFilter}
                    onChange={setCityFilter}
                    placeholder={lang === 'en' ? 'Paris, London, New York, Tokyo...' : lang === 'de' ? 'Paris, London, New York, Tokio...' : lang === 'ar' ? 'باريس، لندن، نيويورك...' : 'Paris, Londres, New York, Tokyo...'}
                  />
                </div>
                {cityFilter && (
                  <button type="button" onClick={() => setCityFilter('')}
                    className="text-lg opacity-50 hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--txt-3)' }}>✕</button>
                )}
              </div>
              {/* Type — filtre LOCAL */}
              <div className="p-5 flex items-center gap-3">
                <span style={{ color: 'var(--primary-1)', flexShrink: 0 }}>🏠</span>
                <div className="flex-1">
                  <p style={{ color: 'var(--primary-1)', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '2px' }}>{t.hero.type}</p>
                  <select
                    value={typeFilter}
                    className="w-full bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
                    style={{ color: typeFilter ? 'var(--primary-1)' : 'var(--txt-2)' }}
                    onChange={e => setTypeFilter(e.target.value)}>
                    <option value="">🌟 {t.hero.allTypes}</option>
                    <option value="studio">🏠 {t.hero.studio}</option>
                    <option value="apartment">🏢 {t.hero.apartment}</option>
                    <option value="house">🏡 {t.hero.house}</option>
                    <option value="villa">🌴 {t.hero.villa}</option>
                  </select>
                </div>
              </div>
              {/* Bouton */}
              <div className="p-3 flex items-center">
                <button type="submit" className="w-full btn-shimmer font-bold tracking-wide rounded-xl flex items-center justify-center gap-2 transition-all"
                  style={{ background: 'linear-gradient(135deg, var(--primary-1), var(--primary-2))', color: '#ffffff', minHeight: '52px', boxShadow: '0 6px 20px var(--gold-glow)' }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {t.hero.search}
                </button>
              </div>
            </div>
          </form>

          {/* Villes populaires — filtre local */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5 animate-fade-in-up"
            style={{ animationDelay: '0.5s', opacity: 0, animationFillMode: 'forwards' }}>
            <span className="hero-label-txt" style={{ fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--primary-1)', opacity: 0.7 }}>{t.hero.popular} :</span>
            {POPULAR_CITIES.map(c => (
              <button key={c} type="button"
                onClick={() => setCityFilter(prev => prev === c ? '' : c)}
                className="hero-popular-btn text-xs py-1.5 px-4 rounded-full border transition-all hover:scale-105"
                style={cityFilter === c
                  ? { background: 'var(--primary-1)', borderColor: 'var(--primary-1)', color: '#ffffff', fontWeight: 700 }
                  : { background: 'rgba(255,107,53,0.08)', borderColor: 'rgba(255,107,53,0.18)', color: 'rgba(240,244,248,0.70)' }}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-25">
          <div className="w-5 h-8 rounded-full border" style={{ borderColor: 'rgba(255,107,53,0.5)' }}>
            <div className="w-1 h-1.5 rounded-full mx-auto mt-1.5 animate-bounce" style={{ background: 'var(--primary-1)' }} />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              { n: totalProps ? (totalProps + '+') : '30+', l: lang === 'en' ? 'Available listings' : lang === 'de' ? 'Verfügbare Unterkünfte' : lang === 'ar' ? 'إقامات متاحة' : 'Logements disponibles', e: '🏠' },
              { n: '100+', l: lang === 'en' ? 'Cities worldwide' : lang === 'de' ? 'Städte weltweit' : lang === 'ar' ? 'مدينة حول العالم' : 'Villes dans le monde', e: '🌍' },
              { n: '4',    l: lang === 'en' ? 'Stay types' : lang === 'de' ? 'Unterkunftsarten' : lang === 'ar' ? 'أنواع الإقامة' : 'Types de séjour', e: '🏡' },
              { n: '99+',  l: lang === 'en' ? 'Happy travelers' : lang === 'de' ? 'Zufriedene Reisende' : lang === 'ar' ? 'مسافر سعيد' : 'Voyageurs satisfaits', e: '✈️' },
            ].map((s, i) => (
              <div key={s.l} className="py-10 px-6 text-center"
                style={{ borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
                <AnimatedStat n={s.n} l={s.l} e={s.e} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DESTINATIONS */}
      <section className="py-16 px-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <p className="label-hotel mb-2">{t.home.destInspiration}</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold" style={{ color: 'var(--txt)' }}>
              {t.home.destTitle.split(t.home.destTitleSub)[0]}
              <span className="gradient-text">{t.home.destTitleSub}</span>
              {t.home.destTitle.split(t.home.destTitleSub)[1]}
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {CITIES.map((city, i) => {
              const ex = cityExamples[city.name]
              const img = ex ? getPropertyImage(ex) : city.img
              return (
                <ScrollReveal key={city.name} variant="fadeUp" delay={i * 60}>
                  <button
                    type="button"
                    onClick={() => setCityFilter(city.name)}
                    className="relative overflow-hidden rounded-2xl group w-full text-left"
                    style={{ aspectRatio: '4/3' }}>
                    <img
                      src={img}
                      alt={city.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={e => { e.target.src = city.img }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    {/* Badge logement exemple */}
                    {ex && (
                      <div className="absolute top-2 right-2 text-xs px-2 py-1 rounded-full font-semibold"
                        style={{ background: 'rgba(255,107,53,0.85)', color: '#fff', backdropFilter: 'blur(4px)' }}>
                        {ex.price_per_night ? `${parseFloat(ex.price_per_night).toFixed(0)} €/${t.home.night}` : t.home.available}
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <div className="text-lg mb-0.5">{city.emoji}</div>
                      <div className="text-white font-black text-base leading-tight">{city.name}</div>
                      {ex ? (
                        <div className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.75)' }}>
                          {ex.title}
                        </div>
                      ) : (
                        <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.50)' }}>
                          {t.home.explore}
                        </div>
                      )}
                    </div>
                    {cityFilter === city.name && (
                      <div className="absolute inset-0 border-2 rounded-2xl" style={{ borderColor: 'var(--primary-1)' }} />
                    )}
                  </button>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* WIDGET IA */}
      <AISearchWidget />

      {/* SERVICES & ACTIVITÉS */}
      <ServicesPreview />

      {/* LOGEMENTS — filtrés en place */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Header + tabs type */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <p className="label-hotel mb-2">
                {hasFilter ? t.home.filteredLabel : t.home.prestige}
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold" style={{ color: 'var(--txt)' }}>
                {hasFilter
                  ? <><span className="gradient-text">{filtered.length}</span> {filtered.length !== 1 ? t.home.featured : t.home.featured}</>
                  : <>{t.home.featured} <span className="gradient-text">{t.home.featuredSub}</span></>
                }
              </h2>
            </div>
            <Link to="/search" className="btn-ghost-gold hidden md:inline-flex shrink-0">{t.home.viewAll}</Link>
          </div>

          {/* Onglets type — filtrage instantané */}
          <div className="flex flex-wrap gap-2 mb-8">
            {[
              { value: '',          label: t.hero.allTypes,  icon: '🌟' },
              { value: 'studio',    label: t.hero.studio,    icon: '🏠' },
              { value: 'apartment', label: t.hero.apartment, icon: '🏢' },
              { value: 'house',     label: t.hero.house,     icon: '🏡' },
              { value: 'villa',     label: t.hero.villa,     icon: '🌴' },
            ].map(tab => (
              <button key={tab.value} type="button"
                onClick={() => setTypeFilter(tab.value)}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold transition-all hover:scale-105"
                style={typeFilter === tab.value ? {
                  background: 'linear-gradient(135deg, var(--primary-1), var(--primary-2))',
                  color: '#ffffff',
                  boxShadow: '0 4px 14px rgba(255,107,53,0.30)',
                } : {
                  background: 'var(--surface)',
                  border: '1px solid var(--border-2)',
                  color: 'var(--txt-2)',
                }}>
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.value && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full" style={{
                    background: typeFilter === tab.value ? 'rgba(255,255,255,0.25)' : 'var(--surface-2)',
                    color: typeFilter === tab.value ? 'white' : 'var(--txt-4)',
                  }}>
                    {allProps.filter(p => p.property_type === tab.value).length}
                  </span>
                )}
              </button>
            ))}
            {hasFilter && (
              <button type="button" onClick={() => { setCityFilter(''); setTypeFilter('') }}
                className="px-4 py-2 rounded-2xl text-sm font-semibold transition-all hover:scale-105"
                style={{ background: 'rgba(255,107,53,0.10)', color: 'var(--primary-1)', border: '1px solid rgba(255,107,53,0.25)' }}>
                {t.home.resetFilters}
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card h-72 animate-pulse">
                  <div className="h-48 rounded-t-xl" style={{ background: 'var(--surface-2)' }} />
                </div>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p, i) => (
                <ScrollReveal key={p.id} variant="fadeUp" delay={i * 80}>
                  <PropertyCard property={p} />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="glass p-16 text-center rounded-2xl animate-zoom-in" style={{ border: '1px solid var(--border-2)' }}>
              <div className="text-5xl mb-4">{typeFilter ? '🔍' : '🏨'}</div>
              <p className="font-bold text-lg mb-2" style={{ color: 'var(--txt)' }}>
                {hasFilter ? t.home.noFilterResult : t.home.noResults}
              </p>
              <p className="text-sm mb-6" style={{ color: 'var(--txt-3)' }}>
                {hasFilter ? t.home.noFilterSub : t.home.noResultsSub}
              </p>
              {hasFilter
                ? <button onClick={() => { setCityFilter(''); setTypeFilter('') }} className="btn-primary inline-flex px-6 py-2.5">
                    {t.home.resetFilters}
                  </button>
                : <Link to="/search" className="btn-ghost-gold inline-flex">{t.home.explore}</Link>
              }
            </div>
          )}

          {/* Voir tout — mobile */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <Link to="/search" className="btn-ghost-gold">
              {t.home.viewAllBtn}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}


// ════════════════════════════════════════════════════════════
// HOME VOYAGEUR (rôle: guest/traveler)
// ════════════════════════════════════════════════════════════
const STATUS_STYLE_T = {
  pending:   { bg: 'rgba(255,200,87,0.15)',  color: '#FFC857',  label: '⏳ En attente' },
  confirmed: { bg: 'rgba(0,184,217,0.15)',   color: '#00B8D9',  label: '✅ Confirmée' },
  completed: { bg: 'rgba(16,185,129,0.15)',  color: '#10b981',  label: '🏁 Terminée' },
  cancelled: { bg: 'rgba(255,107,53,0.15)',  color: '#FF6B35',  label: '❌ Annulée' },
}

function TravelerHome() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab,  setActiveTab]  = useState('explore')
  const [featured,   setFeatured]   = useState([])
  const [bookings,   setBookings]   = useState([])
  const [wishlist,   setWishlist]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [searchQ,    setSearchQ]    = useState('')
  const { items: recentlyViewed } = useRecentlyViewed()

  useEffect(() => {
    Promise.all([
      propertyAPI.getAll({ limit: 18 }),
      bookingAPI.getAll().catch(() => ({ data: [] })),
      wishlistAPI.getAll().catch(() => ({ data: [] })),
    ]).then(([propRes, bookRes, wishRes]) => {
      setFeatured(Array.isArray(propRes.data) ? propRes.data : [])
      setBookings(Array.isArray(bookRes.data) ? bookRes.data : [])
      setWishlist(Array.isArray(wishRes.data) ? wishRes.data : [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const upcoming = bookings
    .filter(b => b.booking_status === 'confirmed' && new Date(b.start_date) > new Date())
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
    .slice(0, 1)[0]

  const fmtDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

  const filteredProps = featured.filter(p =>
    !searchQ || p.title?.toLowerCase().includes(searchQ.toLowerCase())
      || p.city?.toLowerCase().includes(searchQ.toLowerCase())
  )

  const TABS = [
    { id: 'explore',   icon: '🔍', label: 'Explorer',       count: null },
    { id: 'wishlist',  icon: '❤️', label: 'Mes favoris',    count: wishlist.length },
    { id: 'bookings',  icon: '📅', label: 'Mes réservations', count: bookings.length },
    { id: 'recent',    icon: '🕒', label: 'Vus récemment',  count: recentlyViewed.length },
  ]

  return (
    <div className="pt-20 pb-16 px-4">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ─── Bannière ─── */}
        <div className="relative overflow-hidden rounded-3xl p-6 md:p-10"
          style={{ background: 'linear-gradient(135deg, rgba(255,107,53,0.10), rgba(255,200,87,0.08), rgba(0,184,217,0.08))' }}>
          <div className="absolute top-0 right-0 w-56 h-56 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"
            style={{ background: 'radial-gradient(circle, rgba(255,107,53,0.18), transparent)' }} />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-13 h-13 w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0"
                style={{ background: 'linear-gradient(135deg, var(--primary-1), var(--secondary))' }}>
                {user?.first_name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--txt-3)' }}>Bon retour parmi nous</p>
                <h1 className="text-xl md:text-2xl font-black" style={{ color: 'var(--txt)' }}>
                  Bonjour, <span className="gradient-text">{user?.first_name}</span> ! ✈️
                </h1>
              </div>
            </div>

            {/* Prochain séjour inline si existe */}
            {upcoming && (
              <div className="flex items-center gap-3 p-3 rounded-2xl mb-4"
                style={{ background: 'rgba(0,184,217,0.10)', border: '1px solid rgba(0,184,217,0.20)' }}>
                {upcoming.property && (
                  <img src={getPropertyImage(upcoming.property)} alt=""
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                    onError={e => { e.target.style.display = 'none' }} />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate" style={{ color: 'var(--txt)' }}>
                    📅 {upcoming.property?.title || 'Votre prochain séjour'}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--txt-3)' }}>
                    {fmtDate(upcoming.start_date)} → {fmtDate(upcoming.end_date)} · {upcoming.property?.city}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full shrink-0 font-semibold"
                  style={{ background: 'rgba(0,184,217,0.15)', color: '#00B8D9' }}>✅ Confirmée</span>
              </div>
            )}

            {/* Stats mini */}
            <div className="flex gap-3 flex-wrap">
              {[
                { icon: '📅', val: bookings.length,   label: 'Réservations', color: '#FFC857'  },
                { icon: '❤️', val: wishlist.length,    label: 'Favoris',      color: '#FF6B35'  },
                { icon: '🏠', val: recentlyViewed.length, label: 'Consultés', color: '#00B8D9'  },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid var(--border)' }}>
                  <span className="text-base">{s.icon}</span>
                  <span className="font-black text-sm" style={{ color: s.color }}>{loading ? '…' : s.val}</span>
                  <span className="text-xs" style={{ color: 'var(--txt-3)' }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Onglets — restent toujours visibles ─── */}
        <div className="glass-card p-1.5 flex gap-1 w-full overflow-x-auto scrollbar-hide">
          {TABS.map(tab => (
            <button key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap min-w-0"
              style={activeTab === tab.id ? {
                background: 'linear-gradient(135deg, var(--primary-1), var(--primary-2))',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(255,107,53,0.30)',
              } : {
                color: 'var(--txt-3)',
                background: 'transparent',
              }}>
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.count !== null && tab.count > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                  style={{
                    background: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : 'var(--surface-2)',
                    color: activeTab === tab.id ? 'white' : 'var(--txt-4)',
                  }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─── Contenu de l'onglet actif ─── */}
        <div className="animate-fade-in-up">

          {/* ── Explorer ── */}
          {activeTab === 'explore' && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  placeholder="🔍 Rechercher un logement, une ville..."
                  className="input-field flex-1" />
                {searchQ && (
                  <button onClick={() => setSearchQ('')}
                    className="btn-secondary py-2.5 px-4 text-sm shrink-0">✕</button>
                )}
                <Link to={`/search${searchQ ? `?city=${encodeURIComponent(searchQ)}` : ''}`}
                  className="btn-primary btn-shimmer py-2.5 px-5 text-sm shrink-0">
                  Recherche avancée →
                </Link>
              </div>
              {/* Villes rapides */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {CITIES.slice(0, 6).map(c => (
                  <button key={c.name} onClick={() => setSearchQ(c.name)}
                    className="relative overflow-hidden rounded-2xl shrink-0 group h-20 w-32"
                    style={searchQ === c.name ? { ring: '2px solid var(--primary-1)' } : {}}>
                    <img src={c.img} alt={c.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-2 left-0 right-0 text-center">
                      <div className="text-sm">{c.emoji}</div>
                      <div className="text-white font-bold text-xs">{c.name}</div>
                    </div>
                    {searchQ === c.name && (
                      <div className="absolute inset-0 border-2 rounded-2xl" style={{ borderColor: 'var(--primary-1)' }} />
                    )}
                  </button>
                ))}
              </div>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[...Array(6)].map((_, i) => <div key={i} className="glass-card h-64 animate-pulse" />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredProps.map((p, i) => (
                    <ScrollReveal key={p.id} variant="fadeUp" delay={i * 50}>
                      <PropertyCard property={p} />
                    </ScrollReveal>
                  ))}
                  {filteredProps.length === 0 && (
                    <div className="col-span-3 glass p-12 text-center rounded-2xl">
                      <p className="text-4xl mb-3">🔍</p>
                      <p className="font-bold" style={{ color: 'var(--txt)' }}>Aucun résultat pour "{searchQ}"</p>
                      <button onClick={() => setSearchQ('')} className="btn-primary mt-4 px-5 py-2 text-sm">
                        Voir tous les logements
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Favoris ── */}
          {activeTab === 'wishlist' && (
            <div>
              {wishlist.length === 0 ? (
                <div className="glass p-16 text-center rounded-2xl">
                  <p className="text-5xl mb-4">❤️</p>
                  <p className="font-bold text-lg mb-2" style={{ color: 'var(--txt)' }}>Aucun favori pour l'instant</p>
                  <p className="text-sm mb-6" style={{ color: 'var(--txt-3)' }}>Cliquez sur ❤️ sur un logement pour le sauvegarder ici.</p>
                  <button onClick={() => setActiveTab('explore')} className="btn-primary px-6 py-2.5">
                    🔍 Explorer les logements
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {wishlist.map((p, i) => (
                    <ScrollReveal key={p.id || p.property_id} variant="fadeUp" delay={i * 50}>
                      <PropertyCard property={p.property || p} />
                    </ScrollReveal>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Réservations ── */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="glass p-16 text-center rounded-2xl">
                  <p className="text-5xl mb-4">📅</p>
                  <p className="font-bold text-lg mb-2" style={{ color: 'var(--txt)' }}>Aucune réservation</p>
                  <p className="text-sm mb-6" style={{ color: 'var(--txt-3)' }}>Réservez votre premier séjour !</p>
                  <button onClick={() => setActiveTab('explore')} className="btn-primary px-6 py-2.5">
                    🔍 Explorer les logements
                  </button>
                </div>
              ) : bookings.map(b => {
                const st = STATUS_STYLE_T[b.booking_status] || STATUS_STYLE_T.pending
                const nights = Math.ceil((new Date(b.end_date) - new Date(b.start_date)) / 86400000)
                return (
                  <div key={b.id} className="glass-card p-5 flex items-center gap-4 flex-wrap">
                    {b.property && (
                      <img src={getPropertyImage(b.property)} alt=""
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                        onError={e => { e.target.style.display = 'none' }} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate" style={{ color: 'var(--txt)' }}>
                        {b.property?.title || 'Logement #' + b.property_id}
                      </p>
                      <p className="text-sm mt-0.5" style={{ color: 'var(--txt-3)' }}>
                        📍 {b.property?.city} · {fmtDate(b.start_date)} → {fmtDate(b.end_date)}
                        {nights > 0 && <span> · {nights} nuit{nights > 1 ? 's' : ''}</span>}
                      </p>
                      <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black gradient-text text-lg">{parseFloat(b.total_price || 0).toFixed(0)} €</p>
                      <Link to="/bookings" className="text-xs mt-1 block" style={{ color: 'var(--secondary)' }}>
                        Détails →
                      </Link>
                    </div>
                  </div>
                )
              })}
              {bookings.length > 0 && (
                <div className="text-center pt-2">
                  <Link to="/bookings" className="btn-secondary text-sm py-2 px-6">
                    Voir toutes les réservations →
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* ── Vus récemment ── */}
          {activeTab === 'recent' && (
            <div>
              {recentlyViewed.length === 0 ? (
                <div className="glass p-16 text-center rounded-2xl">
                  <p className="text-5xl mb-4">🕒</p>
                  <p className="font-bold text-lg mb-2" style={{ color: 'var(--txt)' }}>Rien de visité encore</p>
                  <p className="text-sm mb-6" style={{ color: 'var(--txt-3)' }}>Les logements que vous consultez apparaîtront ici.</p>
                  <button onClick={() => setActiveTab('explore')} className="btn-primary px-6 py-2.5">
                    🔍 Explorer
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {recentlyViewed.map((p, i) => (
                    <ScrollReveal key={p.id} variant="fadeUp" delay={i * 50}>
                      <PropertyCard property={p} />
                    </ScrollReveal>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>{/* fin animate-fade-in-up */}

        {/* ── Bannière Devenir hôte ── */}
        <div className="relative overflow-hidden rounded-3xl p-6 md:p-8"
          style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.10), rgba(255,200,87,0.08))' }}>
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.18), transparent)' }} />
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)' }}>
                🏠
              </div>
              <div>
                <p className="font-black text-base" style={{ color: 'var(--txt)' }}>Vous avez un logement à louer ?</p>
                <p className="text-sm mt-0.5" style={{ color: 'var(--txt-3)' }}>Devenez hôte et commencez à gagner de l'argent dès aujourd'hui.</p>
              </div>
            </div>
            <Link to="/profile"
              className="btn-primary btn-shimmer py-2.5 px-6 shrink-0 flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              🏠 Devenir hôte
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// HOME HÔTE
// ════════════════════════════════════════════════════════════
function HostHome() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [properties, setProperties] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      propertyAPI.getAll({ limit: 100 }),
      bookingAPI.getAll().catch(() => ({ data: [] })),
    ]).then(([propRes, bookRes]) => {
      const myProps = propRes.data.filter(p => p.owner_id === user?.id)
      const myPropIds = new Set(myProps.map(p => p.id))
      setProperties(myProps)
      setBookings(bookRes.data.filter(b => myPropIds.has(b.property_id)))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [user?.id])

  const pending = bookings.filter(b => b.booking_status === 'pending')
  const confirmed = bookings.filter(b => b.booking_status === 'confirmed')
  const totalRevenue = bookings
    .filter(b => b.booking_status !== 'cancelled')
    .reduce((s, b) => s + parseFloat(b.total_price || 0), 0)

  const fmtDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

  return (
    <div className="pt-20 pb-16 px-4">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ─── Bannière hôte ─── */}
        <div className="relative overflow-hidden rounded-3xl p-8 md:p-12"
          style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(255,140,0,0.08))' }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.18), transparent)' }} />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg"
                style={{ background: 'linear-gradient(135deg, #10b981, #FFC857)' }}>
                {user?.first_name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--txt-3)' }}>Espace hôte</p>
                <h1 className="text-2xl md:text-3xl font-black" style={{ color: 'var(--txt)' }}>
                  Bonjour, <span style={{ color: '#10b981' }}>{user?.first_name}</span> 🏠
                </h1>
              </div>
            </div>
            {pending.length > 0 && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}>
                ⏳ {pending.length} réservation{pending.length > 1 ? 's' : ''} en attente de validation
              </div>
            )}
            <div className="flex flex-wrap gap-3 mt-6">
              <Link to="/host?tab=properties" className="btn-primary btn-shimmer py-2.5 px-6"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                🏠 Gérer mes logements
              </Link>
              <Link to="/host?tab=bookings" className="btn-secondary py-2.5 px-5">📅 Réservations reçues</Link>
              <Link to="/search" className="btn-secondary py-2.5 px-5">🔍 Voir les annonces</Link>
            </div>
          </div>
        </div>

        {/* ─── Stats hôte ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🏠', val: properties.length, label: 'Logements',         color: '#10b981', link: '/host' },
            { icon: '⏳', val: pending.length,    label: 'En attente',         color: '#f59e0b', link: '/host' },
            { icon: '✅', val: confirmed.length,  label: 'Confirmées',         color: '#FFC857', link: '/host' },
            { icon: '💶', val: `${totalRevenue.toFixed(0)}€`, label: 'Revenus totaux', color: '#FF6B35', link: '/host' },
          ].map(s => (
            <Link key={s.label} to={s.link}
              className="glass-card p-5 text-center hover:scale-105 transition-all block">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-2xl font-black" style={{ color: s.color }}>{loading ? '…' : s.val}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--txt-3)' }}>{s.label}</div>
            </Link>
          ))}
        </div>

        {/* ─── Réservations en attente ─── */}
        {pending.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black" style={{ color: 'var(--txt)' }}>
                ⏳ À <span className="gradient-text">valider</span>
              </h2>
              <Link to="/host" className="btn-secondary text-sm py-2 px-4">Tout voir</Link>
            </div>
            <div className="space-y-3">
              {pending.slice(0, 3).map(b => (
                <div key={b.id} className="glass-card p-4 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-bold text-sm" style={{ color: 'var(--txt)' }}>
                      {b.property?.title || 'Logement en cours'}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--txt-3)' }}>
                      Voyageur #{b.guest_id} · {fmtDate(b.start_date)} → {fmtDate(b.end_date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black gradient-text">{parseFloat(b.total_price || 0).toFixed(0)} €</span>
                    <Link to="/host" className="btn-primary text-xs py-1.5 px-3">Répondre</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Mes logements ─── */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black" style={{ color: 'var(--txt)' }}>
              🏠 Mes <span className="gradient-text">logements</span>
            </h2>
            <Link to="/host" className="btn-secondary text-sm py-2 px-5">Gérer →</Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => <div key={i} className="glass-card h-56 animate-pulse" />)}
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.slice(0, 6).map((p, i) => (
                <ScrollReveal key={p.id} variant="fadeUp" delay={i * 70}>
                  <PropertyCard property={p} />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="glass-card p-12 text-center">
              <div className="text-5xl mb-4">🏠</div>
              <p className="font-bold mb-2" style={{ color: 'var(--txt)' }}>Aucun logement publié</p>
              <p className="text-sm mb-6" style={{ color: 'var(--txt-3)' }}>Ajoutez votre premier logement et commencez à recevoir des voyageurs</p>
              <Link to="/host" className="btn-primary btn-shimmer px-6 py-3">+ Ajouter un logement</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// HOME ADMIN
// ════════════════════════════════════════════════════════════
function AdminHome() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ users: 0, properties: 0, bookings: 0, revenue: 0 })
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      userAPI.getAll().catch(() => ({ data: [] })),
      propertyAPI.getAll({ limit: 100 }).catch(() => ({ data: [] })),
      bookingAPI.getAll().catch(() => ({ data: [] })),
    ]).then(([uRes, pRes, bRes]) => {
      const revenue = bRes.data
        .filter(b => b.booking_status !== 'cancelled')
        .reduce((s, b) => s + parseFloat(b.total_price || 0), 0)
      setStats({
        users: uRes.data.length,
        properties: pRes.data.length,
        bookings: bRes.data.length,
        revenue,
      })
      setRecentBookings(
        [...bRes.data]
          .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
          .slice(0, 5)
      )
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const fmtDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

  const STATUS_STYLE = {
    pending:   { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b',  label: '⏳ En attente' },
    confirmed: { bg: 'rgba(16,185,129,0.15)',  color: '#10b981',  label: '✅ Confirmée' },
    completed: { bg: 'rgba(99,102,241,0.15)',  color: '#818cf8',  label: '🏁 Terminée' },
    cancelled: { bg: 'rgba(255,107,53,0.15)',   color: '#f87171',  label: '❌ Annulée' },
  }

  return (
    <div className="pt-20 pb-16 px-4">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ─── Bannière admin ─── */}
        <div className="relative overflow-hidden rounded-3xl p-8 md:p-12"
          style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(255,107,53,0.08))' }}>
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"
            style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.15), transparent)' }} />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #FF6B35)' }}>
                ⚡
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--txt-3)' }}>Panneau d'administration</p>
                <h1 className="text-2xl md:text-3xl font-black" style={{ color: 'var(--txt)' }}>
                  Dashboard <span style={{ color: '#f59e0b' }}>Admin</span>
                </h1>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link to="/admin" className="btn-primary btn-shimmer py-2.5 px-6"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                ⚡ Panneau Admin complet
              </Link>
              <Link to="/search" className="btn-secondary py-2.5 px-5">🏠 Voir les annonces</Link>
              <a href="http://localhost:3000/api-docs" target="_blank" rel="noreferrer" className="btn-secondary py-2.5 px-5">
                📄 Swagger API
              </a>
              <a href="http://localhost:3001" target="_blank" rel="noreferrer" className="btn-secondary py-2.5 px-5">
                📊 Grafana
              </a>
            </div>
          </div>
        </div>

        {/* ─── Stats système ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '👥', val: stats.users,                           label: 'Utilisateurs',   color: '#FFC857', link: '/admin' },
            { icon: '🏠', val: stats.properties,                      label: 'Logements',      color: '#10b981', link: '/admin' },
            { icon: '📅', val: stats.bookings,                        label: 'Réservations',   color: '#FF6B35', link: '/admin' },
            { icon: '💶', val: `${stats.revenue.toFixed(0)}€`,        label: 'Revenus totaux', color: '#f59e0b', link: '/admin' },
          ].map(s => (
            <Link key={s.label} to={s.link}
              className="glass-card p-5 text-center hover:scale-105 transition-all block">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-2xl font-black" style={{ color: s.color }}>{loading ? '…' : s.val}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--txt-3)' }}>{s.label}</div>
            </Link>
          ))}
        </div>

        {/* ─── Outils rapides ─── */}
        <div>
          <h2 className="text-xl font-black mb-4" style={{ color: 'var(--txt)' }}>🔧 Outils rapides</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { href: 'http://localhost:3000/api-docs', icon: '📄', label: 'Swagger API',   desc: 'Documentation API' },
              { href: 'http://localhost:5050',           icon: '🐘', label: 'pgAdmin',       desc: 'Base de données' },
              { href: 'http://localhost:9001',           icon: '🗂', label: 'MinIO',          desc: 'Stockage fichiers' },
              { href: 'http://localhost:3001',           icon: '📊', label: 'Grafana',        desc: 'Monitoring' },
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

        {/* ─── Réservations récentes ─── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black" style={{ color: 'var(--txt)' }}>
              📅 Réservations <span className="gradient-text">récentes</span>
            </h2>
            <Link to="/admin" className="btn-secondary text-sm py-2 px-4">Gérer tout →</Link>
          </div>
          <div className="space-y-3">
            {loading ? [...Array(3)].map((_, i) => (
              <div key={i} className="glass-card h-16 animate-pulse" />
            )) : recentBookings.length > 0 ? recentBookings.map(b => {
              const st = STATUS_STYLE[b.booking_status] || STATUS_STYLE.pending
              return (
                <div key={b.id} className="glass-card p-4 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <span className="text-xs px-2 py-1 rounded-full font-semibold" style={{ background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: 'var(--txt)' }}>
                        {b.property?.title || 'Logement en cours'}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--txt-3)' }}>
                        {b.guest ? `${b.guest.first_name} ${b.guest.last_name}` : `Voyageur #${b.guest_id}`}
                        {b.start_date ? ` · ${fmtDate(b.start_date)} → ${fmtDate(b.end_date)}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="font-black text-sm gradient-text">
                    {parseFloat(b.total_price || 0).toFixed(0)} €
                  </span>
                </div>
              )
            }) : (
              <div className="glass p-8 text-center">
                <p style={{ color: 'var(--txt-3)' }}>Aucune réservation pour le moment</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// EXPORT — routage par rôle
// Non connecté   → GuestHome  (page d'accueil publique)
// guest/voyageur → TravelerHome (espace personnalisé)
// host           → HostHome (redirige vers /host)
// admin          → AdminHome (redirige vers /admin)
// ════════════════════════════════════════════════════════════
export default function Home() {
  const { user, isAuth, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
        style={{ borderColor: 'var(--border-2)', borderTopColor: 'var(--primary-1)' }} />
    </div>
  )

  if (!isAuth)                  return <GuestHome />
  if (user?.role === 'admin')   return <AdminHome />
  if (user?.role === 'host')    return <HostHome />
  return <TravelerHome />
}
