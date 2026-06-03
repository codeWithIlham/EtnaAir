import { useMemo } from 'react'

const MONTHS_FR = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']

// Données d'exemple réalistes pour un hôte débutant
function getDemoData(now) {
  // Simulation : saisonnalité typique (été/fêtes plus fort)
  const base = [620, 480, 890, 1100, 750, 1340]
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    return {
      month: MONTHS_FR[d.getMonth()],
      year:  d.getFullYear(),
      m:     d.getMonth(),
      total: base[i],
      count: Math.round(base[i] / 180), // ~180€/résa en moyenne
      isDemo: true,
    }
  })
}

export default function RevenueChart({ bookings = [], height = 180 }) {
  const { data, isDemo } = useMemo(() => {
    const now = new Date()
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
      return { month: MONTHS_FR[d.getMonth()], year: d.getFullYear(), m: d.getMonth(), total: 0, count: 0 }
    })

    bookings.forEach(b => {
      if (b.booking_status === 'cancelled') return
      const d = new Date(b.created_at || b.start_date || 0)
      const idx = months.findIndex(m => m.m === d.getMonth() && m.year === d.getFullYear())
      if (idx >= 0) {
        months[idx].total += parseFloat(b.total_price || 0)
        months[idx].count++
      }
    })

    const hasRealData = months.some(m => m.total > 0)
    if (!hasRealData) {
      return { data: getDemoData(now), isDemo: true }
    }
    return { data: months, isDemo: false }
  }, [bookings])

  const maxVal        = Math.max(...data.map(d => d.total), 1)
  const totalRevenue  = data.reduce((s, d) => s + d.total, 0)
  const totalBookings = data.reduce((s, d) => s + d.count, 0)
  const currentMonth  = data[data.length - 1]
  const prevMonth     = data[data.length - 2]
  const avgMonthly    = totalRevenue / 6

  // Tendance mois actuel vs précédent
  const trend = prevMonth?.total > 0
    ? ((currentMonth.total - prevMonth.total) / prevMonth.total * 100).toFixed(0)
    : null
  const trendUp = trend !== null && parseFloat(trend) >= 0

  // Meilleur mois
  const bestIdx   = data.reduce((best, d, i) => d.total > data[best].total ? i : best, 0)
  const bestMonth = data[bestIdx]

  // Taux d'occupation estimé (si réservations réelles)
  const occupancyRate = totalBookings > 0
    ? Math.min(100, Math.round((totalBookings * 3) / (6 * 30) * 100)) // ~3 nuits/résa
    : isDemo ? 42 : 0

  return (
    <div className="glass-card p-6 mb-8">

      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-black text-lg" style={{ color: 'var(--txt)' }}>
              📈 Revenus sur 6 mois
            </h3>
            {isDemo && (
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: 'rgba(255,200,87,0.15)', color: '#FFC857', border: '1px solid rgba(255,200,87,0.3)' }}>
                données d'exemple
              </span>
            )}
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--txt-4)' }}>
            {isDemo
              ? 'Exemple de revenus — vos vraies données apparaîtront ici'
              : `${totalBookings} réservation${totalBookings !== 1 ? 's' : ''} · ${totalRevenue.toFixed(0)} € encaissés`
            }
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black gradient-text">{totalRevenue.toFixed(0)} €</p>
          <p className="text-xs" style={{ color: 'var(--txt-4)' }}>Total 6 mois</p>
          {trend !== null && (
            <p className="text-xs font-semibold mt-0.5" style={{ color: trendUp ? '#10b981' : '#f87171' }}>
              {trendUp ? '↑' : '↓'} {Math.abs(trend)}% vs mois dernier
            </p>
          )}
        </div>
      </div>

      {/* Barres */}
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((d, i) => {
          const pct    = (d.total / maxVal) * 100
          const isLast = i === data.length - 1
          const isBest = i === bestIdx && !isLast
          return (
            <div key={d.month + d.year} className="flex-1 flex flex-col items-center gap-1 group relative">
              <div className="relative w-full flex items-end justify-center" style={{ height: height - 28 }}>
                {/* Tooltip hover */}
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all
                  text-xs font-bold px-2.5 py-1 rounded-lg whitespace-nowrap z-10 pointer-events-none"
                  style={{ background: 'var(--bg-2)', border: '1px solid var(--border-2)', color: 'var(--txt)', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}>
                  {d.total.toFixed(0)} €
                  {d.count > 0 && <span style={{ color: 'var(--txt-4)' }}> · {d.count} rés.</span>}
                </div>

                {/* Barre */}
                <div className="w-full rounded-t-lg transition-all duration-700 ease-out group-hover:opacity-90"
                  style={{
                    height: `${Math.max(pct, 3)}%`,
                    background: isLast
                      ? 'linear-gradient(to top, #FF6B35, #FFC857)'
                      : isBest
                        ? 'linear-gradient(to top, #00B8D9, #38bdf8)'
                        : 'linear-gradient(to top, rgba(255,107,53,0.35), rgba(255,107,53,0.18))',
                    boxShadow: isLast
                      ? '0 -4px 16px rgba(255,107,53,0.40)'
                      : isBest
                        ? '0 -4px 12px rgba(0,184,217,0.30)'
                        : 'none',
                  }}
                />
              </div>
              <span className="text-xs font-semibold"
                style={{ color: isLast ? 'var(--primary-1)' : isBest ? '#00B8D9' : 'var(--txt-4)' }}>
                {d.month}
              </span>
            </div>
          )
        })}
      </div>

      {/* Légende couleurs */}
      <div className="flex items-center gap-4 mt-3 mb-5">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: 'linear-gradient(to top, #FF6B35, #FFC857)' }} />
          <span className="text-xs" style={{ color: 'var(--txt-4)' }}>Mois actuel</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: 'linear-gradient(to top, #00B8D9, #38bdf8)' }} />
          <span className="text-xs" style={{ color: 'var(--txt-4)' }}>Meilleur mois</span>
        </div>
      </div>

      {/* Stats en grille */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="glass p-3 rounded-xl text-center">
          <p className="text-lg font-black" style={{ color: 'var(--primary-1)' }}>
            {currentMonth.total.toFixed(0)} €
          </p>
          <p className="text-xs" style={{ color: 'var(--txt-4)' }}>Mois actuel</p>
          {trend !== null && (
            <p className="text-xs font-semibold" style={{ color: trendUp ? '#10b981' : '#f87171' }}>
              {trendUp ? '↑' : '↓'} {Math.abs(trend)}%
            </p>
          )}
        </div>

        <div className="glass p-3 rounded-xl text-center">
          <p className="text-lg font-black" style={{ color: 'var(--txt-2)' }}>
            {prevMonth.total.toFixed(0)} €
          </p>
          <p className="text-xs" style={{ color: 'var(--txt-4)' }}>Mois précédent</p>
        </div>

        <div className="glass p-3 rounded-xl text-center">
          <p className="text-lg font-black" style={{ color: '#00B8D9' }}>
            {bestMonth.total.toFixed(0)} €
          </p>
          <p className="text-xs" style={{ color: 'var(--txt-4)' }}>Meilleur mois</p>
          <p className="text-xs font-semibold" style={{ color: '#00B8D9' }}>{bestMonth.month}</p>
        </div>

        <div className="glass p-3 rounded-xl text-center">
          <p className="text-lg font-black" style={{ color: '#FFC857' }}>
            {avgMonthly.toFixed(0)} €
          </p>
          <p className="text-xs" style={{ color: 'var(--txt-4)' }}>Moyenne / mois</p>
          {occupancyRate > 0 && (
            <p className="text-xs font-semibold" style={{ color: '#FFC857' }}>{occupancyRate}% occupation</p>
          )}
        </div>
      </div>

      {/* Barre de progression occupation */}
      {occupancyRate > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold" style={{ color: 'var(--txt-3)' }}>
              Taux d'occupation estimé
            </span>
            <span className="text-xs font-black" style={{ color: '#FFC857' }}>{occupancyRate}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
            <div className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${occupancyRate}%`,
                background: 'linear-gradient(to right, #FFC857, #FF6B35)',
              }} />
          </div>
        </div>
      )}
    </div>
  )
}
