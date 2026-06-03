import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getPropertyImage } from '../services/api'
import API from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useCompare } from '../context/CompareContext'

const TYPE_EMOJI = { studio: '🏠', apartment: '🏢', house: '🏡', villa: '🌴' }

function useTilt() {
  const ref = useRef(null)
  const handleMove = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10
    el.style.transform = `perspective(600px) rotateX(${y}deg) rotateY(${x}deg) scale(1.02)`
  }
  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = 'perspective(600px) rotateX(0) rotateY(0) scale(1)'
  }
  return { ref, handleMove, handleLeave }
}

export default function PropertyCard({ property }) {
  const { id, title, city, country, price_per_night, max_guests, property_type, bedrooms } = property
  const img = getPropertyImage(property)
  const price = parseFloat(price_per_night)
  const { isAuth } = useAuth()
  const { toggle: compareToggle, isIn: compareIsIn } = useCompare()
  const inCompare = compareIsIn(id)
  const [liked,  setLiked]  = useState(false)
  const [liking, setLiking] = useState(false)
  const [imgHover, setImgHover] = useState(false)
  const tilt = useTilt()

  const handleLike = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuth || liking) return
    setLiking(true)
    try {
      await API.post('/wishlist', { property_id: id })
      setLiked(l => !l)
    } catch {
      setLiked(l => !l)
    } finally {
      setLiking(false)
    }
  }

  // Badges logic — "nouveau" = créé dans les 14 derniers jours
  const isNew     = property.created_at
    ? (Date.now() - new Date(property.created_at).getTime()) < 14 * 24 * 60 * 60 * 1000
    : id <= 3
  const isPopular = max_guests >= 6
  const isLuxury  = price >= 200

  // Fake rating & reviews based on id
  const rating  = (4.2 + (id % 8) * 0.1).toFixed(1)
  const reviews = 12 + (id % 47)

  return (
    <Link to={`/annonces/${id}`} className="property-card group block gradient-border-card">
      <div
        ref={tilt.ref}
        onMouseMove={tilt.handleMove}
        onMouseLeave={tilt.handleLeave}
        className="glass-card overflow-hidden h-full"
        style={{ transition: 'transform 0.15s ease', willChange: 'transform' }}
      >
        {/* Image */}
        <div className="relative h-56 overflow-hidden"
          onMouseEnter={() => setImgHover(true)}
          onMouseLeave={() => setImgHover(false)}>
          <img
            src={img}
            alt={title}
            className="property-img w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          {/* Overlay hover "Voir le logement" */}
          <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${imgHover ? 'opacity-100 bg-black/35' : 'opacity-0'}`}>
            <span className="text-white font-semibold text-sm bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              Voir le logement →
            </span>
          </div>

          {/* Top badges gauche */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            <span className="bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              {TYPE_EMOJI[property_type] || '🏠'} {property_type || 'logement'}
            </span>
            {isNew && (
              <span className="text-white text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 2px 8px rgba(255,107,53,0.4)' }}>
                NOUVEAU
              </span>
            )}
            {isPopular && !isNew && (
              <span className="text-white text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 2px 8px rgba(245,158,11,0.4)' }}>
                🔥 POPULAIRE
              </span>
            )}
            {isLuxury && (
              <span className="text-white text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', boxShadow: '0 2px 8px rgba(139,92,246,0.4)' }}>
                💎 LUXE
              </span>
            )}
          </div>

          {/* Top droite: wishlist + prix */}
          <div className="absolute top-3 right-3 flex flex-col items-end gap-2 z-10">
            {isAuth && (
              <button
                onClick={handleLike}
                className={`w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-all ${
                  liked ? 'bg-rose-500 text-white scale-110' : 'bg-black/40 text-white/70 hover:text-rose-400 hover:scale-110'
                }`}
                title={liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              >
                {liked ? '❤️' : '🤍'}
              </button>
            )}
            <span className="bg-gradient-to-r from-[#FF6B35] to-[#E0224A] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
              {price.toFixed(0)} €/nuit
            </span>
          </div>

          {/* Bottom info sur l'image */}
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="font-bold text-white text-sm leading-snug line-clamp-1 drop-shadow-lg">{title}</h3>
            <p className="text-white/70 text-xs mt-0.5">📍 {city}{country ? `, ${country}` : ''}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--txt-3)' }}>
            <span className="flex items-center gap-1">👥 {max_guests} max</span>
            {bedrooms && <span className="flex items-center gap-1">🛏 {bedrooms} ch.</span>}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span style={{ color: '#f59e0b' }}>★</span>
              <span className="text-xs font-bold" style={{ color: 'var(--txt-2)' }}>{rating}</span>
              <span className="text-xs" style={{ color: 'var(--txt-4)' }}>({reviews})</span>
            </div>
            <div className="text-right transition-transform duration-200 group-hover:scale-110">
              <span className="font-bold gradient-text">{price.toFixed(2)} €</span>
              <span className="text-xs" style={{ color: 'var(--txt-4)' }}> /nuit</span>
            </div>
          </div>
        </div>

        {/* Bouton Comparer */}
        <div className="px-4 pb-3">
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); compareToggle(property) }}
            className="w-full text-xs py-1.5 rounded-xl font-semibold transition-all hover:scale-105"
            style={inCompare ? {
              background: 'linear-gradient(135deg, var(--primary-1), var(--primary-2))',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(255,107,53,0.30)',
            } : {
              background: 'var(--surface)',
              border: '1px solid var(--border-2)',
              color: 'var(--txt-3)',
            }}>
            {inCompare ? '✓ Sélectionné pour comparer' : '⚖️ Comparer'}
          </button>
        </div>
      </div>
    </Link>
  )
}
