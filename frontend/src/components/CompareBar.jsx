import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getPropertyImage } from '../services/api'

function computeScore(p) {
  let s = 0
  const price = parseFloat(p.price_per_night)
  s += price < 80 ? 30 : price < 130 ? 25 : price < 200 ? 18 : 10
  s += Math.min((p.images?.length || 0) * 4, 20)
  s += Math.min((p.max_guests || 1) * 2, 15)
  s += { villa: 20, house: 17, apartment: 15, studio: 10 }[p.property_type] || 10
  s += 10 // base
  return Math.min(99, Math.max(40, s))
}

const FEATURES = [
  { key: 'price_per_night', label: '💶 Prix/nuit',      fmt: v => `${parseFloat(v || 0).toFixed(0)} €`,  better: 'min' },
  { key: 'max_guests',      label: '👥 Capacité',        fmt: v => `${v || '—'} pers.`,                  better: 'max' },
  { key: 'bedrooms',        label: '🛏 Chambres',         fmt: v => v || '—',                             better: 'max' },
  { key: 'bathrooms',       label: '🚿 Salles de bain',   fmt: v => v || '—',                             better: 'max' },
  { key: 'property_type',   label: '🏠 Type',             fmt: v => v || '—',                             better: null  },
  { key: 'city',            label: '📍 Ville',            fmt: v => v || '—',                             better: null  },
]

export default function CompareBar({ properties = [], onRemove, onClear }) {
  const [open, setOpen] = useState(false)

  if (!properties || properties.length < 1) return null

  const [a, b] = properties

  return (
    <>
      {/* ── Barre flottante ── */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] animate-fade-in-up select-none"
        style={{ pointerEvents: 'all' }}>
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl"
          style={{
            background: 'var(--bg-2)',
            border: '1px solid var(--primary-1)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 8px 40px rgba(255,107,53,0.25)',
          }}>

          {/* Icône */}
          <span className="text-lg">⚖️</span>

          {/* Logements sélectionnés */}
          <div className="flex gap-2">
            {properties.map(p => (
              <div key={p.id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <img src={getPropertyImage(p)} alt=""
                  className="w-6 h-6 rounded-lg object-cover shrink-0"
                  onError={e => { e.target.style.display = 'none' }} />
                <span className="text-xs font-semibold truncate max-w-[100px]" style={{ color: 'var(--txt)' }}>
                  {p.title}
                </span>
                <button onClick={() => onRemove(p.id)}
                  className="text-base font-black leading-none opacity-50 hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--txt-3)' }}>×</button>
              </div>
            ))}
            {/* Slot vide si 1 seul logement */}
            {properties.length < 2 && (
              <div className="flex items-center justify-center px-4 py-1.5 rounded-xl text-xs"
                style={{ border: '2px dashed var(--border-2)', color: 'var(--txt-4)' }}>
                + Ajouter un 2ème
              </div>
            )}
          </div>

          {/* Bouton comparer */}
          {properties.length === 2 && (
            <button onClick={() => setOpen(true)}
              className="btn-primary text-sm py-2 px-4 btn-shimmer whitespace-nowrap">
              Comparer →
            </button>
          )}

          <button onClick={onClear}
            className="text-sm opacity-40 hover:opacity-100 transition-opacity font-bold"
            style={{ color: 'var(--txt-3)' }}>✕</button>
        </div>
      </div>

      {/* ── Modal comparaison ── */}
      {open && a && b && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
          onClick={e => e.target === e.currentTarget && setOpen(false)}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl"
            style={{ background: 'var(--bg-2)', border: '1px solid var(--border-2)' }}>

            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
              style={{ background: 'var(--bg-2)', borderBottom: '1px solid var(--border)' }}>
              <h2 className="font-black text-xl" style={{ color: 'var(--txt)' }}>⚖️ Comparaison</h2>
              <button onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xl hover:opacity-70 transition-opacity"
                style={{ background: 'var(--surface)', color: 'var(--txt-3)' }}>✕</button>
            </div>

            <div className="p-6 space-y-5">

              {/* Photos + titres + score */}
              <div className="grid grid-cols-2 gap-4">
                {[a, b].map((p, i) => {
                  const score = computeScore(p)
                  const scoreColor = score >= 80 ? '#10b981' : score >= 65 ? '#FFC857' : '#f87171'
                  return (
                    <div key={p.id} className="glass-card overflow-hidden">
                      <div className="relative h-36 overflow-hidden">
                        <img src={getPropertyImage(p)} alt={p.title}
                          className="w-full h-full object-cover"
                          onError={e => { e.target.src='https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300' }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        {/* Badge score IA */}
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-black"
                          style={{ background: 'rgba(0,0,0,0.65)', color: scoreColor }}>
                          🧠 {score}
                        </div>
                        <div className="absolute bottom-2 left-2 text-white text-xs font-bold">
                          {i === 0 ? '🅰️' : '🅱️'}
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="font-bold text-sm line-clamp-1" style={{ color: 'var(--txt)' }}>{p.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--txt-3)' }}>📍 {p.city}</p>
                        {/* Barre score */}
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-0.5">
                            <span style={{ color: 'var(--txt-4)' }}>Score qualité</span>
                            <span className="font-bold" style={{ color: scoreColor }}>{score}/100</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                            <div className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${score}%`, background: `linear-gradient(to right, #FF6B35, ${scoreColor})` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Tableau comparatif */}
              <div className="glass-card overflow-hidden">
                {/* En-têtes */}
                <div className="grid grid-cols-3 px-4 py-2.5"
                  style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--txt-4)' }}>Critère</span>
                  <span className="text-xs font-bold text-center" style={{ color: 'var(--txt-2)' }}>🅰️ {a.title?.slice(0, 18)}…</span>
                  <span className="text-xs font-bold text-center" style={{ color: 'var(--txt-2)' }}>🅱️ {b.title?.slice(0, 18)}…</span>
                </div>

                {FEATURES.map((f, idx) => {
                  const valA = a[f.key]
                  const valB = b[f.key]
                  const numA = parseFloat(valA)
                  const numB = parseFloat(valB)
                  const aWins = f.better && !isNaN(numA) && !isNaN(numB) && (
                    f.better === 'min' ? numA < numB : numA > numB
                  )
                  const bWins = f.better && !isNaN(numA) && !isNaN(numB) && (
                    f.better === 'min' ? numB < numA : numB > numA
                  )
                  return (
                    <div key={f.key} className="grid grid-cols-3 items-center px-4 py-3"
                      style={{ borderBottom: idx < FEATURES.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <span className="text-xs font-semibold" style={{ color: 'var(--txt-3)' }}>{f.label}</span>
                      <div className="text-center text-sm font-bold py-1 px-2 rounded-lg mx-1"
                        style={{ background: aWins ? 'rgba(16,185,129,0.15)' : 'transparent', color: aWins ? '#10b981' : 'var(--txt-2)' }}>
                        {f.fmt(valA)}{aWins && ' ✓'}
                      </div>
                      <div className="text-center text-sm font-bold py-1 px-2 rounded-lg mx-1"
                        style={{ background: bWins ? 'rgba(16,185,129,0.15)' : 'transparent', color: bWins ? '#10b981' : 'var(--txt-2)' }}>
                        {f.fmt(valB)}{bWins && ' ✓'}
                      </div>
                    </div>
                  )
                })}

                {/* Ligne verdict */}
                {(() => {
                  const scoreA = computeScore(a)
                  const scoreB = computeScore(b)
                  const winner = scoreA > scoreB ? a : scoreA < scoreB ? b : null
                  if (!winner) return null
                  return (
                    <div className="px-4 py-3 text-center text-sm font-bold"
                      style={{ background: 'rgba(255,107,53,0.08)', borderTop: '1px solid var(--border)', color: 'var(--primary-1)' }}>
                      🏆 L'IA recommande : <strong>{winner.title}</strong> (score {Math.max(scoreA, scoreB)}/100)
                    </div>
                  )
                })()}
              </div>

              {/* Boutons CTA */}
              <div className="grid grid-cols-2 gap-3">
                <Link to={`/annonces/${a.id}`} onClick={() => setOpen(false)}
                  className="btn-primary text-center text-sm py-3 font-bold">
                  🅰️ Voir {a.title?.slice(0, 16)}…
                </Link>
                <Link to={`/annonces/${b.id}`} onClick={() => setOpen(false)}
                  className="btn-secondary text-center text-sm py-3 font-bold">
                  🅱️ Voir {b.title?.slice(0, 16)}…
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
