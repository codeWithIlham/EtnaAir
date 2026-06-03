import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { wishlistAPI, getPropertyImage } from '../services/api'
import ScrollReveal from '../components/ScrollReveal'

export default function Wishlist() {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await wishlistAPI.getAll()
      setItems(res.data)
    } catch { setItems([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleRemove = async (propertyId) => {
    try {
      await wishlistAPI.remove(propertyId)
      setItems(prev => prev.filter(i => i.property_id !== propertyId))
    } catch {}
  }

  return (
    <div className="pt-20 pb-16 px-4 min-h-screen">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <p className="label-hotel mb-1">Ma collection</p>
            <h1 className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--txt)' }}>
              Mes <span className="gradient-text">favoris</span>
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--txt-3)' }}>
              {items.length} logement{items.length !== 1 ? 's' : ''} sauvegardé{items.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link to="/search" className="btn-ghost-gold text-sm py-2 px-5 shrink-0">
            + Explorer
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card h-64 animate-pulse">
                <div className="h-44 rounded-t-xl" style={{ background: 'var(--surface-2)' }} />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="glass p-12 sm:p-20 text-center rounded-2xl" style={{ border: '1px solid var(--border-2)' }}>
            <div className="text-5xl mb-4">❤️</div>
            <p className="font-bold text-xl mb-2" style={{ color: 'var(--txt)' }}>Aucun favori pour l'instant</p>
            <p className="text-sm mb-6" style={{ color: 'var(--txt-3)' }}>
              Cliquez sur 🤍 sur un logement pour l'ajouter ici
            </p>
            <Link to="/search" className="btn-primary inline-flex px-8 py-3">Explorer les logements →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item, idx) => {
              const p = item.property
              if (!p) return null
              const img = getPropertyImage(p)
              const price = parseFloat(p.price_per_night)

              return (
                <ScrollReveal key={item.id} variant="fadeUp" delay={idx * 60}>
                  <div className="glass-card overflow-hidden group relative gradient-border-card">
                    {/* Bouton retirer */}
                    <button
                      onClick={() => handleRemove(p.id)}
                      className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all hover:scale-110"
                      style={{ background: 'rgba(244,63,94,0.85)', backdropFilter: 'blur(8px)', boxShadow: '0 4px 12px rgba(244,63,94,0.35)' }}
                      title="Retirer des favoris">
                      ❤️
                    </button>

                    <Link to={`/annonces/${p.id}`} className="block">
                      {/* Image */}
                      <div className="relative h-44 sm:h-48 overflow-hidden">
                        <img src={img} alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=60' }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                        {/* Badges */}
                        {price >= 200 && (
                          <span className="absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded-full text-white"
                            style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                            💎 LUXE
                          </span>
                        )}

                        <div className="absolute bottom-3 left-3 right-12">
                          <p className="text-white font-bold text-sm leading-snug line-clamp-1">{p.title}</p>
                          <p className="text-white/70 text-xs mt-0.5">📍 {p.city}</p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="p-4 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--txt-3)' }}>
                          <span>👥 {p.max_guests} max</span>
                          {p.bedrooms && <span>🛏 {p.bedrooms} ch.</span>}
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-black gradient-text">{price.toFixed(0)} €</span>
                          <span className="text-xs" style={{ color: 'var(--txt-4)' }}>/nuit</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

