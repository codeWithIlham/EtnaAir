import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { propertyAPI, getPropertyImage } from '../services/api'
import PropertyCard from '../components/PropertyCard'
import ScrollReveal from '../components/ScrollReveal'
import PriceRangeSlider from '../components/PriceRangeSlider'

import CityAutocomplete from '../components/CityAutocomplete'

const CITIES = [
  // 🌍 EUROPE — France
  { name: 'Paris',         e: '🗼' }, { name: 'Versailles',    e: '👑' }, { name: 'Fontainebleau', e: '🌲' },
  // Côte d'Azur / PACA
  { name: 'Nice',          e: '🌊' }, { name: 'Cannes',        e: '🎬' }, { name: 'Antibes',       e: '⛵' },
  { name: 'Marseille',     e: '⚓' }, { name: 'Aix-en-Provence', e: '🌿' }, { name: 'Toulon',      e: '🚢' },
  { name: 'Monaco',        e: '🎰' }, { name: 'Menton',        e: '🍋' }, { name: 'Saint-Tropez', e: '🌴' },
  // Occitanie / Sud-Ouest
  { name: 'Toulouse',      e: '🌹' }, { name: 'Montpellier',   e: '🎭' }, { name: 'Nîmes',        e: '🏛️' },
  { name: 'Biarritz',      e: '🏄' }, { name: 'Bordeaux',      e: '🍷' }, { name: 'Bayonne',      e: '🏳️' },
  { name: 'Arcachon',      e: '🦞' }, { name: 'Carcassonne',   e: '🏰' }, { name: 'Perpignan',    e: '🌞' },
  // Auvergne-Rhône-Alpes
  { name: 'Lyon',          e: '🦁' }, { name: 'Grenoble',      e: '⛷️' }, { name: 'Annecy',       e: '🏔' },
  { name: 'Chamonix',      e: '🏔' }, { name: 'Chambéry',      e: '🏔' }, { name: 'Megève',       e: '⛷️' },
  { name: 'Courchevel',    e: '⛷️' }, { name: 'Val-d\'Isère',  e: '🎿' }, { name: 'Clermont-Ferrand', e: '🌋' },
  // Grand-Est / Alsace
  { name: 'Strasbourg',    e: '🥨' }, { name: 'Colmar',        e: '🌸' }, { name: 'Reims',        e: '🍾' },
  { name: 'Metz',          e: '🕌' }, { name: 'Nancy',         e: '🏛️' },
  // Bretagne / Normandie
  { name: 'Rennes',        e: '🦁' }, { name: 'Brest',         e: '⚓' }, { name: 'Quimper',      e: '🎪' },
  { name: 'Saint-Malo',    e: '🏰' }, { name: 'Dinard',        e: '🌊' }, { name: 'Caen',         e: '📜' },
  { name: 'Honfleur',      e: '⚓' }, { name: 'Deauville',     e: '🎠' }, { name: 'Mont-Saint-Michel', e: '🏝️' },
  // Pays de la Loire
  { name: 'Nantes',        e: '🐘' }, { name: 'Angers',        e: '🌹' }, { name: 'La Rochelle',  e: '⛵' },
  { name: 'Île de Ré',     e: '🚲' }, { name: 'Île d\'Oléron', e: '🌊' },
  // Centre / Loire
  { name: 'Tours',         e: '🏰' }, { name: 'Amboise',       e: '🏰' }, { name: 'Blois',        e: '🏰' },
  { name: 'Orléans',       e: '🗡️' }, { name: 'Chartres',      e: '⛪' },
  // Corse
  { name: 'Ajaccio',       e: '🌊' }, { name: 'Bonifacio',     e: '🏖️' }, { name: 'Bastia',       e: '⛵' },
  { name: 'Porto-Vecchio', e: '🌴' }, { name: 'Calvi',         e: '🏖️' },
  // DOM-TOM
  { name: 'Fort-de-France', e: '🌺' }, { name: 'Pointe-à-Pitre', e: '🌴' }, { name: 'Saint-Denis (Réunion)', e: '🌋' },

  // 🇬🇧 Royaume-Uni
  { name: 'London',        e: '🎡' }, { name: 'Edinburgh',     e: '🏰' }, { name: 'Manchester',    e: '🌧️' },
  { name: 'Oxford',        e: '📚' }, { name: 'Bath',          e: '🛁' }, { name: 'Brighton',      e: '🎠' },

  // 🇪🇸 Espagne
  { name: 'Madrid',        e: '💃' }, { name: 'Barcelona',     e: '🎨' }, { name: 'Séville',       e: '🌹' },
  { name: 'Ibiza',         e: '🎶' }, { name: 'Malaga',        e: '☀️' }, { name: 'Valence',       e: '🍊' },
  { name: 'Majorque',      e: '🏖️' }, { name: 'Grenade',       e: '🕌' },

  // 🇮🇹 Italie
  { name: 'Rome',          e: '🏛️' }, { name: 'Milan',         e: '👗' }, { name: 'Venise',        e: '🚤' },
  { name: 'Florence',      e: '🌺' }, { name: 'Amalfi',        e: '🍋' }, { name: 'Côme',          e: '🏔' },
  { name: 'Cinque Terre',  e: '🌈' }, { name: 'Capri',         e: '🌊' },

  // 🇵🇹 Portugal
  { name: 'Lisbonne',      e: '🛤️' }, { name: 'Porto',         e: '🍷' }, { name: 'Algarve',       e: '🏄' },
  { name: 'Funchal',       e: '🌸' },

  // 🇬🇷 Grèce
  { name: 'Athènes',       e: '🏺' }, { name: 'Santorin',      e: '🫙' }, { name: 'Mykonos',       e: '💙' },
  { name: 'Rhodes',        e: '🌞' }, { name: 'Corfou',        e: '🌿' },

  // 🇳🇱🇧🇪🇨🇭 Benelux / Suisse
  { name: 'Amsterdam',     e: '🌷' }, { name: 'Bruxelles',     e: '🍟' }, { name: 'Genève',        e: '⌚' },
  { name: 'Zurich',        e: '🏦' }, { name: 'Bruges',        e: '🍺' },

  // 🇩🇪🇦🇹 Allemagne / Autriche
  { name: 'Berlin',        e: '🎸' }, { name: 'Munich',        e: '🍺' }, { name: 'Hambourg',      e: '⚓' },
  { name: 'Vienne',        e: '🎻' }, { name: 'Innsbruck',     e: '⛷️' },

  // 🇲🇦 Maroc
  { name: 'Marrakech',     e: '🕌' }, { name: 'Casablanca',    e: '🎬' }, { name: 'Agadir',        e: '🏖️' },
  { name: 'Fès',           e: '🏺' }, { name: 'Essaouira',     e: '🌊' },

  // 🇹🇳 Tunisie
  { name: 'Tunis',         e: '🏛️' }, { name: 'Djerba',        e: '🌴' }, { name: 'Sousse',        e: '🌊' },
  { name: 'Hammamet',      e: '🌅' },

  // 🇩🇿 Algérie
  { name: 'Alger',         e: '🌊' }, { name: 'Oran',          e: '🌺' }, { name: 'Constantine',   e: '🌉' },
  { name: 'Tlemcen',       e: '🕌' },

  // 🇹🇷 Turquie
  { name: 'Istanbul',      e: '🕌' }, { name: 'Antalya',       e: '☀️' }, { name: 'Bodrum',        e: '⛵' },
  { name: 'Cappadoce',     e: '🎈' },

  // 🇦🇪🇸🇦 Moyen-Orient
  { name: 'Dubaï',         e: '🏙️' }, { name: 'Abu Dhabi',     e: '🌆' }, { name: 'Doha',          e: '⛵' },

  // 🇺🇸 États-Unis
  { name: 'New York',      e: '🗽' }, { name: 'Los Angeles',   e: '🎬' }, { name: 'Miami',         e: '🌴' },
  { name: 'San Francisco', e: '🌉' }, { name: 'Las Vegas',     e: '🎰' }, { name: 'Chicago',       e: '🌬️' },
  { name: 'Honolulu',      e: '🌺' }, { name: 'New Orleans',   e: '🎺' },

  // 🇨🇦 Canada
  { name: 'Montréal',      e: '🍁' }, { name: 'Toronto',       e: '🏒' }, { name: 'Vancouver',     e: '🌲' },
  { name: 'Québec',        e: '❄️' },

  // 🌏 Asie
  { name: 'Tokyo',         e: '🗼' }, { name: 'Kyoto',         e: '⛩️' }, { name: 'Bangkok',       e: '🙏' },
  { name: 'Bali',          e: '🌺' }, { name: 'Singapour',     e: '🦁' }, { name: 'Séoul',         e: '🎎' },
  { name: 'Hong Kong',     e: '🏙️' }, { name: 'Maldives',      e: '🏝️' },

  // 🌎 Amérique Latine
  { name: 'Rio de Janeiro', e: '🎭' }, { name: 'Buenos Aires',  e: '💃' }, { name: 'Cancún',        e: '🌊' },
  { name: 'Medellín',      e: '🌸' }, { name: 'La Havane',     e: '🎺' },

  // 🌍 Afrique
  { name: 'Nairobi',       e: '🦁' }, { name: 'Le Cap',        e: '🌊' }, { name: 'Zanzibar',      e: '🌴' },
]

const SORT_OPTIONS = [
  { value: 'default',    label: 'Pertinence' },
  { value: 'price_asc',  label: 'Prix croissant ↑' },
  { value: 'price_desc', label: 'Prix décroissant ↓' },
  { value: 'guests_desc', label: 'Plus de capacité' },
]

const TYPE_OPTIONS = [
  { value: 'studio',    label: 'Studio',      icon: '🏠' },
  { value: 'apartment', label: 'Appartement', icon: '🏢' },
  { value: 'house',     label: 'Maison',      icon: '🏡' },
  { value: 'villa',     label: 'Villa',       icon: '🌴' },
]

// Horizontal list card for list view
function PropertyListCard({ property }) {
  const img = getPropertyImage(property)
  const price = parseFloat(property.price_per_night)
  const rating = (4.2 + (property.id % 8) * 0.1).toFixed(1)
  const reviews = 12 + (property.id % 47)
  return (
    <a href={`/annonces/${property.id}`}
      className="glass-card flex overflow-hidden group transition-all hover:scale-[1.01]"
      style={{ minHeight: 160 }}>
      <div className="relative w-56 shrink-0 overflow-hidden">
        <img src={img} alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
          <span className="text-white font-semibold text-sm">Voir le logement →</span>
        </div>
      </div>
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className="font-bold text-base leading-snug" style={{ color: 'var(--txt)' }}>{property.title}</h3>
            <div className="shrink-0 text-right">
              <span className="font-black text-xl" style={{ color: 'var(--primary-1)' }}>{price.toFixed(0)} €</span>
              <span className="text-xs" style={{ color: 'var(--txt-4)' }}>/nuit</span>
            </div>
          </div>
          <p className="text-sm mb-3" style={{ color: 'var(--txt-3)' }}>
            📍 {property.city}{property.country ? `, ${property.country}` : ''}
          </p>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--txt-3)' }}>
            <span>👥 {property.max_guests} voyageurs</span>
            {property.bedrooms && <span>🛏 {property.bedrooms} ch.</span>}
            <span className="capitalize">{property.property_type || 'logement'}</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <span style={{ color: '#f59e0b' }}>★</span>
            <span className="font-semibold text-xs" style={{ color: 'var(--txt-2)' }}>{rating}</span>
            <span className="text-xs" style={{ color: 'var(--txt-4)' }}>({reviews})</span>
          </div>
        </div>
      </div>
    </a>
  )
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [properties, setProperties] = useState([])
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [pagination, setPagination]   = useState(null)
  const [sort, setSort]               = useState('default')
  const [viewMode, setViewMode]       = useState('grid') // 'grid' | 'list'
  const [filtersOpen, setFiltersOpen] = useState(true)
  const [page, setPage]               = useState(1)

  const [city,      setCity]      = useState(searchParams.get('city') || '')
  const [maxPrice,  setMaxPrice]  = useState(searchParams.get('max_price') || '')
  const [minPrice,  setMinPrice]  = useState(searchParams.get('min_price') || '')
  const [type,      setType]      = useState(searchParams.get('type') || '')
  const [minGuests, setMinGuests] = useState(Number(searchParams.get('min_guests') || 1))
  const [minRooms,  setMinRooms]  = useState(1)
  const [selectedSeason, setSelectedSeason] = useState(null) // id de la saison active
  const [seasonLabel,    setSeasonLabel]    = useState('')   // label affiché dans le header

  // Draft filters (applied on submit)
  const [draftCity,      setDraftCity]      = useState(city)
  const [draftMaxPrice,  setDraftMaxPrice]  = useState(maxPrice)
  const [draftMinPrice,  setDraftMinPrice]  = useState(minPrice)
  const [draftType,      setDraftType]      = useState(type)
  const [draftMinGuests, setDraftMinGuests] = useState(minGuests)
  const [draftMinRooms,  setDraftMinRooms]  = useState(minRooms)
  const [priceRange,     setPriceRange]     = useState([0, 5000])


  const LIMIT = 9

  const buildQuery = (overrides = {}) => {
    const q = {
      city,
      max_price:     maxPrice,
      min_price:     minPrice,
      property_type: type,
      min_guests:    minGuests > 1 ? minGuests : '',
      bedrooms:      minRooms  > 1 ? minRooms  : '',   // FIX : minRooms envoyé à l'API
      page,
      limit: LIMIT,
    }
    return Object.fromEntries(
      Object.entries({ ...q, ...overrides }).filter(([, v]) => v !== '' && v !== undefined && v !== null)
    )
  }

  const fetchProperties = async (overrides = {}) => {
    setLoading(true)
    setError('')
    try {
      const query = buildQuery(overrides)
      const res = await propertyAPI.getAll(query)
      const data = Array.isArray(res.data) ? res.data : []
      setProperties(data)
      setPagination({
        total:      parseInt(res.headers['x-total-count']  || data.length),
        totalPages: parseInt(res.headers['x-total-pages']  || 1),
        page:       parseInt(res.headers['x-current-page'] || 1),
        hasNext:    res.headers['x-has-next'] === 'true',
        hasPrev:    res.headers['x-has-prev'] === 'true',
      })
    } catch {
      setError('Erreur lors du chargement des annonces.')
    } finally {
      setLoading(false)
    }
  }

  // Charge toutes les villes d'une saison en parallèle et fusionne les résultats
  const fetchSeasonProperties = async (cities, label) => {
    setLoading(true)
    setError('')
    setSeasonLabel(label)
    try {
      const responses = await Promise.all(
        cities.map(c => propertyAPI.getAll({ city: c, limit: 50 }).catch(() => ({ data: [] })))
      )
      const merged = []
      const seen = new Set()
      responses.forEach(r => {
        (Array.isArray(r.data) ? r.data : []).forEach(p => { if (!seen.has(p.id)) { seen.add(p.id); merged.push(p) } })
      })
      setProperties(merged)
      setPagination({ total: merged.length, totalPages: 1, page: 1, hasNext: false, hasPrev: false })
    } catch {
      setError('Erreur lors du chargement.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProperties() }, [page])

  const handleSearch = (e) => {
    e.preventDefault()
    setCity(draftCity)
    setMaxPrice(draftMaxPrice)
    setMinPrice(draftMinPrice)
    setType(draftType)
    setMinGuests(draftMinGuests)
    setMinRooms(draftMinRooms)
    setPage(1)
    const p = {}
    if (draftCity)           p.city       = draftCity
    if (draftMaxPrice)       p.max_price  = draftMaxPrice
    if (draftMinPrice)       p.min_price  = draftMinPrice
    if (draftType)           p.type       = draftType
    if (draftMinGuests > 1)  p.min_guests = draftMinGuests
    setSearchParams(p)
    fetchProperties({
      city: draftCity, max_price: draftMaxPrice, min_price: draftMinPrice,
      property_type: draftType,
      min_guests: draftMinGuests > 1 ? draftMinGuests : '',
      bedrooms:   draftMinRooms  > 1 ? draftMinRooms  : '',
      page: 1,
    })
  }

  const removeFilter = (key) => {
    const newParams = {}
    if (key !== 'city')       { if (city)      newParams.city       = city }
    if (key !== 'max_price' && key !== 'min_price') {
      if (maxPrice) newParams.max_price = maxPrice
      if (minPrice) newParams.min_price = minPrice
    }
    if (key !== 'type')       { if (type)      newParams.type       = type }
    if (key !== 'min_guests') { if (minGuests > 1) newParams.min_guests = minGuests }

    if (key === 'city')       { setCity(''); setDraftCity(''); setSelectedSeason(null) }
    if (key === 'max_price' || key === 'min_price') {
      setMaxPrice(''); setMinPrice(''); setDraftMaxPrice(''); setDraftMinPrice('')
    }
    if (key === 'type')       { setType(''); setDraftType('') }
    if (key === 'min_guests') { setMinGuests(1); setDraftMinGuests(1) }
    setSearchParams(newParams)
    setPage(1)
    // Will re-fetch via the state update
    setTimeout(() => fetchProperties({ ...newParams, page: 1 }), 0)
  }

  const handleReset = () => {
    setSelectedSeason(null)
    setCity(''); setMaxPrice(''); setMinPrice(''); setType(''); setMinGuests(1); setMinRooms(1); setSort('default'); setPage(1)
    setDraftCity(''); setDraftMaxPrice(''); setDraftMinPrice(''); setDraftType(''); setDraftMinGuests(1); setDraftMinRooms(1)
    setSearchParams({})
    fetchProperties({ city: '', max_price: '', min_price: '', property_type: '', min_guests: '', page: 1 })
  }

  const handleCityClick = (name) => {
    setCity(name); setDraftCity(name); setPage(1)
    fetchProperties({ city: name, page: 1 })
  }

  const sortedProperties = useMemo(() => {
    const arr = [...properties]
    switch (sort) {
      case 'price_asc':   return arr.sort((a, b) => parseFloat(a.price_per_night) - parseFloat(b.price_per_night))
      case 'price_desc':  return arr.sort((a, b) => parseFloat(b.price_per_night) - parseFloat(a.price_per_night))
      case 'guests_desc': return arr.sort((a, b) => b.max_guests - a.max_guests)
      default:            return arr
    }
  }, [properties, sort])

  // Active filter chips
  const activeFilters = []
  if (city)      activeFilters.push({ key: 'city', label: `🏙 ${city}` })
  if (minPrice || maxPrice) {
    const label = minPrice && maxPrice ? `💶 ${minPrice}€ - ${maxPrice}€`
                : minPrice ? `💶 min ${minPrice}€`
                : `💶 max ${maxPrice}€`
    activeFilters.push({ key: 'max_price', label })
  }
  if (type) {
    const t = TYPE_OPTIONS.find(o => o.value === type)
    activeFilters.push({ key: 'type', label: `${t?.icon || '🏠'} ${t?.label || type}` })
  }
  if (minGuests > 1) activeFilters.push({ key: 'min_guests', label: `👥 ${minGuests}+ voyageurs` })

  const totalFound = pagination?.total ?? properties.length

  return (
    <div className="pt-20 pb-16 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">

        {/* Filtre saison actif — badge compact sous la barre */}
        {selectedSeason && (
          <div className="flex flex-wrap items-center gap-2 mb-4 animate-fade-in-up">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(255,107,53,0.12)', color: 'var(--primary-1)', border: '1px solid rgba(255,107,53,0.25)' }}>
              {selectedSeason === 'hot' ? '☀️' : selectedSeason === 'cold' ? '❄️' : selectedSeason === 'harvest' ? '🍂' : '🌸'} {seasonLabel}
            </span>
            {(
              selectedSeason === 'hot'     ? ['Nice','Biarritz','Marseille','Saint-Tropez','Cannes'] :
              selectedSeason === 'cold'    ? ['Chamonix','Grenoble','Megève','Courchevel','Val-d\'Isère'] :
              selectedSeason === 'harvest' ? ['Bordeaux','Strasbourg','Lyon','Colmar','Reims'] :
              ['Paris','Lyon','Bordeaux','Strasbourg','Versailles']
            ).map(c => (
              <button key={c} onClick={() => { setCity(c); setDraftCity(c); setPage(1); fetchProperties({ city: c, page: 1 }) }}
                className="text-xs px-3 py-1 rounded-full transition-all hover:scale-105"
                style={city === c
                  ? { background: 'var(--primary-1)', color: 'white', fontWeight: 700 }
                  : { background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--txt-3)' }}>
                {c}
              </button>
            ))}
            <button onClick={() => { setSelectedSeason(null); setSeasonLabel(''); setCity(''); setDraftCity(''); setPage(1); fetchProperties({ city: '', page: 1 }) }}
              className="text-xs px-2 py-1 rounded-full"
              style={{ background: 'var(--surface)', color: 'var(--txt-4)', border: '1px solid var(--border)' }}>
              ✕
            </button>
          </div>
        )}

        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-black mb-2" style={{ color: 'var(--txt)' }}>
            Trouver votre <span className="gradient-text">logement idéal</span>
          </h1>
          <p className="text-lg" style={{ color: 'var(--txt-3)' }}>
            {loading ? 'Recherche en cours...' : pagination
              ? <span>
                  <span className="font-black" style={{ color: 'var(--primary-1)' }}>{totalFound}</span>
                  {' '}logement{totalFound !== 1 ? 's' : ''} disponible{totalFound !== 1 ? 's' : ''}
                  {seasonLabel
                    ? <span> — <strong style={{ color: 'var(--accent)' }}>{seasonLabel}</strong></span>
                    : city && <span> à <strong style={{ color: 'var(--accent)' }}>{city}</strong></span>
                  }
                </span>
              : 'Recherchez parmi des milliers de logements'}
          </p>
        </div>

        {/* Search bar + toggle filtres */}
        <div className="glass p-4 mb-4 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <form onSubmit={handleSearch}>
            <div className="flex gap-3 mb-3">
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 z-10 pointer-events-none" style={{ color: 'var(--txt-4)' }}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <CityAutocomplete
                  value={draftCity}
                  onChange={setDraftCity}
                  onSelect={c => { setDraftCity(c); setCity(c); setPage(1); fetchProperties({ city: c, page: 1 }) }}
                  placeholder="Quelle ville ? Paris, Lyon, Nice..."
                  style={{ position: 'relative' }}
                  className="input-field pl-10 pr-4 text-base"
                />
              </div>
              <button type="submit" className="btn-primary px-6 py-2.5 font-semibold whitespace-nowrap btn-shimmer">
                Appliquer
              </button>
              <button type="button" onClick={() => setFiltersOpen(o => !o)}
                className="px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2"
                style={{
                  background: filtersOpen ? 'rgba(255,107,53,0.12)' : 'var(--surface)',
                  color: filtersOpen ? 'var(--secondary)' : 'var(--txt-2)',
                  border: `1px solid ${filtersOpen ? 'rgba(255,107,53,0.30)' : 'var(--border)'}`,
                }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                </svg>
                Filtres
                <svg className={`w-3.5 h-3.5 transition-transform ${filtersOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Active filter chips */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {activeFilters.map(f => (
                  <button key={f.key} type="button" onClick={() => removeFilter(f.key)}
                    className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full transition-all hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,107,53,0.15), rgba(255,107,53,0.12))',
                      border: '1px solid rgba(255,107,53,0.3)',
                      color: 'var(--primary-1)',
                    }}>
                    {f.label}
                    <span className="ml-0.5 font-bold opacity-70 hover:opacity-100">✕</span>
                  </button>
                ))}
                <button type="button" onClick={handleReset}
                  className="text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105"
                  style={{ background: 'var(--surface)', color: 'var(--txt-4)', border: '1px solid var(--border)' }}>
                  Tout effacer
                </button>
              </div>
            )}

            {/* Filtres avancés dépliables */}
            {filtersOpen && (
              <div className="pt-4 border-t space-y-4 animate-fade-in-up" style={{ borderColor: 'var(--border)' }}>
                {/* Slider prix */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold" style={{ color: 'var(--txt-3)' }}>💶 Fourchette de prix</label>
                    <span className="text-xs font-bold" style={{ color: 'var(--primary-1)' }}>
                      {priceRange[0] > 0 ? `${priceRange[0]} €` : 'Aucun min'}
                      {' — '}
                      {priceRange[1] < 5000 ? `${priceRange[1]} €` : '5000 € +'}
                    </span>
                  </div>
                  <PriceRangeSlider
                    min={0} max={5000}
                    value={priceRange}
                    onChange={(range) => {
                      setPriceRange(range)
                      setDraftMinPrice(range[0] > 0    ? String(range[0]) : '')
                      setDraftMaxPrice(range[1] < 5000 ? String(range[1]) : '')
                    }}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs" style={{ color: 'var(--txt-4)' }}>0 €</span>
                    <span className="text-xs" style={{ color: 'var(--txt-4)' }}>5000 € +</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--txt-3)' }}>💶 Prix min (€)</label>
                    <input type="number" value={draftMinPrice}
                      onChange={e => {
                        const v = Math.max(0, Math.min(Number(e.target.value) || 0, 1490))
                        setDraftMinPrice(e.target.value)
                        setPriceRange(r => [v, Math.max(v + 10, r[1])])
                      }}
                      placeholder="0" min="0" max="1490" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--txt-3)' }}>💶 Prix max (€)</label>
                    <input type="number" value={draftMaxPrice}
                      onChange={e => {
                        const raw = Number(e.target.value) || 5000
                        const v = Math.max(10, Math.min(raw, 5000)) // jamais > 5000
                        setDraftMaxPrice(e.target.value)
                        setPriceRange(r => [r[0], v])
                      }}
                      placeholder="5000" min="10" max="5000" className="input-field" />
                  </div>

                  {/* Voyageurs */}
                  <div>
                    <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--txt-3)' }}>👥 Voyageurs min</label>
                    <div className="flex items-center gap-2">
                      <button type="button"
                        onClick={() => setDraftMinGuests(g => Math.max(1, g - 1))}
                        className="w-9 h-9 rounded-xl font-bold transition-all hover:scale-110 flex items-center justify-center"
                        style={{ background: 'var(--surface)', color: 'var(--txt)', border: '1px solid var(--border)' }}>
                        −
                      </button>
                      <span className="flex-1 text-center font-bold" style={{ color: 'var(--txt)' }}>{draftMinGuests}</span>
                      <button type="button"
                        onClick={() => setDraftMinGuests(g => Math.min(20, g + 1))}
                        className="w-9 h-9 rounded-xl font-bold transition-all hover:scale-110 flex items-center justify-center"
                        style={{ background: 'var(--surface)', color: 'var(--txt)', border: '1px solid var(--border)' }}>
                        +
                      </button>
                    </div>
                  </div>

                  {/* Chambres */}
                  <div>
                    <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--txt-3)' }}>🛏 Chambres min</label>
                    <div className="flex items-center gap-2">
                      <button type="button"
                        onClick={() => setDraftMinRooms(r => Math.max(1, r - 1))}
                        className="w-9 h-9 rounded-xl font-bold transition-all hover:scale-110 flex items-center justify-center"
                        style={{ background: 'var(--surface)', color: 'var(--txt)', border: '1px solid var(--border)' }}>
                        −
                      </button>
                      <span className="flex-1 text-center font-bold" style={{ color: 'var(--txt)' }}>{draftMinRooms}</span>
                      <button type="button"
                        onClick={() => setDraftMinRooms(r => Math.min(10, r + 1))}
                        className="w-9 h-9 rounded-xl font-bold transition-all hover:scale-110 flex items-center justify-center"
                        style={{ background: 'var(--surface)', color: 'var(--txt)', border: '1px solid var(--border)' }}>
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Type de logement */}
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--txt-3)' }}>🏠 Type de logement</label>
                  <div className="flex flex-wrap gap-2">
                    {TYPE_OPTIONS.map(opt => (
                      <button key={opt.value} type="button"
                        onClick={() => setDraftType(t => t === opt.value ? '' : opt.value)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all hover:scale-105"
                        style={draftType === opt.value ? {
                          background: 'linear-gradient(135deg, var(--primary-1), var(--secondary))',
                          color: 'white',
                          boxShadow: '0 4px 14px rgba(255,107,53,0.25)',
                        } : {
                          background: 'var(--surface)',
                          color: 'var(--txt-2)',
                          border: '1px solid var(--border)',
                        }}>
                        <span>{opt.icon}</span>
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tri + actions */}
                <div className="flex items-center gap-3 flex-wrap pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold" style={{ color: 'var(--txt-3)' }}>Trier par :</label>
                    <select value={sort} onChange={e => setSort(e.target.value)} className="input-field w-auto text-sm py-1.5">
                      {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <button type="button" onClick={handleReset}
                    className="text-sm px-4 py-1.5 rounded-xl transition-all"
                    style={{ background: 'var(--surface)', color: 'var(--txt-3)', border: '1px solid var(--border)' }}>
                    ✕ Réinitialiser
                  </button>
                </div>

                {/* Filtrer par ambiance */}
                <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                  <label className="block text-xs font-semibold mb-3" style={{ color: 'var(--txt-3)' }}>🌍 Filtrer par ambiance</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'hot',     label: 'Destinations chaudes', icon: '☀️', gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)', glow: 'rgba(245,158,11,0.35)', desc: 'Plages · Mer · Soleil',          cities: ['Nice','Biarritz','Marseille'] },
                      { id: 'mild',    label: 'Destinations douces',  icon: '🌸', gradient: 'linear-gradient(135deg, #10b981, #FFC857)', glow: 'rgba(16,185,129,0.25)',  desc: 'Culture · Nature · Escapades',  cities: ['Paris','Lyon','Bordeaux','Strasbourg'] },
                      { id: 'cold',    label: 'Destinations froides', icon: '❄️', gradient: 'linear-gradient(135deg, #38bdf8, #6366f1)', glow: 'rgba(56,189,248,0.30)',  desc: 'Ski · Montagne · Chalet',        cities: ['Chamonix'] },
                      { id: 'harvest', label: 'Destinations automnales', icon: '🍂', gradient: 'linear-gradient(135deg, #d97706, #b45309)', glow: 'rgba(217,119,6,0.30)', desc: 'Vignobles · Marchés · Forêts', cities: ['Bordeaux','Strasbourg','Lyon'] },
                    ].map(s => {
                      const isActive = selectedSeason === s.id
                      return (
                        <button key={s.id} type="button"
                          onClick={() => {
                            if (isActive) { setSelectedSeason(null); setSeasonLabel(''); setCity(''); setDraftCity(''); setPage(1); fetchProperties({ city: '', page: 1 }) }
                            else { setSelectedSeason(s.id); setCity(''); setDraftCity(''); fetchSeasonProperties(s.cities, s.label) }
                          }}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 text-left"
                          style={isActive ? { background: s.gradient, color: 'white', boxShadow: `0 4px 14px ${s.glow}` }
                            : { background: 'var(--surface)', border: '1px solid var(--border-2)', color: 'var(--txt-2)' }}>
                          <span className="text-lg shrink-0">{s.icon}</span>
                          <div className="min-w-0">
                            <div className="font-semibold text-xs leading-tight">{s.label}</div>
                            <div className="text-xs opacity-60 font-normal leading-tight mt-0.5">{s.desc}</div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm px-4 py-3 rounded-xl mb-6">
            ⚠️ {error}
          </div>
        )}

        {/* Barre résultats + view toggle */}
        {!loading && properties.length > 0 && (
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <p className="text-sm" style={{ color: 'var(--txt-3)' }}>
              <span className="font-bold" style={{ color: 'var(--txt)' }}>{totalFound}</span>
              {' '}logement{totalFound !== 1 ? 's' : ''} trouvé{totalFound !== 1 ? 's' : ''}
            </p>
            {/* View toggle */}
            <div className="flex items-center gap-2">
              <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                <button type="button" onClick={() => setViewMode('grid')}
                  className="px-3 py-2 transition-all"
                  style={viewMode === 'grid'
                    ? { background: 'var(--primary-1)', color: 'white' }
                    : { background: 'var(--surface)', color: 'var(--txt-3)' }}
                  title="Vue grille">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button type="button" onClick={() => setViewMode('list')}
                  className="px-3 py-2 transition-all"
                  style={viewMode === 'list'
                    ? { background: 'var(--primary-1)', color: 'white' }
                    : { background: 'var(--surface)', color: 'var(--txt-3)' }}
                  title="Vue liste">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 000 2h14a1 1 0 100-2H3zm0 4a1 1 0 000 2h14a1 1 0 100-2H3zm0 4a1 1 0 000 2h14a1 1 0 100-2H3z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Résultats */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card h-72 animate-pulse">
                <div className="h-48 bg-white/5 rounded-t-2xl" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : properties.length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {sortedProperties.map((p, i) => (
                  <ScrollReveal key={p.id} delay={i * 40}>
                    <PropertyCard property={p} />
                  </ScrollReveal>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4 mb-8">
                {sortedProperties.map((p, i) => (
                  <ScrollReveal key={p.id} delay={i * 30}>
                    <PropertyListCard property={p} />
                  </ScrollReveal>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrev}
                  className="btn-secondary px-5 py-2 text-sm disabled:opacity-30 flex items-center gap-1">
                  ← Précédent
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pg = Math.max(1, Math.min(pagination.page - 2, pagination.totalPages - 4)) + i
                    return (
                      <button key={pg} onClick={() => setPage(pg)}
                        className="w-10 h-10 rounded-xl text-sm font-bold transition-all hover:scale-110"
                        style={pg === pagination.page
                          ? { background: 'linear-gradient(135deg, var(--primary-1), var(--primary-2))', color: 'white', boxShadow: '0 4px 14px rgba(255,107,53,0.3)' }
                          : { background: 'var(--surface)', color: 'var(--txt-2)', border: '1px solid var(--border)' }}>
                        {pg}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={!pagination.hasNext}
                  className="btn-secondary px-5 py-2 text-sm disabled:opacity-30 flex items-center gap-1">
                  Suivant →
                </button>

                <span className="text-xs w-full text-center mt-1" style={{ color: 'var(--txt-4)' }}>
                  Page {pagination.page}/{pagination.totalPages} · {pagination.total} résultats
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="glass p-20 text-center animate-zoom-in">
            <div className="text-7xl mb-6 animate-bounce">🏠</div>
            <h2 className="font-black text-2xl mb-3" style={{ color: 'var(--txt)' }}>Aucun logement trouvé</h2>
            <p className="text-base mb-8" style={{ color: 'var(--txt-3)' }}>
              Essayez d'élargir vos critères de recherche ou explorez une autre ville.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button onClick={handleReset} className="btn-secondary px-6 py-2.5 text-sm">
                ✕ Réinitialiser les filtres
              </button>
              <button onClick={() => handleCityClick('Paris')} className="btn-primary px-6 py-2.5 text-sm">
                🗼 Explorer Paris
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

