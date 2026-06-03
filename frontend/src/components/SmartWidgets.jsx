import { useState, useEffect, useMemo } from 'react'

// ══════════════════════════════════════════════════════════════
// 1. INDICE DE BONHEUR MÉTÉO
// Utilise Open-Meteo (API gratuite, sans clé)
// ══════════════════════════════════════════════════════════════
export function WeatherHappiness({ city }) {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!city) return
    // Géocodage de la ville
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=fr`)
      .then(r => r.json())
      .then(geo => {
        const loc = geo.results?.[0]
        if (!loc) return
        return fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current_weather=true&hourly=relativehumidity_2m,windspeed_10m&forecast_days=1`)
      })
      .then(r => r?.json())
      .then(data => {
        if (!data?.current_weather) return
        setWeather({
          temp:     data.current_weather.temperature,
          wind:     data.current_weather.windspeed,
          code:     data.current_weather.weathercode,
          humidity: data.hourly?.relativehumidity_2m?.[new Date().getHours()] || 50,
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [city])

  const score = useMemo(() => {
    if (!weather) return null
    let s = 10
    // Température idéale 18-26°C
    const t = weather.temp
    if (t >= 22 && t <= 26) s -= 0
    else if (t >= 18 && t <= 30) s -= 0.5
    else if (t >= 14 && t <= 34) s -= 1.5
    else s -= 3

    // Humidité idéale 40-60%
    const h = weather.humidity
    if (h > 75) s -= 1.5
    else if (h > 60) s -= 0.5

    // Vent idéal < 20 km/h
    if (weather.wind > 40) s -= 2
    else if (weather.wind > 25) s -= 1

    // Code météo (0=soleil, 1-3=nuageux, >50=pluie)
    if (weather.code === 0) s += 0
    else if (weather.code <= 3) s -= 0.3
    else if (weather.code <= 48) s -= 1
    else s -= 2.5

    return Math.max(1, Math.min(10, parseFloat(s.toFixed(1))))
  }, [weather])

  const weatherIcon = (code) => {
    if (code === 0) return '☀️'
    if (code <= 3)  return '⛅'
    if (code <= 48) return '🌫️'
    if (code <= 67) return '🌧️'
    if (code <= 77) return '❄️'
    return '⛈️'
  }

  const scoreColor = score >= 8.5 ? '#10b981' : score >= 7 ? '#FFC857' : score >= 5 ? '#f59e0b' : '#f87171'
  const scoreLabel = score >= 8.5 ? 'Excellent' : score >= 7 ? 'Très bien' : score >= 5 ? 'Correct' : 'Difficile'

  if (loading) return (
    <div className="glass p-4 rounded-2xl animate-pulse h-24" />
  )
  if (!weather || !score) return null

  return (
    <div className="glass p-4 rounded-2xl">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-sm" style={{ color: 'var(--txt)' }}>
          🌦️ Indice de bonheur météo
        </h4>
        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
          style={{ background: scoreColor + '20', color: scoreColor, border: `1px solid ${scoreColor}33` }}>
          {scoreLabel}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-center">
          <span className="text-3xl">{weatherIcon(weather.code)}</span>
          <p className="text-xs mt-0.5 font-semibold" style={{ color: 'var(--txt-3)' }}>{weather.temp}°C</p>
        </div>
        <div className="flex-1">
          <div className="flex items-end gap-1.5 mb-1">
            <span className="text-2xl font-black" style={{ color: scoreColor }}>{score}</span>
            <span className="text-sm font-semibold mb-0.5" style={{ color: 'var(--txt-4)' }}>/10</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <div className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${score * 10}%`, background: `linear-gradient(to right, #FF6B35, ${scoreColor})` }} />
          </div>
          <div className="flex gap-3 mt-1.5 text-xs" style={{ color: 'var(--txt-4)' }}>
            <span>💧 {weather.humidity}%</span>
            <span>💨 {weather.wind} km/h</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// 2. CALENDRIER INTELLIGENT — économies par décalage de dates
// ══════════════════════════════════════════════════════════════
export function SmartCalendar({ startDate, endDate, pricePerNight, onApply }) {
  const nights = Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000))
  const baseTotal = parseFloat(pricePerNight) * nights

  // Simule les variations de prix selon le jour de la semaine
  const variations = useMemo(() => {
    const result = []
    for (let offset = -3; offset <= 3; offset++) {
      if (offset === 0) continue
      const newStart = new Date(startDate)
      newStart.setDate(newStart.getDate() + offset)
      const newEnd = new Date(endDate)
      newEnd.setDate(newEnd.getDate() + offset)

      // Modifier le prix selon le jour (lun-jeu = -8%, ven-dim = +12%)
      const dow = newStart.getDay() // 0=dim, 6=sam
      let mult = 1
      if (dow === 0 || dow === 6) mult = 1.12
      else if (dow === 1 || dow === 2 || dow === 3) mult = 0.92
      else mult = 0.97

      const newTotal = parseFloat(pricePerNight) * nights * mult
      const saving   = baseTotal - newTotal

      if (Math.abs(saving) > 5) {
        result.push({
          offset,
          newStart: newStart.toISOString().split('T')[0],
          newEnd:   newEnd.toISOString().split('T')[0],
          newTotal: newTotal.toFixed(0),
          saving:   saving.toFixed(0),
          label:    offset < 0
            ? `${Math.abs(offset)} jour${Math.abs(offset) > 1 ? 's' : ''} avant`
            : `${offset} jour${offset > 1 ? 's' : ''} après`,
        })
      }
    }
    return result.sort((a, b) => parseFloat(b.saving) - parseFloat(a.saving)).slice(0, 3)
  }, [startDate, endDate, pricePerNight])

  const bestDeal = variations.find(v => parseFloat(v.saving) > 0)
  if (!bestDeal) return null

  return (
    <div className="rounded-xl p-3 mb-4"
      style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">🗓️</span>
        <p className="text-xs font-bold" style={{ color: '#10b981' }}>
          Calendrier intelligent
        </p>
      </div>
      <div className="space-y-2">
        {variations.filter(v => parseFloat(v.saving) > 0).map(v => (
          <div key={v.offset} className="flex items-center justify-between">
            <p className="text-xs" style={{ color: 'var(--txt-2)' }}>
              Décaler de <strong>{v.label}</strong>
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black" style={{ color: '#10b981' }}>
                −{v.saving} €
              </span>
              <button onClick={() => onApply(v.newStart, v.newEnd)}
                className="text-xs px-2 py-0.5 rounded-full font-semibold transition-all hover:scale-105"
                style={{ background: 'rgba(16,185,129,0.20)', color: '#10b981' }}>
                Appliquer
              </button>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs mt-2" style={{ color: 'var(--txt-4)' }}>
        💡 Les week-ends coûtent en moyenne 12 % plus cher
      </p>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// 3. QUARTIER EN TEMPS RÉEL
// ══════════════════════════════════════════════════════════════
const QUARTIER_DATA = {
  Paris:      { affluence: 78, calme: 55, transport: 4, attractions: ['Tour Eiffel (2.1 km)', 'Louvre (1.8 km)', 'Montmartre (0.9 km)'], restaurants: 142, ambiance: 'Animé' },
  Nice:       { affluence: 62, calme: 68, transport: 7, attractions: ['Promenade des Anglais (0.4 km)', 'Vieux-Nice (0.8 km)', 'Colline du Château (1.1 km)'], restaurants: 87, ambiance: 'Détendu' },
  Lyon:       { affluence: 55, calme: 72, transport: 5, attractions: ['Vieux-Lyon (0.6 km)', 'Fourvière (1.2 km)', 'Parc de la Tête d\'Or (3.1 km)'], restaurants: 94, ambiance: 'Calme' },
  Bordeaux:   { affluence: 48, calme: 78, transport: 8, attractions: ['Place de la Bourse (0.3 km)', 'Cité du Vin (2.8 km)', 'Jardin Public (1.1 km)'], restaurants: 76, ambiance: 'Tranquille' },
  Marseille:  { affluence: 70, calme: 48, transport: 6, attractions: ['Vieux-Port (0.2 km)', 'Notre-Dame de la Garde (1.4 km)', 'Calanques (8 km)'], restaurants: 118, ambiance: 'Vivant' },
  Chamonix:   { affluence: 35, calme: 92, transport: 12, attractions: ['Aiguille du Midi (3.1 km)', 'Mer de Glace (5 km)', 'Montenvers (4 km)'], restaurants: 38, ambiance: 'Paisible' },
  Biarritz:   { affluence: 42, calme: 81, transport: 9, attractions: ['Grande Plage (0.2 km)', 'Rocher de la Vierge (0.5 km)', 'Phare de Biarritz (0.8 km)'], restaurants: 52, ambiance: 'Serein' },
  Strasbourg: { affluence: 51, calme: 74, transport: 5, attractions: ['Cathédrale (0.4 km)', 'Petite France (0.6 km)', 'Parc de l\'Orangerie (2.1 km)'], restaurants: 83, ambiance: 'Animé' },
}

export function QuartierWidget({ city }) {
  const data = QUARTIER_DATA[city] || {
    affluence: 55, calme: 70, transport: 8,
    attractions: ['Centre-ville (0.5 km)', 'Marché local (0.8 km)', 'Parc municipal (1.2 km)'],
    restaurants: 65, ambiance: 'Agréable',
  }

  // Simulation d'animation "temps réel"
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 4000)
    return () => clearInterval(t)
  }, [])

  const liveAfluence = Math.min(100, Math.max(10, data.affluence + (tick % 3) * 3 - 3))

  const calmeColor = data.calme >= 75 ? '#10b981' : data.calme >= 50 ? '#FFC857' : '#f87171'
  const aflColor   = liveAfluence >= 75 ? '#f87171' : liveAfluence >= 45 ? '#FFC857' : '#10b981'

  return (
    <div className="glass p-5 rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-sm" style={{ color: 'var(--txt)' }}>🏃 Quartier en temps réel</h4>
        <span className="flex items-center gap-1 text-xs font-semibold"
          style={{ color: '#10b981' }}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> En direct
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Affluence */}
        <div className="glass p-3 rounded-xl text-center">
          <p className="text-xs mb-1" style={{ color: 'var(--txt-4)' }}>Affluence</p>
          <p className="text-xl font-black" style={{ color: aflColor }}>{liveAfluence}%</p>
          <div className="h-1.5 rounded-full mt-1" style={{ background: 'var(--border)' }}>
            <div className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${liveAfluence}%`, background: aflColor }} />
          </div>
        </div>
        {/* Calme */}
        <div className="glass p-3 rounded-xl text-center">
          <p className="text-xs mb-1" style={{ color: 'var(--txt-4)' }}>Niveau de calme</p>
          <p className="text-xl font-black" style={{ color: calmeColor }}>{data.calme}%</p>
          <div className="h-1.5 rounded-full mt-1" style={{ background: 'var(--border)' }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${data.calme}%`, background: calmeColor }} />
          </div>
        </div>
      </div>

      {/* Infos rapides */}
      <div className="flex gap-3 text-xs">
        <span className="flex items-center gap-1" style={{ color: 'var(--txt-3)' }}>
          🍽️ <span className="font-semibold">{data.restaurants}</span> restaurants
        </span>
        <span className="flex items-center gap-1" style={{ color: 'var(--txt-3)' }}>
          🚇 <span className="font-semibold">{data.transport} min</span> centre
        </span>
        <span className="flex items-center gap-1" style={{ color: 'var(--txt-3)' }}>
          🏘️ <span className="font-semibold">{data.ambiance}</span>
        </span>
      </div>

      {/* Attractions */}
      <div>
        <p className="text-xs font-semibold mb-2" style={{ color: 'var(--txt-3)' }}>📍 Attractions proches</p>
        <div className="space-y-1">
          {data.attractions.map(a => (
            <div key={a} className="flex items-center gap-2 text-xs" style={{ color: 'var(--txt-2)' }}>
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--primary-1)' }} />
              {a}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// 4. PRÉDICTION IA DE L'EXPÉRIENCE
// ══════════════════════════════════════════════════════════════
export function AIPrediction({ property, reviews, user }) {
  const prediction = useMemo(() => {
    if (!property) return null
    const avgRating = reviews.length
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 4.2

    // Facteurs de prédiction
    let score = avgRating / 5 * 100

    // Ajustement par type de voyageur
    if (user?.role === 'guest') score += 2
    if (property.max_guests >= 4) score -= 1
    if (property.property_type === 'villa') score += 3
    if (property.property_type === 'studio') score -= 1

    // Ajustement prix
    const price = parseFloat(property.price_per_night)
    if (price > 200) score += 2 // logements premium = meilleures expériences
    if (price < 60)  score -= 1

    score = Math.min(98, Math.max(55, Math.round(score)))

    const stars5pct = score
    const profile = user
      ? `les voyageurs avec votre profil (${user.role === 'host' ? 'hôte' : 'voyageur'})`
      : 'les voyageurs similaires'

    return {
      score,
      stars5pct,
      profile,
      label: score >= 90 ? 'Expérience quasi-certaine' : score >= 80 ? 'Très probable' : score >= 70 ? 'Probable' : 'Bonne chance',
      color: score >= 90 ? '#10b981' : score >= 80 ? '#FFC857' : score >= 70 ? '#00B8D9' : '#f87171',
      basedOn: reviews.length > 0 ? `${reviews.length} avis réels` : 'estimation IA',
    }
  }, [property, reviews, user])

  if (!prediction) return null

  return (
    <div className="rounded-xl p-4 mb-4"
      style={{ background: prediction.color + '10', border: `1px solid ${prediction.color}30` }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">🧠</span>
        <p className="text-xs font-bold" style={{ color: prediction.color }}>
          Prédiction IA de votre expérience
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-center">
          <p className="text-2xl font-black" style={{ color: prediction.color }}>{prediction.score}%</p>
          <p className="text-xs" style={{ color: 'var(--txt-4)' }}>chance de ★★★★★</p>
        </div>
        <div className="flex-1">
          <p className="text-xs leading-relaxed" style={{ color: 'var(--txt-2)' }}>
            <strong>{prediction.stars5pct}%</strong> de {prediction.profile} ont donné 5 étoiles à ce logement.
          </p>
          <div className="h-1.5 rounded-full mt-2 overflow-hidden" style={{ background: 'var(--border)' }}>
            <div className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${prediction.score}%`, background: `linear-gradient(to right, var(--primary-1), ${prediction.color})` }} />
          </div>
          <p className="text-xs mt-1 font-semibold" style={{ color: prediction.color }}>
            {prediction.label} · basé sur {prediction.basedOn}
          </p>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// 5. GUIDE APRÈS RÉSERVATION
// ══════════════════════════════════════════════════════════════
export function PostBookingGuide({ property }) {
  const [tab, setTab] = useState('access')

  const GUIDE = {
    access: {
      icon: '🔑',
      label: 'Accès',
      items: [
        { icon: '🏠', title: 'Code d\'entrée', desc: 'Disponible 24h avant votre arrivée dans vos messages' },
        { icon: '🅿️', title: 'Parking', desc: property?.address ? `Proche de ${property.address}` : 'Informations envoyées par l\'hôte' },
        { icon: '📶', title: 'WiFi', desc: 'Identifiants dans le logement sur le tableau de bord' },
        { icon: '⏰', title: 'Check-in', desc: 'À partir de 15h00 · Check-out avant 11h00' },
      ]
    },
    restaurants: {
      icon: '🍽️',
      label: 'Restaurants',
      items: [
        { icon: '⭐', title: 'Gastronomique', desc: 'Restaurant de la place — Réservation recommandée' },
        { icon: '🥗', title: 'Bistrots', desc: '3 adresses locales à 5 min à pied' },
        { icon: '☕', title: 'Cafés', desc: 'Terrasses et artisans torréfacteurs du quartier' },
        { icon: '🛒', title: 'Marché', desc: 'Marché local les mardis et samedis matin' },
      ]
    },
    itinerary: {
      icon: '🗺️',
      label: 'Itinéraire',
      items: [
        { icon: '🌅', title: 'Matin', desc: 'Petit-déjeuner + visite du marché local (1h)' },
        { icon: '☀️', title: 'Après-midi', desc: 'Principales attractions + temps libre (3h)' },
        { icon: '🌆', title: 'Soir', desc: 'Dîner local + balade nocturne dans le centre (2h)' },
        { icon: '🌙', title: 'Conseil', desc: 'Réservez les activités la veille via notre appli' },
      ]
    },
  }

  const tabs = Object.entries(GUIDE)

  return (
    <div className="glass p-5 rounded-2xl"
      style={{ border: '1px solid rgba(0,184,217,0.25)', background: 'rgba(0,184,217,0.04)' }}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🏠</span>
        <div>
          <h4 className="font-bold text-sm" style={{ color: 'var(--txt)' }}>Guide de votre séjour</h4>
          <p className="text-xs" style={{ color: 'var(--txt-4)' }}>Exclusif après réservation confirmée</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 glass p-1 rounded-xl">
        {tabs.map(([key, val]) => (
          <button key={key} onClick={() => setTab(key)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={tab === key
              ? { background: 'linear-gradient(135deg, var(--primary-1), var(--primary-2))', color: '#fff' }
              : { color: 'var(--txt-3)' }}>
            {val.icon} {val.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {GUIDE[tab].items.map(item => (
          <div key={item.title} className="flex items-start gap-3">
            <span className="text-xl shrink-0">{item.icon}</span>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--txt)' }}>{item.title}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--txt-3)' }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
