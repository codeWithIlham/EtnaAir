import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { propertyAPI, bookingAPI, reviewAPI, wishlistAPI, getPropertyImage } from '../services/api'
import { useAuth } from '../context/AuthContext'
import PropertyCard from '../components/PropertyCard'
import ScrollReveal from '../components/ScrollReveal'
import { useRecentlyViewed } from '../hooks/useRecentlyViewed'
import { WeatherHappiness, SmartCalendar, QuartierWidget, AIPrediction, PostBookingGuide } from '../components/SmartWidgets'

// ── Lightbox plein écran ────────────────────────────────────
function Lightbox({ images, idx, onClose, onPrev, onNext }) {
  useEffect(() => {
    const fn = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose, onPrev, onNext])

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.95)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <button onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-2xl font-bold hover:scale-110 transition-all"
        style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>✕</button>
      <button onClick={onPrev}
        className="absolute left-4 w-12 h-12 rounded-full flex items-center justify-center text-2xl hover:scale-110 transition-all"
        style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>‹</button>
      <img src={images[idx]} alt="" className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
      <button onClick={onNext}
        className="absolute right-4 w-12 h-12 rounded-full flex items-center justify-center text-2xl hover:scale-110 transition-all"
        style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>›</button>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/30'}`} />
        ))}
      </div>
      <div className="absolute bottom-6 right-6 text-white/50 text-sm">{idx + 1} / {images.length}</div>
    </div>
  )
}

const AMENITY_ICONS = {
  'WiFi': '📶', 'Climatisation': '❄️', 'Parking': '🅿️', 'Piscine': '🏊',
  'Cuisine équipée': '🍳', 'Machine à laver': '👕', 'Balcon': '🌅',
  'Vue mer': '🌊', 'Jacuzzi': '♨️', 'Barbecue': '🔥',
}

function buildGallery(prop) {
  const imgs = (prop.images || []).map(i => i.image_url).filter(Boolean)
  const main = getPropertyImage(prop)
  if (main && !imgs.includes(main)) imgs.unshift(main)
  return imgs.slice(0, 8)
}

export default function PropertyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuth, user } = useAuth()

  const [property, setProperty]   = useState(null)
  const [reviews, setReviews]     = useState([])
  const [similar, setSimilar]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [liked, setLiked]         = useState(false)
  const [galleryIdx, setGalleryIdx] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [shareSuccess, setShareSuccess] = useState(false)
  const { add: addRecentlyViewed } = useRecentlyViewed()

  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
  const endDefault = new Date(tomorrow); endDefault.setDate(endDefault.getDate() + 3)
  const [startDate, setStartDate] = useState(tomorrow.toISOString().split('T')[0])
  const [endDate,   setEndDate]   = useState(endDefault.toISOString().split('T')[0])
  const [booking,   setBooking]   = useState({ loading: false, success: false, error: '' })

  const [reviewForm, setReviewForm]     = useState({ rating: 5, comment: '' })
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewDone, setReviewDone]     = useState(false)
  const [reviewError, setReviewError]   = useState('')

  useEffect(() => {
    setLoading(true); setLiked(false); setGalleryIdx(0)
    Promise.all([
      propertyAPI.getById(id),
      reviewAPI.getByProperty(id).catch(() => ({ data: [] })),
      isAuth ? wishlistAPI.check(id).catch(() => ({ data: { liked: false } })) : Promise.resolve({ data: { liked: false } }),
    ]).then(([propRes, revRes, likeRes]) => {
      const prop = propRes.data
      setProperty(prop)
      setReviews(revRes.data)
      setLiked(likeRes.data?.liked || false)
      if (prop) addRecentlyViewed(prop)
      if (prop?.city) {
        propertyAPI.getAll({ city: prop.city, limit: 4 })
          .then(r => setSimilar(r.data.filter(p => p.id !== prop.id).slice(0, 3)))
          .catch(() => {})
      }
    }).catch(() => setError('Logement introuvable.')).finally(() => setLoading(false))
  }, [id, isAuth])

  // L'hôte qui consulte SA propre annonce
  const isOwner = isAuth && property && user?.id === property.owner_id

  const nights = Math.max(0, Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000))
  const totalPrice = property ? (parseFloat(property.price_per_night) * nights).toFixed(2) : 0

  const handleBook = async () => {
    if (!isAuth) return navigate('/login', { state: { from: `/annonces/${id}` } })
    setBooking({ loading: true, success: false, error: '' })
    try {
      await bookingAPI.create({ property_id: parseInt(id), start_date: startDate, end_date: endDate })
      setBooking({ loading: false, success: true, error: '' })
    } catch (err) {
      setBooking({ loading: false, success: false, error: err.response?.data?.message || 'Erreur de réservation.' })
    }
  }

  const handleLike = async () => {
    if (!isAuth) return navigate('/login')
    try {
      if (liked) { await wishlistAPI.remove(id); setLiked(false) }
      else        { await wishlistAPI.add(id);    setLiked(true)  }
    } catch {}
  }

  const handleReview = async (e) => {
    e.preventDefault()
    if (!isAuth) return navigate('/login')
    if (!reviewForm.comment.trim()) return setReviewError('Veuillez écrire un commentaire.')
    if (reviewForm.comment.trim().length < 10) return setReviewError('Minimum 10 caractères.')
    setReviewLoading(true); setReviewError('')
    try {
      const res = await reviewAPI.create({ property_id: parseInt(id), rating: reviewForm.rating, comment: reviewForm.comment })
      setReviews(prev => [res.data, ...prev])
      setReviewDone(true)
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Impossible de publier votre avis.')
    } finally { setReviewLoading(false) }
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try { await navigator.share({ title: property?.title, url }) } catch {}
    } else {
      await navigator.clipboard?.writeText(url)
      setShareSuccess(true)
      setTimeout(() => setShareSuccess(false), 2000)
    }
  }

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const gallery = property ? buildGallery(property) : []
  const lightboxPrev = useCallback(() => setGalleryIdx(i => (i - 1 + gallery.length) % gallery.length), [gallery.length])
  const lightboxNext = useCallback(() => setGalleryIdx(i => (i + 1) % gallery.length), [gallery.length])

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 pt-24 pb-8 animate-pulse">
      <div className="h-80 rounded-3xl mb-8" style={{ background: 'var(--surface)' }} />
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-4">
          <div className="h-8 rounded w-3/4" style={{ background: 'var(--surface)' }} />
          <div className="h-4 rounded w-1/2" style={{ background: 'var(--surface)' }} />
          <div className="h-32 rounded" style={{ background: 'var(--surface)' }} />
        </div>
        <div className="h-64 rounded-2xl" style={{ background: 'var(--surface)' }} />
      </div>
    </div>
  )

  if (error || !property) return (
    <div className="text-center py-32 pt-24 px-4">
      <div className="text-6xl mb-4">😞</div>
      <p className="font-medium text-lg mb-4" style={{ color: 'var(--txt-3)' }}>{error || 'Logement introuvable'}</p>
      <Link to="/search" className="btn-secondary inline-flex px-6 py-2.5 text-sm">← Retour aux annonces</Link>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
      {lightboxOpen && (
        <Lightbox images={gallery} idx={galleryIdx}
          onClose={() => setLightboxOpen(false)}
          onPrev={lightboxPrev} onNext={lightboxNext} />
      )}

      {/* Breadcrumb + actions */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <nav className="flex items-center gap-1.5 text-xs sm:text-sm" style={{ color: 'var(--txt-4)' }}>
          <Link to="/" className="hover:underline" style={{ color: 'var(--txt-3)' }}>Accueil</Link>
          <span>/</span>
          <Link to="/search" className="hover:underline" style={{ color: 'var(--txt-3)' }}>Annonces</Link>
          <span>/</span>
          <span className="truncate max-w-[120px] sm:max-w-xs" style={{ color: 'var(--txt-2)' }}>{property.title}</span>
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={handleShare}
            className="btn-secondary text-sm py-2 px-3 sm:px-4 flex items-center gap-1.5 transition-all"
            style={shareSuccess ? { borderColor: '#10b981', color: '#10b981' } : {}}>
            {shareSuccess ? '✅' : '🔗'} <span className="hidden sm:inline">{shareSuccess ? 'Copié !' : 'Partager'}</span>
          </button>
          {isAuth && !isOwner && (
            <button onClick={handleLike}
              className="btn-secondary text-sm py-2 px-3 sm:px-4"
              style={liked ? { color: '#f87171', borderColor: 'rgba(255,107,53,0.3)' } : {}}>
              {liked ? '❤️' : '🤍'} <span className="hidden sm:inline">{liked ? 'Sauvegardé' : 'Sauvegarder'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Titre */}
      <div className="mb-6">
        <h1 className="text-3xl font-black" style={{ color: 'var(--txt)' }}>{property.title}</h1>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          {avgRating && <span className="text-sm" style={{ color: 'var(--txt-2)' }}>⭐ {avgRating} · {reviews.length} avis</span>}
          <span style={{ color: 'var(--txt-4)' }}>·</span>
          <span className="text-sm" style={{ color: 'var(--txt-2)' }}>📍 {property.city}{property.country ? `, ${property.country}` : ''}</span>
          <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'var(--surface-2)', color: 'var(--txt-3)' }}>{property.property_type}</span>
        </div>
      </div>

      {/* Galerie */}
      <div className="mb-10">
        <div className="relative h-72 md:h-[460px] rounded-3xl overflow-hidden cursor-pointer group"
          onClick={() => gallery.length > 0 && setLightboxOpen(true)}>
          <img src={gallery[galleryIdx] || gallery[0]} alt={property.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Bouton plein écran */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="px-5 py-2.5 rounded-full font-semibold text-sm backdrop-blur-sm"
              style={{ background: 'rgba(0,0,0,0.55)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
              🔍 Voir en plein écran
            </div>
          </div>

          {gallery.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); setGalleryIdx(i => (i - 1 + gallery.length) % gallery.length) }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors text-xl">
                ‹
              </button>
              <button onClick={e => { e.stopPropagation(); setGalleryIdx(i => (i + 1) % gallery.length) }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors text-xl">
                ›
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {gallery.map((_, i) => (
                  <button key={i} onClick={e => { e.stopPropagation(); setGalleryIdx(i) }}
                    className={`h-2 rounded-full transition-all ${i === galleryIdx ? 'w-6 bg-white' : 'w-2 bg-white/50'}`} />
                ))}
              </div>
            </>
          )}
          <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white/80 text-xs px-3 py-1.5 rounded-full">
            {galleryIdx + 1} / {gallery.length}
            {gallery.length > 1 && <span className="ml-2 opacity-70">• Cliquer pour agrandir</span>}
          </div>
        </div>

        {gallery.length > 1 && (
          <div className="flex gap-2 mt-3">
            {gallery.map((img, i) => (
              <button key={i} onClick={() => setGalleryIdx(i)}
                className={`h-16 flex-1 rounded-xl overflow-hidden transition-all ${i === galleryIdx ? 'ring-2' : 'opacity-60 hover:opacity-100'}`}
                style={i === galleryIdx ? { ringColor: 'var(--primary-1)' } : {}}>
                <img src={img} alt="" className="w-full h-full object-cover"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200&q=60' }} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sticky bar mobile */}
      {isOwner ? (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between gap-3 px-4 py-3"
          style={{ background: 'var(--bg-2)', borderTop: '1px solid rgba(16,185,129,0.3)', backdropFilter: 'blur(16px)' }}>
          <div>
            <p className="text-sm font-bold" style={{ color: '#10b981' }}>🏠 Votre annonce</p>
            <p className="text-xs" style={{ color: 'var(--txt-4)' }}>{parseFloat(property.price_per_night).toFixed(0)} €/nuit</p>
          </div>
          <Link to="/host" className="btn-primary btn-shimmer py-2.5 px-6 text-sm"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            ✏️ Gérer
          </Link>
        </div>
      ) : !booking.success && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between gap-3 px-4 py-3"
          style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--border)', backdropFilter: 'blur(16px)' }}>
          <div>
            <span className="text-xl font-black gradient-text">{parseFloat(property.price_per_night).toFixed(0)} €</span>
            <span className="text-xs ml-1" style={{ color: 'var(--txt-4)' }}>/nuit</span>
            {nights > 0 && <p className="text-xs" style={{ color: 'var(--txt-4)' }}>Total : {totalPrice} €</p>}
          </div>
          <button onClick={handleBook} disabled={booking.loading || nights <= 0}
            className="btn-primary btn-shimmer py-2.5 px-6 text-sm disabled:opacity-50">
            {booking.loading ? '...' : isAuth ? '🎯 Réserver' : '🔐 Connexion'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pb-24 lg:pb-0">
        {/* Colonne gauche */}
        <div className="lg:col-span-2 space-y-8">

          {/* Capacité */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: '👥', label: `${property.max_guests} voyageurs` },
              { icon: '🛏', label: `${property.bedrooms || 1} chambre${(property.bedrooms||1) > 1 ? 's' : ''}` },
              { icon: '🚿', label: `${property.bathrooms || 1} salle${(property.bathrooms||1) > 1 ? 's' : ''} de bain` },
              { icon: '🏠', label: property.property_type || 'logement' },
            ].map(f => (
              <div key={f.label} className="glass p-4 text-center">
                <div className="text-2xl mb-1">{f.icon}</div>
                <div className="text-xs font-medium" style={{ color: 'var(--txt-2)' }}>{f.label}</div>
              </div>
            ))}
          </div>

          {/* ── Smart Widgets ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <WeatherHappiness city={property.city} />
            <QuartierWidget city={property.city} />
          </div>

          {/* ── Après réservation confirmée ── */}
          {booking.success && (
            <PostBookingGuide property={property} />
          )}

          {/* Hôte */}
          {property.owner && (
            <div className="glass p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#FFC857] flex items-center justify-center text-white font-black text-xl shrink-0">
                {property.owner.first_name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-xs mb-0.5" style={{ color: 'var(--txt-4)' }}>Hébergé par</p>
                <p className="font-bold" style={{ color: 'var(--txt)' }}>{property.owner.first_name} {property.owner.last_name}</p>
                {property.owner.bio && <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--txt-3)' }}>{property.owner.bio}</p>}
              </div>
              <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full shrink-0">🏠 Hôte</span>
            </div>
          )}

          {/* Description */}
          <div className="glass p-6">
            <h2 className="font-black text-lg mb-3" style={{ color: 'var(--txt)' }}>Description</h2>
            <p className="leading-relaxed" style={{ color: 'var(--txt-2)' }}>{property.description || 'Aucune description disponible.'}</p>
          </div>

          {/* Équipements */}
          {property.amenities?.length > 0 && (
            <div className="glass p-6">
              <h2 className="font-black text-lg mb-4" style={{ color: 'var(--txt)' }}>Équipements</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map(a => (
                  <div key={a.amenity_id || a.id} className="flex items-center gap-2 text-sm" style={{ color: 'var(--txt-2)' }}>
                    <span className="text-lg">{AMENITY_ICONS[a.amenity?.name] || '✓'}</span>
                    <span>{a.amenity?.name || a.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Adresse */}
          {property.address && (
            <div className="glass p-6">
              <h2 className="font-black text-lg mb-2" style={{ color: 'var(--txt)' }}>Adresse</h2>
              <p style={{ color: 'var(--txt-2)' }}>📍 {property.address}</p>
            </div>
          )}

          {/* Avis */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-lg" style={{ color: 'var(--txt)' }}>
                {avgRating ? `⭐ ${avgRating}` : 'Avis clients'}
                {reviews.length > 0 && (
                  <span className="font-normal text-base ml-2" style={{ color: 'var(--txt-4)' }}>({reviews.length} avis)</span>
                )}
              </h2>
            </div>

            {reviews.length > 0 ? (
              <div className="space-y-4 mb-6">
                {reviews.map(r => (
                  <div key={r.id} className="glass p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FFC857] flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {r.reviewer?.first_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="text-sm font-semibold" style={{ color: 'var(--txt)' }}>
                          {r.reviewer ? `${r.reviewer.first_name} ${r.reviewer.last_name}` : `Voyageur #${r.reviewer_id}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <span key={s} className="text-sm" style={{ color: s <= r.rating ? '#f59e0b' : 'var(--border-2)' }}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--txt-2)' }}>{r.comment}</p>
                    {r.created_at && (
                      <p className="text-xs mt-2" style={{ color: 'var(--txt-4)' }}>
                        {new Date(r.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass p-8 text-center mb-6">
                <div className="text-4xl mb-3">⭐</div>
                <p className="text-sm" style={{ color: 'var(--txt-4)' }}>Soyez le premier à laisser un avis</p>
              </div>
            )}

            {isAuth && !isOwner && !reviewDone && (
              <div className="glass p-6">
                <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--txt)' }}>Laisser un avis</h3>
                <form onSubmit={handleReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--txt-3)' }}>Note</label>
                    <div className="flex items-center gap-2">
                      {[1,2,3,4,5].map(s => (
                        <button key={s} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: s }))}
                          className="text-2xl transition-all hover:scale-110"
                          style={{ color: s <= reviewForm.rating ? '#f59e0b' : 'var(--txt-4)' }}>★</button>
                      ))}
                      <span className="text-sm ml-1" style={{ color: 'var(--txt-4)' }}>{reviewForm.rating}/5</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--txt-3)' }}>
                      Commentaire <span style={{ color: 'var(--txt-4)', fontWeight: 400 }}>({reviewForm.comment.length}/500)</span>
                    </label>
                    <textarea value={reviewForm.comment}
                      onChange={e => { setReviewForm(f => ({ ...f, comment: e.target.value })); setReviewError('') }}
                      className="input-field resize-none" rows={4}
                      placeholder="Partagez votre expérience..." maxLength={500} required />
                  </div>
                  {reviewError && (
                    <div className="text-sm px-4 py-3 rounded-xl"
                      style={{ background: 'rgba(255,107,53,0.10)', border: '1px solid rgba(255,107,53,0.25)', color: '#f87171' }}>
                      ⚠️ {reviewError}
                    </div>
                  )}
                  <button type="submit" disabled={reviewLoading || !reviewForm.comment.trim()}
                    className="btn-primary px-6 py-2.5 text-sm btn-shimmer disabled:opacity-50">
                    {reviewLoading ? 'Envoi...' : '⭐ Publier mon avis'}
                  </button>
                </form>
              </div>
            )}
            {reviewDone && (
              <div className="glass p-4 text-emerald-400 text-sm text-center" style={{ border: '1px solid rgba(16,185,129,0.3)' }}>
                ✅ Merci pour votre avis !
              </div>
            )}
          </div>
        </div>

        {/* Booking card desktop — ou panneau propriétaire */}
        <div className="hidden lg:block">
          <div className="sticky top-24 glass-card p-6">
            <div className="text-center mb-6 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="text-4xl font-black gradient-text">{parseFloat(property.price_per_night).toFixed(0)} €</span>
              <span className="text-sm ml-1" style={{ color: 'var(--txt-4)' }}>/nuit</span>
              {avgRating && <p className="text-xs mt-1" style={{ color: 'var(--txt-4)' }}>⭐ {avgRating} · {reviews.length} avis</p>}
            </div>

            {isOwner ? (
              /* ── PANNEAU HÔTE ── */
              <div className="space-y-3">
                <div className="text-center mb-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold"
                    style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}>
                    🏠 Votre annonce
                  </span>
                </div>
                <Link to="/host" className="btn-primary w-full py-3 text-sm text-center flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                  ✏️ Modifier cette annonce
                </Link>
                <Link to="/host" className="btn-secondary w-full py-2.5 text-sm text-center flex items-center justify-center gap-2">
                  📅 Voir les réservations reçues
                </Link>
                <Link to="/host" className="btn-secondary w-full py-2.5 text-sm text-center flex items-center justify-center gap-2">
                  📊 Statistiques
                </Link>
                <p className="text-center text-xs mt-3" style={{ color: 'var(--txt-4)' }}>
                  Gérez vos annonces depuis votre espace hôte
                </p>
              </div>
            ) : booking.success ? (
              <div className="text-center py-6">
                <div className="text-5xl mb-4">🎉</div>
                <p className="font-black text-lg" style={{ color: 'var(--txt)' }}>Réservation envoyée !</p>
                <p className="text-sm mt-1" style={{ color: 'var(--txt-4)' }}>{nights} nuit{nights > 1 ? 's' : ''} · {totalPrice} €</p>
                <p className="text-xs mt-2" style={{ color: 'var(--txt-4)' }}>En attente de confirmation de l'hôte</p>
                <Link to="/bookings" className="btn-primary inline-block mt-5 text-sm px-6 py-3">Voir mes réservations →</Link>
              </div>
            ) : (
              <>
                {/* Prédiction IA */}
                <AIPrediction property={property} reviews={reviews} user={user} />

                <div className="rounded-xl overflow-hidden mb-3" style={{ border: '1px solid var(--border-2)' }}>
                  <div className="grid grid-cols-2" style={{ borderBottom: 'none' }}>
                    <div className="p-3" style={{ borderRight: '1px solid var(--border)' }}>
                      <label className="block text-xs font-semibold uppercase mb-1" style={{ color: 'var(--txt-4)' }}>Arrivée</label>
                      <input type="date" value={startDate} min={tomorrow.toISOString().split('T')[0]}
                        onChange={e => setStartDate(e.target.value)}
                        className="w-full bg-transparent text-sm focus:outline-none" style={{ color: 'var(--txt)' }} />
                    </div>
                    <div className="p-3">
                      <label className="block text-xs font-semibold uppercase mb-1" style={{ color: 'var(--txt-4)' }}>Départ</label>
                      <input type="date" value={endDate} min={startDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="w-full bg-transparent text-sm focus:outline-none" style={{ color: 'var(--txt)' }} />
                    </div>
                  </div>
                </div>

                {nights > 0 && (
                  <div className="space-y-2 mb-5 text-sm">
                    <div className="flex justify-between" style={{ color: 'var(--txt-3)' }}>
                      <span>{parseFloat(property.price_per_night).toFixed(0)} € × {nights} nuit{nights > 1 ? 's' : ''}</span>
                      <span>{totalPrice} €</span>
                    </div>
                    <div className="flex justify-between text-xs" style={{ color: 'var(--txt-4)' }}>
                      <span>Frais de service</span><span>0 €</span>
                    </div>
                    {/* Calendrier intelligent */}
                    <SmartCalendar
                      startDate={startDate}
                      endDate={endDate}
                      pricePerNight={property.price_per_night}
                      onApply={(s, e) => { setStartDate(s); setEndDate(e) }}
                    />
                    <div className="pt-2 flex justify-between font-black" style={{ borderTop: '1px solid var(--border)', color: 'var(--txt)' }}>
                      <span>Total</span>
                      <span className="gradient-text">{totalPrice} €</span>
                    </div>
                  </div>
                )}

                {booking.error && (
                  <div className="text-xs px-3 py-2 rounded-xl mb-4"
                    style={{ background: 'rgba(255,107,53,0.10)', border: '1px solid rgba(255,107,53,0.25)', color: '#f87171' }}>
                    ⚠️ {booking.error}
                  </div>
                )}

                <button onClick={handleBook} disabled={booking.loading || nights <= 0}
                  className="btn-primary w-full py-3 text-base disabled:opacity-50">
                  {booking.loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Réservation...
                    </span>
                  ) : isAuth ? '🎯 Réserver' : '🔐 Se connecter'}
                </button>
                <p className="text-center text-xs mt-3" style={{ color: 'var(--txt-4)' }}>
                  Aucun débit maintenant · Annulation gratuite
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Logements similaires */}
      {similar.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-black mb-6" style={{ color: 'var(--txt)' }}>
            Logements similaires à <span className="gradient-text">{property.city}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similar.map(p => <PropertyCard key={p.id} property={p} />)}
          </div>
        </div>
      )}
    </div>
  )
}
