import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { propertyAPI, serviceAPI, getPropertyImage } from '../services/api'
import ScrollReveal from '../components/ScrollReveal'

// ── Moteur d'analyse IA (simulation intelligente) ──────────
const AMBIANCE_MAP = {
  'mer|océan|plage|mer|bord de mer|marine|maritime':
    { cities: ['Nice','Biarritz','Marseille','Cannes','Saint-Tropez','Antibes'], types: ['villa','apartment'], keywords: ['Vue mer','Plage'] },
  'montagne|ski|neige|alpes|chalet|altitude':
    { cities: ['Chamonix','Megève','Courchevel','Grenoble','Val-d\'Isère','Annecy'], types: ['house','villa'], keywords: ['Ski','Montagne'] },
  'romantique|amoureux|couple|lune de miel|intimité':
    { max_guests: 2, types: ['apartment','villa'], min_price: 80, keywords: ['Romantique'] },
  'famille|enfants|kids|grande famille|familial':
    { min_guests: 4, types: ['house','villa'], keywords: ['Famille'] },
  'télétravail|travail|distance|coworking|bureau|remote':
    { amenities: ['WiFi'], types: ['studio','apartment'], keywords: ['WiFi'] },
  'piscine|piscine privée|baignade':
    { types: ['villa','house'], keywords: ['Piscine'] },
  'luxe|prestige|palace|haut de gamme|premium':
    { min_price: 200, types: ['villa','apartment'], keywords: ['Luxe'] },
  'budget|économique|pas cher|abordable|petit budget':
    { max_price: 80, keywords: ['Économique'] },
  'nature|campagne|verdure|calme|repos|forêt':
    { cities: ['Dordogne','Provence','Normandie','Alsace','Corrèze'], types: ['house','villa'], keywords: ['Nature'] },
  'ville|urbain|city|centre-ville|animation|nightlife':
    { cities: ['Paris','Lyon','Bordeaux','Marseille','Toulouse'], types: ['apartment','studio'], keywords: ['Urbain'] },
  'paris|éiffel|capitale|haussmann':
    { cities: ['Paris'], keywords: ['Paris'] },
}

const DEST_SUGGESTIONS = {
  nature:      [{ city: 'Chamonix', desc: 'Alpes françaises', emoji: '🏔', price: 180 }, { city: 'Dordogne', desc: 'Périgord Noir', emoji: '🌿', price: 95 }],
  sea:         [{ city: 'Nice',     desc: 'Côte d\'Azur',    emoji: '🌊', price: 145 }, { city: 'Biarritz', desc: 'Atlantique',   emoji: '🏄', price: 130 }],
  city:        [{ city: 'Paris',    desc: 'Ville lumière',   emoji: '🗼', price: 150 }, { city: 'Lyon',     desc: 'Gastronomie', emoji: '🦁', price: 110 }],
  romantic:    [{ city: 'Paris',    desc: 'La plus romantique', emoji: '💕', price: 180 }, { city: 'Nice',  desc: 'Coucher de soleil', emoji: '🌅', price: 160 }],
  luxury:      [{ city: 'Monaco',   desc: 'Glamour absolu',  emoji: '💎', price: 450 }, { city: 'Cannes',  desc: 'Festival & plage', emoji: '🎬', price: 320 }],
}

function parseUserInput(text) {
  const t = text.toLowerCase()
  const result = { filters: {}, keywords: [], destinations: [], mood: 'general', budget: null, persons: null, days: null }

  // Extraire budget
  const budgetMatch = t.match(/(\d+)\s*€|\€\s*(\d+)|budget\s*(\d+)/)
  if (budgetMatch) result.budget = parseInt(budgetMatch[1] || budgetMatch[2] || budgetMatch[3])

  // Extraire personnes
  const personsMatch = t.match(/(\d+)\s*(personnes?|pers|adultes?|voyageurs?|amis?|enfants?)/i)
  if (personsMatch) result.persons = parseInt(personsMatch[1])
  if (t.includes('couple') || t.includes('deux')) result.persons = 2
  if (t.includes('solo') || t.includes('seul')) result.persons = 1
  if (t.includes('famille')) result.persons = Math.max(result.persons || 0, 4)

  // Extraire durée
  const daysMatch = t.match(/(\d+)\s*(jours?|nuits?|semaines?)/i)
  if (daysMatch) {
    const n = parseInt(daysMatch[1])
    result.days = daysMatch[2].startsWith('semaine') ? n * 7 : n
  }

  // Matcher les ambiances
  for (const [pattern, config] of Object.entries(AMBIANCE_MAP)) {
    if (new RegExp(pattern, 'i').test(t)) {
      if (config.cities)      result.filters.city = config.cities[0]
      if (config.types)       result.filters.property_type = config.types[0]
      if (config.min_price)   result.filters.min_price = config.min_price
      if (config.max_price)   result.filters.max_price = config.max_price
      if (config.min_guests)  result.filters.min_guests = config.min_guests
      result.keywords.push(...(config.keywords || []))
      result.destinations.push(...(config.cities || []))
    }
  }

  // Mood global
  if (/mer|plage|océan/.test(t)) result.mood = 'sea'
  else if (/montagne|ski|alpes/.test(t)) result.mood = 'nature'
  else if (/romantique|couple|amour/.test(t)) result.mood = 'romantic'
  else if (/luxe|prestige/.test(t)) result.mood = 'luxury'
  else if (/paris|lyon|ville/.test(t)) result.mood = 'city'

  // Appliquer budget si fourni
  if (result.budget && result.days) {
    result.filters.max_price = Math.floor(result.budget / result.days)
  } else if (result.budget) {
    result.filters.max_price = result.budget
  }

  if (result.persons) result.filters.min_guests = result.persons

  return result
}

function computeAIScore(property, reviews = []) {
  let score = 0
  const price = parseFloat(property.price_per_night)

  // Valeur/prix (0-30 pts) - moins cher que 150€ = bon rapport
  score += price < 80 ? 30 : price < 120 ? 25 : price < 180 ? 20 : price < 250 ? 15 : 10

  // Photos (0-20 pts)
  const imgCount = property.images?.length || 0
  score += Math.min(imgCount * 4, 20)

  // Capacité (0-15 pts)
  score += Math.min(property.max_guests * 2, 15)

  // Équipements / type (0-20 pts)
  const typeScores = { villa: 20, house: 17, apartment: 15, studio: 10 }
  score += typeScores[property.property_type] || 10

  // Avis (0-15 pts)
  const propReviews = reviews.filter(r => r.property_id === property.id)
  if (propReviews.length > 0) {
    const avg = propReviews.reduce((s, r) => s + r.rating, 0) / propReviews.length
    score += Math.round(avg * 3)
  } else {
    score += 10 // neutre
  }

  return Math.min(Math.max(score, 40), 99)
}

// ── Message IA animé ───────────────────────────────────────
function TypewriterText({ text, speed = 18, onDone }) {
  const [displayed, setDisplayed] = useState('')
  useEffect(() => {
    setDisplayed('')
    let i = 0
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, ++i))
      } else {
        clearInterval(timer)
        onDone?.()
      }
    }, speed)
    return () => clearInterval(timer)
  }, [text])
  return <span>{displayed}<span className="animate-pulse">▌</span></span>
}

// ── Carte résultat IA ──────────────────────────────────────
function AIPropertyCard({ property, score }) {
  const label =
    score >= 90 ? { txt: '🏆 Excellent', color: '#10b981' } :
    score >= 80 ? { txt: '⭐ Très bien',  color: '#FFC857' } :
    score >= 70 ? { txt: '👍 Bien',       color: '#00B8D9' } :
                  { txt: '✅ Correct',    color: 'var(--txt-3)' }

  return (
    <Link to={`/annonces/${property.id}`}
      className="glass-card overflow-hidden group hover:scale-[1.02] transition-all duration-300 block">
      <div className="relative h-44 overflow-hidden">
        <img src={getPropertyImage(property)} alt={property.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={e => { e.target.src='https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
        {/* Score IA */}
        <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-black"
          style={{ background: 'rgba(0,0,0,0.70)', color: label.color, backdropFilter: 'blur(4px)' }}>
          🧠 {score}/100
        </div>
        <div className="absolute bottom-2 left-3 right-3">
          <p className="text-white font-bold text-sm line-clamp-1" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.7)' }}>
            {property.title}
          </p>
          <p className="text-white/70 text-xs">📍 {property.city}</p>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-base font-black gradient-text">{parseFloat(property.price_per_night).toFixed(0)} €/nuit</span>
          <span className="text-xs font-bold" style={{ color: label.color }}>{label.txt}</span>
        </div>
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          <div className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${score}%`, background: `linear-gradient(to right, #FF6B35, ${label.color})` }} />
        </div>
      </div>
    </Link>
  )
}

// ══════════════════════════════════════════════════════════════
// PAGE ASSISTANT IA
// ══════════════════════════════════════════════════════════════
export default function AI() {
  const [input,       setInput]       = useState('')
  const [messages,    setMessages]    = useState([
    { role: 'ai', text: 'Bonjour ! 👋 Je suis votre assistant voyage IA. Décrivez-moi votre voyage idéal et je vous proposerai les meilleurs logements et activités. Par exemple : "Je suis en couple, budget 600 €, 4 jours, j\'aime la mer et la bonne cuisine."' }
  ])
  const [properties,  setProperties]  = useState([])
  const [services,    setServices]    = useState([])
  const [loading,     setLoading]     = useState(false)
  const [parsed,      setParsed]      = useState(null)
  const [destinations,setDestinations]= useState([])

  const QUICK_PROMPTS = [
    '🌊 Vue sur mer, villa avec piscine',
    '🏔 Chalet montagne ski famille 4 pers.',
    '💑 Escapade romantique couple 2 nuits',
    '💼 Télétravail calme bon WiFi',
    '🎉 500 € budget 3 jours nature',
    '🌍 Luxe prestige Côte d\'Azur',
  ]

  // Scroll désactivé — navigation manuelle

  const analyzeAndSearch = async (text) => {
    if (!text.trim()) return
    setLoading(true)

    // Ajouter le message utilisateur
    setMessages(prev => [...prev, { role: 'user', text }])
    setInput('')

    // Parser l'intention
    const analysis = parseUserInput(text)
    setParsed(analysis)

    // Message "en train de réfléchir"
    setMessages(prev => [...prev, { role: 'ai', text: '🔍 J\'analyse votre demande...', loading: true }])

    try {
      // Appel API avec les filtres extraits
      const params = { limit: 6, ...analysis.filters }
      const [propsRes, svcRes] = await Promise.all([
        propertyAPI.getAll(params),
        serviceAPI.getAll({ category: analysis.mood !== 'general' ? analysis.mood : undefined }).catch(() => ({ data: [] })),
      ])

      const props = propsRes.data || []
      const svcs  = (svcRes.data || []).slice(0, 3)
      setProperties(props)
      setServices(svcs)

      // Destinations suggérées
      const dests = DEST_SUGGESTIONS[analysis.mood] || DEST_SUGGESTIONS.city
      setDestinations(dests)

      // Générer le résumé IA
      const budget    = analysis.budget ? `${analysis.budget} €` : 'flexible'
      const persons   = analysis.persons ? `${analysis.persons} personne${analysis.persons > 1 ? 's' : ''}` : 'votre groupe'
      const days      = analysis.days    ? `${analysis.days} nuit${analysis.days > 1 ? 's' : ''}` : 'votre séjour'
      const destName  = analysis.destinations[0] || dests[0]?.city || 'France'
      const keywords  = analysis.keywords.length ? analysis.keywords.join(', ') : 'votre style'
      const priceEst  = analysis.filters.max_price
        ? `~${analysis.filters.max_price} €/nuit max`
        : props.length ? `~${Math.round(props.reduce((s,p) => s + parseFloat(p.price_per_night), 0) / props.length)} €/nuit en moyenne`
        : 'à partir de 65 €/nuit'

      const summary = props.length > 0
        ? `✨ Parfait ! J'ai trouvé **${props.length} logement${props.length > 1 ? 's' : ''}** pour ${persons} · ${days} · budget ${budget}.\n\n🏡 Je recommande **${destName}** pour votre profil « ${keywords} ».\n💶 Budget estimé : ${priceEst}.\n${svcs.length > 0 ? `🎯 ${svcs.length} activité${svcs.length > 1 ? 's' : ''} correspondant à vos goûts trouvée${svcs.length > 1 ? 's' : ''}.` : ''}`
        : `🤔 Je n'ai pas trouvé de logements exacts pour ces critères. Voici mes meilleures recommandations générales pour **${destName}** — essayez d'élargir votre budget ou votre période.`

      // Remplacer le message "en train de réfléchir"
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'ai', text: summary, isResult: true }
      ])
    } catch {
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'ai', text: '⚠️ Désolé, une erreur est survenue. Réessayez dans quelques instants.' }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    analyzeAndSearch(input)
  }

  return (
    <div className="pt-20 pb-16 px-4 min-h-screen">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
            style={{ background: 'rgba(255,107,53,0.12)', color: 'var(--primary-1)', border: '1px solid rgba(255,107,53,0.25)' }}>
            🤖 Propulsé par intelligence artificielle
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black mb-3" style={{ color: 'var(--txt)' }}>
            Votre voyage,<br /><span className="gradient-text">pensé par l'IA</span>
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--txt-3)' }}>
            Décrivez votre séjour idéal en langage naturel. L'IA analyse et sélectionne les meilleurs logements et activités pour vous.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Chat IA ── */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Messages */}
            <div className="glass-card p-4 flex flex-col gap-3 overflow-y-auto"
              style={{ minHeight: '320px', maxHeight: '420px' }}>
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'text-white'
                      : ''
                  }`}
                    style={msg.role === 'user'
                      ? { background: 'linear-gradient(135deg, var(--primary-1), var(--primary-2))', borderBottomRightRadius: '4px' }
                      : { background: 'var(--surface-2)', color: 'var(--txt)', borderBottomLeftRadius: '4px', border: '1px solid var(--border)' }}>
                    {msg.loading ? (
                      <span className="flex items-center gap-2">
                        <span className="flex gap-1">
                          {[0,1,2].map(d => (
                            <span key={d} className="w-1.5 h-1.5 rounded-full animate-bounce"
                              style={{ background: 'var(--primary-1)', animationDelay: `${d * 0.15}s` }} />
                          ))}
                        </span>
                        Analyse en cours…
                      </span>
                    ) : (
                      <span style={{ whiteSpace: 'pre-line' }}>
                        {msg.text.split('**').map((part, j) =>
                          j % 2 === 1
                            ? <strong key={j}>{part}</strong>
                            : part
                        )}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Suggestions rapides */}
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map(p => (
                <button key={p} type="button" onClick={() => analyzeAndSearch(p)}
                  className="text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border-2)', color: 'var(--txt-2)' }}>
                  {p}
                </button>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)}
                placeholder="Décrivez votre voyage idéal..."
                className="input-field flex-1 text-sm"
                disabled={loading} />
              <button type="submit" disabled={loading || !input.trim()}
                className="btn-primary px-4 py-2.5 disabled:opacity-60 flex items-center gap-1.5 shrink-0">
                {loading
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : '🚀'}
              </button>
            </form>
          </div>

          {/* ── Résultats ── */}
          <div className="lg:col-span-3 space-y-6">

            {/* Destinations suggérées */}
            {destinations.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--txt-4)' }}>
                  🗺️ Destinations recommandées
                </p>
                <div className="flex gap-3">
                  {destinations.map(d => (
                    <Link key={d.city} to={`/search?city=${d.city}`}
                      className="flex-1 glass-card p-4 text-center hover:scale-105 transition-all">
                      <div className="text-2xl mb-1">{d.emoji}</div>
                      <p className="font-bold text-sm" style={{ color: 'var(--txt)' }}>{d.city}</p>
                      <p className="text-xs" style={{ color: 'var(--txt-3)' }}>{d.desc}</p>
                      <p className="text-xs font-semibold mt-1 gradient-text">à partir de {d.price} €</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Logements trouvés */}
            {properties.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--txt-4)' }}>
                  🏡 Logements sélectionnés par l'IA — Score qualité
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {properties.slice(0, 4).map((p, i) => (
                    <ScrollReveal key={p.id} variant="fadeUp" delay={i * 60}>
                      <AIPropertyCard property={p} score={computeAIScore(p)} />
                    </ScrollReveal>
                  ))}
                </div>
                {properties.length > 4 && (
                  <Link to={`/search${parsed?.filters?.city ? `?city=${parsed.filters.city}` : ''}`}
                    className="btn-ghost-gold w-full text-center mt-3 py-2.5 text-sm block">
                    Voir les {properties.length} logements →
                  </Link>
                )}
              </div>
            )}

            {/* Activités suggérées */}
            {services.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--txt-4)' }}>
                  🎯 Activités pour votre profil
                </p>
                <div className="space-y-2">
                  {services.map(s => (
                    <Link key={s.id} to="/services"
                      className="glass-card p-3 flex items-center gap-3 hover:scale-[1.01] transition-all block">
                      <img src={s.image_url} alt={s.title}
                        className="w-14 h-14 rounded-xl object-cover shrink-0"
                        onError={e => { e.target.src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100' }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate" style={{ color: 'var(--txt)' }}>{s.title}</p>
                        <p className="text-xs" style={{ color: 'var(--txt-3)' }}>⏱ {s.duration} · 👥 max {s.max_persons}</p>
                      </div>
                      <span className="font-black gradient-text shrink-0">{parseFloat(s.price).toFixed(0)} €</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Budget estimé */}
            {parsed?.budget && parsed?.days && properties.length > 0 && (
              <div className="glass-card p-5"
                style={{ border: '1px solid rgba(16,185,129,0.25)', background: 'rgba(16,185,129,0.05)' }}>
                <h3 className="font-black mb-4" style={{ color: 'var(--txt)' }}>💶 Budget estimé sur {parsed.days} nuits</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Hébergement', amount: Math.round(properties[0] ? parseFloat(properties[0].price_per_night) * parsed.days : 0), icon: '🏡' },
                    { label: 'Activités',   amount: services.reduce((s, a) => s + parseFloat(a.price), 0) * (parsed.persons || 1), icon: '🎯' },
                    { label: 'Repas (est.)',amount: Math.round((parsed.days || 3) * (parsed.persons || 1) * 35), icon: '🍽️' },
                    { label: 'Transport',   amount: Math.round((parsed.persons || 1) * 45), icon: '🚗' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: 'var(--txt-3)' }}>{item.icon} {item.label}</span>
                      <span className="font-semibold text-sm" style={{ color: 'var(--txt)' }}>{item.amount} €</span>
                    </div>
                  ))}
                  <div className="pt-2 flex items-center justify-between font-black"
                    style={{ borderTop: '1px solid var(--border)', color: 'var(--txt)' }}>
                    <span>Total estimé</span>
                    <span className="gradient-text text-lg">
                      {[
                        Math.round(properties[0] ? parseFloat(properties[0].price_per_night) * parsed.days : 0),
                        services.reduce((s, a) => s + parseFloat(a.price), 0) * (parsed.persons || 1),
                        Math.round((parsed.days || 3) * (parsed.persons || 1) * 35),
                        Math.round((parsed.persons || 1) * 45),
                      ].reduce((a, b) => a + b, 0)} €
                    </span>
                  </div>
                  {parsed.budget && (
                    <div className="text-xs text-center pt-1" style={{
                      color: [
                        Math.round(properties[0] ? parseFloat(properties[0].price_per_night) * parsed.days : 0),
                        services.reduce((s, a) => s + parseFloat(a.price), 0) * (parsed.persons || 1),
                        Math.round((parsed.days || 3) * (parsed.persons || 1) * 35),
                        Math.round((parsed.persons || 1) * 45),
                      ].reduce((a, b) => a + b, 0) <= parsed.budget ? '#10b981' : '#f87171'
                    }}>
                      {[
                        Math.round(properties[0] ? parseFloat(properties[0].price_per_night) * parsed.days : 0),
                        services.reduce((s, a) => s + parseFloat(a.price), 0) * (parsed.persons || 1),
                        Math.round((parsed.days || 3) * (parsed.persons || 1) * 35),
                        Math.round((parsed.persons || 1) * 45),
                      ].reduce((a, b) => a + b, 0) <= parsed.budget
                        ? `✅ Dans votre budget de ${parsed.budget} €`
                        : `⚠️ Dépasse légèrement votre budget de ${parsed.budget} €`}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* État initial */}
            {properties.length === 0 && destinations.length === 0 && (
              <div className="glass-card p-10 text-center">
                <div className="text-6xl mb-4">🤖</div>
                <p className="font-bold text-lg mb-2" style={{ color: 'var(--txt)' }}>
                  Prêt à planifier votre voyage
                </p>
                <p className="text-sm" style={{ color: 'var(--txt-3)' }}>
                  Décrivez votre séjour idéal ou choisissez une suggestion ci-dessus.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
