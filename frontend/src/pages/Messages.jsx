import { useState, useEffect, useRef, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

// ── Traduction instantanée (simulation) ───────────────────
const TRANSLATIONS = {
  // Arabe → Français
  'مرحبا': 'Bonjour',
  'شكرا': 'Merci',
  'كيف حالك': 'Comment allez-vous ?',
  'هل المسبح متاح': 'La piscine est-elle disponible ?',
  'متى يمكنني الوصول': 'Quand puis-je arriver ?',
  'هل يوجد موقف سيارات': 'Y a-t-il un parking ?',
}

function detectLang(text) {
  if (/[؀-ۿ]/.test(text)) return 'ar'
  if (/[一-鿿]/.test(text)) return 'zh'
  if (/[äöüßÄÖÜ]/.test(text)) return 'de'
  if (/[àâæçéèêëîïôœùûüÿ]/i.test(text)) return 'fr'
  if (/\b(the|is|are|was|were|hello|thank)\b/i.test(text)) return 'en'
  return 'fr'
}

function simulateTranslate(text, targetLang = 'fr') {
  // Cherche une correspondance directe
  for (const [src, tgt] of Object.entries(TRANSLATIONS)) {
    if (text.includes(src)) return tgt
  }
  // Sinon, indique que la traduction automatique serait ici
  const lang = detectLang(text)
  if (lang === targetLang) return null // même langue, pas besoin
  const labels = { ar: 'arabe', en: 'anglais', de: 'allemand', zh: 'chinois', fr: 'français' }
  return `[Traduit de l'${labels[lang] || 'autre langue'}] ${text}`
}

// Génère la clé localStorage propre à chaque utilisateur
const storageKey = (userId) => `etnair_messages_${userId}`

// Conversations initiales selon le rôle
function getInitialConvos(user) {
  if (!user) return []

  const now = Date.now()
  const d = (days, extra = 0) => now - 86400000 * days + extra * 3600000

  if (user.role === 'guest') {
    return [
      {
        id: 'c1',
        participant: { id: 'host_james', name: 'James Carter', role: 'host', initials: 'JC', color: '#10b981' },
        property: { title: 'Appartement Vue Tour Eiffel', city: 'Paris' },
        messages: [
          { id: 'm1', from: 'host_james', text: `Bonjour ${user.first_name} ! Votre réservation a bien été reçue. Bienvenue à Paris 🗼`, ts: d(2) },
          { id: 'm2', from: 'me', text: 'Merci ! Est-ce que le parking est inclus ?', ts: d(2, 1) },
          { id: 'm3', from: 'host_james', text: 'Oui, un emplacement en sous-sol est disponible. Je vous enverrai le code d\'accès la veille.', ts: d(1) },
        ],
        unread: 1,
        lastTs: d(1),
      },
      {
        id: 'c2',
        participant: { id: 'host_sarah', name: 'Sarah Wilson', role: 'host', initials: 'SW', color: '#FFC857' },
        property: { title: 'Villa Prestige Nice', city: 'Nice' },
        messages: [
          { id: 'm4', from: 'host_sarah', text: `Bonjour ${user.first_name}, je confirme la disponibilité pour vos dates 🌊`, ts: d(5) },
          { id: 'm5', from: 'me', text: 'Super ! La piscine sera accessible ?', ts: d(4) },
          { id: 'm6', from: 'host_sarah', text: 'Absolument ! Piscine ouverte de 8h à 22h. À très bientôt 😊', ts: d(4, 1) },
        ],
        unread: 0,
        lastTs: d(4, 1),
      },
    ]
  }

  if (user.role === 'host') {
    return [
      {
        id: 'c1',
        participant: { id: 'guest_oliver', name: 'Oliver Davis', role: 'guest', initials: 'OD', color: '#FF6B35' },
        property: { title: 'Votre logement à Paris', city: 'Paris' },
        messages: [
          { id: 'm1', from: 'guest_oliver', text: `Bonjour ${user.first_name}, je suis intéressé par votre logement. Est-il disponible du 15 au 20 juillet ?`, ts: d(3) },
          { id: 'm2', from: 'me', text: 'Bonjour Oliver ! Oui, ces dates sont disponibles. N\'hésitez pas à réserver directement.', ts: d(3, 2) },
          { id: 'm3', from: 'guest_oliver', text: 'Parfait ! Y a-t-il une option pour un check-in tardif vers 22h ?', ts: d(2) },
        ],
        unread: 1,
        lastTs: d(2),
      },
      {
        id: 'c2',
        participant: { id: 'guest_marie', name: 'Marie Dupont', role: 'guest', initials: 'MD', color: '#f59e0b' },
        property: { title: 'Votre villa à Nice', city: 'Nice' },
        messages: [
          { id: 'm4', from: 'guest_marie', text: `Bonjour ${user.first_name} ! Nous serons 4 adultes et 2 enfants, est-ce possible ?`, ts: d(6) },
          { id: 'm5', from: 'me', text: 'Bonjour Marie ! Oui, le logement peut accueillir jusqu\'à 8 personnes. Bienvenue !', ts: d(5) },
          { id: 'm6', from: 'guest_marie', text: 'Super, merci ! On va procéder à la réservation 🎉', ts: d(5, 3) },
          { id: 'm7', from: 'me', text: 'Parfait, à bientôt !', ts: d(4) },
        ],
        unread: 0,
        lastTs: d(4),
      },
      {
        id: 'c3',
        participant: { id: 'guest_lucas', name: 'Lucas Martin', role: 'guest', initials: 'LM', color: '#38bdf8' },
        property: { title: 'Votre chalet à Chamonix', city: 'Chamonix' },
        messages: [
          { id: 'm8', from: 'guest_lucas', text: 'Bonjour ! Le chalet est-il accessible en ski de fond ?', ts: d(1) },
        ],
        unread: 1,
        lastTs: d(1),
      },
    ]
  }

  if (user.role === 'admin') {
    return [
      {
        id: 'c1',
        participant: { id: 'support1', name: 'James Carter', role: 'host', initials: 'JC', color: '#10b981' },
        property: { title: 'Support Hôte — Litige paiement', city: 'Paris' },
        messages: [
          { id: 'm1', from: 'support1', text: `Bonjour ${user.first_name}, j'ai un problème avec le virement de ma réservation du 5 juin.`, ts: d(1) },
          { id: 'm2', from: 'me', text: 'Bonjour James, je vérifie ça immédiatement avec l\'équipe financière.', ts: d(1, 1) },
          { id: 'm3', from: 'support1', text: 'Merci pour votre réactivité !', ts: d(1, 2) },
        ],
        unread: 0,
        lastTs: d(1, 2),
      },
      {
        id: 'c2',
        participant: { id: 'support2', name: 'Oliver Davis', role: 'guest', initials: 'OD', color: '#FF6B35' },
        property: { title: 'Support Voyageur — Annulation', city: 'Lyon' },
        messages: [
          { id: 'm4', from: 'support2', text: `Bonjour ${user.first_name}, je souhaite annuler ma réservation pour cause médicale.`, ts: d(2) },
          { id: 'm5', from: 'me', text: 'Bonjour Oliver, je suis désolé d\'apprendre cela. J\'active le remboursement exceptionnel.', ts: d(1) },
        ],
        unread: 1,
        lastTs: d(1),
      },
      {
        id: 'c3',
        participant: { id: 'support3', name: 'Sarah Wilson', role: 'host', initials: 'SW', color: '#FFC857' },
        property: { title: 'Support Hôte — Signalement', city: 'Nice' },
        messages: [
          { id: 'm6', from: 'support3', text: 'Bonjour, un voyageur a laissé un avis injurieux, pouvez-vous le modérer ?', ts: d(3) },
          { id: 'm7', from: 'me', text: 'Bonjour Sarah, l\'avis a été examiné et supprimé. Merci pour le signalement.', ts: d(2) },
          { id: 'm8', from: 'support3', text: 'Merci beaucoup pour votre intervention rapide 👍', ts: d(2, 2) },
        ],
        unread: 0,
        lastTs: d(2, 2),
      },
    ]
  }

  return []
}

function fmtTime(ts) {
  const diff = Date.now() - ts
  if (diff < 60000) return 'À l\'instant'
  if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`
  if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)} h`
  return new Date(ts).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

const ROLE_LABEL = { guest: '✈️ Voyageur', host: '🏠 Hôte', admin: '⚡ Admin' }
const ROLE_COLOR = { guest: '#FF6B35', host: '#10b981', admin: '#f59e0b' }

export default function Messages() {
  const { isAuth, user } = useAuth()
  const navigate = useNavigate()
  const { lang } = useLanguage()
  const [convos, setConvos] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [draft, setDraft] = useState('')
  const [search, setSearch] = useState('')
  const [translations, setTranslations] = useState({}) // { msgId: translatedText }
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  const handleTranslate = (msgId, text) => {
    if (translations[msgId]) {
      // Basculer : cacher la traduction
      setTranslations(prev => { const n = { ...prev }; delete n[msgId]; return n })
    } else {
      const translated = simulateTranslate(text, lang || 'fr')
      if (translated) setTranslations(prev => ({ ...prev, [msgId]: translated }))
    }
  }

  // Charger les conversations propres à cet utilisateur
  useEffect(() => {
    if (!isAuth) { navigate('/login'); return }
    if (!user?.id) return
    const key = storageKey(user.id)
    try {
      const saved = localStorage.getItem(key)
      setConvos(saved ? JSON.parse(saved) : getInitialConvos(user))
    } catch {
      setConvos(getInitialConvos(user))
    }
  }, [user?.id, isAuth])

  // Scroll vers le bas UNIQUEMENT si une conversation est active
  useEffect(() => {
    if (activeId) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [activeId, convos])

  const save = (next) => {
    if (user?.id) localStorage.setItem(storageKey(user.id), JSON.stringify(next))
  }

  const activeConvo = convos.find(c => c.id === activeId)

  const selectConvo = (id) => {
    setActiveId(id)
    setConvos(prev => {
      const next = prev.map(c => c.id === id ? { ...c, unread: 0 } : c)
      save(next)
      return next
    })
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const autoReplies = useMemo(() => {
    if (user?.role === 'guest') return [
      'Bien sûr, pas de problème !',
      'Je vous répondrai dès que possible.',
      'Bonne arrivée, à très bientôt !',
      'Toutes vos questions sont les bienvenues 😊',
    ]
    if (user?.role === 'host') return [
      'Merci pour votre message !',
      'Je transmets l\'info à mes hôtes.',
      'Votre réservation est bien prise en compte.',
      'À bientôt pour votre séjour !',
    ]
    return [
      'Message bien reçu, nous traitons votre demande.',
      'Notre équipe reviendra vers vous sous 24h.',
      'Dossier pris en charge. Merci de votre patience.',
    ]
  }, [user?.role])

  const sendMessage = (e) => {
    e.preventDefault()
    if (!draft.trim() || !activeId) return
    const msg = { id: `m${Date.now()}`, from: 'me', text: draft.trim(), ts: Date.now() }
    setConvos(prev => {
      const next = prev.map(c => c.id === activeId
        ? { ...c, messages: [...c.messages, msg], lastTs: msg.ts }
        : c)
      save(next)
      return next
    })
    setDraft('')

    // Réponse automatique simulée après 1.5s
    setTimeout(() => {
      const reply = {
        id: `m${Date.now()}r`,
        from: activeConvo?.participant?.id,
        text: autoReplies[Math.floor(Math.random() * autoReplies.length)],
        ts: Date.now(),
      }
      setConvos(prev => {
        const next = prev.map(c => c.id === activeId
          ? { ...c, messages: [...c.messages, reply], lastTs: reply.ts }
          : c)
        save(next)
        return next
      })
    }, 1500)
  }

  const totalUnread = convos.reduce((s, c) => s + (c.unread || 0), 0)

  const filteredConvos = convos
    .filter(c => !search
      || c.participant.name.toLowerCase().includes(search.toLowerCase())
      || c.property?.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.lastTs - a.lastTs)

  const roleLabel = user ? (ROLE_LABEL[user.role] || '👤') : ''
  const roleColor = user ? (ROLE_COLOR[user.role] || 'var(--primary-1)') : 'var(--primary-1)'

  return (
    <div className="pt-16 min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 flex flex-col">

        {/* Header */}
        <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--txt)' }}>
              💬 Messages
              {totalUnread > 0 && (
                <span className="ml-2 text-sm px-2 py-0.5 rounded-full font-bold"
                  style={{ background: '#FF6B35', color: 'white' }}>
                  {totalUnread}
                </span>
              )}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--txt-4)' }}>
              {convos.length} conversation{convos.length !== 1 ? 's' : ''} · connecté en tant que{' '}
              <span className="font-bold" style={{ color: roleColor }}>{user?.first_name} {user?.last_name} — {roleLabel}</span>
            </p>
          </div>
        </div>

        <div className="flex gap-4 min-h-0" style={{ height: 'calc(100vh - 180px)' }}>

          {/* Sidebar conversations */}
          <div className="w-80 shrink-0 flex flex-col glass-card overflow-hidden">
            <div className="p-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="🔍 Rechercher..."
                className="input-field py-2 text-sm" />
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConvos.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-4xl mb-3">💬</p>
                  <p className="text-sm" style={{ color: 'var(--txt-4)' }}>Aucune conversation</p>
                </div>
              ) : filteredConvos.map(c => (
                <button key={c.id} onClick={() => selectConvo(c.id)}
                  className="w-full p-4 text-left flex items-start gap-3 transition-all hover:scale-[1.01]"
                  style={{
                    background: c.id === activeId ? 'var(--surface-2)' : 'transparent',
                    borderLeft: c.id === activeId ? '3px solid var(--primary-1)' : '3px solid transparent',
                    borderBottom: '1px solid var(--border)',
                  }}>
                  <div className="w-11 h-11 rounded-2xl shrink-0 flex items-center justify-center font-bold text-white text-sm"
                    style={{ background: c.participant.color }}>
                    {c.participant.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-bold text-sm truncate" style={{ color: 'var(--txt)' }}>
                        {c.participant.name}
                      </p>
                      <span className="text-xs shrink-0" style={{ color: 'var(--txt-4)' }}>{fmtTime(c.lastTs)}</span>
                    </div>
                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--txt-3)' }}>
                      {c.property?.title}
                    </p>
                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--txt-4)' }}>
                      {c.messages[c.messages.length - 1]?.text}
                    </p>
                  </div>
                  {c.unread > 0 && (
                    <span className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: '#FF6B35' }}>
                      {c.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Thread */}
          <div className="flex-1 flex flex-col glass-card overflow-hidden min-w-0">
            {activeConvo ? (
              <>
                {/* Header thread */}
                <div className="p-4 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center font-bold text-white text-sm"
                    style={{ background: activeConvo.participant.color }}>
                    {activeConvo.participant.initials}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm" style={{ color: 'var(--txt)' }}>{activeConvo.participant.name}</p>
                    <p className="text-xs" style={{ color: 'var(--txt-4)' }}>
                      {ROLE_LABEL[activeConvo.participant.role] || '👤'} · 📍 {activeConvo.property?.title}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                    🟢 En ligne
                  </span>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {activeConvo.messages.map((msg, i) => {
                    const isMe = msg.from === 'me'
                    const showTime = i === 0 || msg.ts - activeConvo.messages[i - 1].ts > 300000
                    return (
                      <div key={msg.id}>
                        {showTime && (
                          <p className="text-center text-xs my-2" style={{ color: 'var(--txt-4)' }}>
                            {fmtTime(msg.ts)}
                          </p>
                        )}
                        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          {!isMe && (
                            <div className="w-7 h-7 rounded-lg shrink-0 mr-2 flex items-center justify-center text-xs font-bold text-white self-end"
                              style={{ background: activeConvo.participant.color }}>
                              {activeConvo.participant.initials[0]}
                            </div>
                          )}
                          <div className="max-w-xs lg:max-w-md">
                            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                              style={isMe ? {
                                background: 'linear-gradient(135deg, var(--primary-1), var(--secondary))',
                                color: '#0d0a04',
                              } : {
                                background: 'var(--surface-2)',
                                color: 'var(--txt)',
                                border: '1px solid var(--border)',
                              }}>
                              {msg.text}
                            </div>
                            {/* Traduction instantanée — seulement sur messages reçus */}
                            {!isMe && (
                              <div className="mt-0.5">
                                <button
                                  onClick={() => handleTranslate(msg.id, msg.text)}
                                  className="text-xs flex items-center gap-1 transition-colors hover:opacity-100 opacity-50"
                                  style={{ color: 'var(--primary-1)' }}>
                                  🌐 {translations[msg.id] ? 'Masquer' : 'Traduire'}
                                </button>
                                {translations[msg.id] && (
                                  <div className="mt-1 px-3 py-2 rounded-xl text-xs italic"
                                    style={{ background: 'rgba(255,107,53,0.08)', color: 'var(--txt-2)', border: '1px solid rgba(255,107,53,0.15)' }}>
                                    {translations[msg.id]}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} className="p-3 flex gap-2" style={{ borderTop: '1px solid var(--border)' }}>
                  <input ref={inputRef} type="text" value={draft} onChange={e => setDraft(e.target.value)}
                    placeholder="Écrivez votre message..."
                    className="input-field flex-1 py-2.5" />
                  <button type="submit" disabled={!draft.trim()}
                    className="btn-primary px-4 py-2.5 disabled:opacity-40 shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <div className="text-6xl">💬</div>
                <h2 className="font-black text-xl" style={{ color: 'var(--txt)' }}>Vos messages</h2>
                <p className="text-sm text-center max-w-xs" style={{ color: 'var(--txt-3)' }}>
                  {user?.role === 'host'
                    ? 'Échangez avec vos voyageurs et gérez leurs demandes.'
                    : user?.role === 'admin'
                    ? 'Gérez les demandes de support des hôtes et voyageurs.'
                    : 'Échangez directement avec vos hôtes avant votre séjour.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

