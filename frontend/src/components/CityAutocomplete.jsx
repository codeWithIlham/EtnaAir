import { useState, useEffect, useRef, useMemo } from 'react'

const ALL_CITIES = [
  // France
  'Paris','Nice','Lyon','Bordeaux','Marseille','Toulouse','Montpellier','Strasbourg',
  'Nantes','Rennes','Lille','Grenoble','Annecy','Chamonix','Biarritz','Bayonne',
  'Cannes','Antibes','Saint-Tropez','Monaco','Menton','Perpignan','Nîmes','Reims',
  'Versailles','Colmar','Ajaccio','Bonifacio','Porto-Vecchio','Calvi','Bastia',
  'Saint-Malo','Deauville','Honfleur','Mont-Saint-Michel','La Rochelle','Île de Ré',
  'Carcassonne','Arcachon','Megève','Courchevel','Val-d\'Isère','Chambéry',
  'Tours','Amboise','Blois','Orléans','Chartres','Nancy','Metz','Clermont-Ferrand',
  'Fort-de-France','Pointe-à-Pitre',
  // Europe
  'London','Edinburgh','Manchester','Oxford','Bath','Brighton',
  'Madrid','Barcelona','Séville','Ibiza','Malaga','Valence','Majorque','Grenade',
  'Rome','Milan','Venise','Florence','Amalfi','Capri','Cinque Terre','Côme',
  'Lisbonne','Porto','Algarve','Funchal',
  'Athènes','Santorin','Mykonos','Rhodes','Corfou',
  'Amsterdam','Bruxelles','Bruges','Genève','Zurich',
  'Berlin','Munich','Hambourg','Vienne','Innsbruck',
  'Prague','Varsovie','Budapest','Zagreb','Dubrovnik',
  'Stockholm','Copenhague','Oslo','Helsinki','Reykjavik',
  // Maghreb / Moyen-Orient
  'Marrakech','Casablanca','Agadir','Fès','Essaouira',
  'Tunis','Djerba','Sousse','Hammamet',
  'Alger','Oran','Constantine','Tlemcen',
  'Istanbul','Antalya','Bodrum','Cappadoce',
  'Dubaï','Abu Dhabi','Doha','Mascate','Beyrouth',
  // Amériques
  'New York','Los Angeles','Miami','San Francisco','Las Vegas','Chicago','Honolulu','New Orleans',
  'Montréal','Toronto','Vancouver','Québec',
  'Rio de Janeiro','São Paulo','Buenos Aires','Cancún','Medellín','La Havane','Bogotá',
  // Asie / Pacifique
  'Tokyo','Kyoto','Osaka','Bangkok','Bali','Singapour','Séoul','Hong Kong',
  'Maldives','Phuket','Hanoi','Ho Chi Minh-Ville','Kuala Lumpur','Taipei',
  'Sydney','Melbourne','Auckland',
  // Afrique
  'Nairobi','Le Cap','Zanzibar','Dakar',
]

function Highlight({ text, query }) {
  if (!query) return <span>{text}</span>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <span>{text}</span>
  return (
    <span>
      {text.slice(0, idx)}
      <span style={{ fontWeight: 800, color: 'var(--primary-1)' }}>
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </span>
  )
}

export default function CityAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Paris, Londres, New York...',
  className = '',
  style = {},
  extraCities = [],
}) {
  const [open,  setOpen]  = useState(false)
  const [focus, setFocus] = useState(-1)
  const wrapRef  = useRef(null)
  const inputRef = useRef(null)

  const allCities = useMemo(() => {
    const set = new Set([...ALL_CITIES, ...extraCities])
    return [...set]
  }, [extraCities])

  const suggestions = useMemo(() => {
    const q = value.trim().toLowerCase()
    if (q.length < 1) return []
    return allCities
      .filter(c => c.toLowerCase().includes(q))
      .sort((a, b) => {
        const aStarts = a.toLowerCase().startsWith(q)
        const bStarts = b.toLowerCase().startsWith(q)
        if (aStarts && !bStarts) return -1
        if (!aStarts && bStarts) return 1
        return a.localeCompare(b)
      })
      .slice(0, 8)
  }, [value, allCities])

  useEffect(() => {
    setOpen(suggestions.length > 0 && value.trim().length > 0)
    setFocus(-1)
  }, [suggestions, value])

  useEffect(() => {
    const fn = (e) => { if (!wrapRef.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const select = (city) => {
    onChange(city)
    onSelect?.(city)
    setOpen(false)
    setFocus(-1)
  }

  const handleKeyDown = (e) => {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocus(f => Math.min(f + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocus(f => Math.max(f - 1, 0))
    } else if (e.key === 'Enter' && focus >= 0) {
      e.preventDefault()
      select(suggestions[focus])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative', ...style }} className={className}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => { if (suggestions.length > 0) setOpen(true) }}
        placeholder={placeholder}
        className="w-full bg-transparent text-base font-semibold focus:outline-none"
        style={{ color: 'var(--txt)', caretColor: 'var(--primary-1)' }}
        autoComplete="off"
      />

      {open && (
        <div
          className="absolute left-0 right-0 z-[200] rounded-2xl overflow-hidden"
          style={{
            top: 'calc(100% + 8px)',
            background: 'var(--bg-2, #0d0d1c)',
            border: '1px solid var(--border-2)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
          }}>
          {suggestions.map((city, i) => (
            <button
              key={city}
              type="button"
              onMouseDown={e => { e.preventDefault(); select(city) }}
              onMouseEnter={() => setFocus(i)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-all"
              style={{
                background: i === focus ? 'rgba(255,107,53,0.12)' : 'transparent',
                borderBottom: i < suggestions.length - 1 ? '1px solid var(--border)' : 'none',
                color: 'var(--txt)',
              }}>
              <span style={{ color: 'var(--primary-1)', fontSize: '0.9rem' }}>📍</span>
              <Highlight text={city} query={value} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
