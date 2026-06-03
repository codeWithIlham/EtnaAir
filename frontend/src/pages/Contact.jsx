import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Contact() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    name:    user ? `${user.first_name} ${user.last_name}` : '',
    email:   user?.email || '',
    subject: '',
    message: '',
    type:    'general',
  })
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    // Simulation d'envoi (remplacer par un vrai appel API si souhaité)
    await new Promise(r => setTimeout(r, 1000))
    setSent(true)
    setLoading(false)
  }

  const SUBJECT_TYPES = [
    { v: 'general',    l: '💬 Question générale' },
    { v: 'booking',    l: '📅 Problème de réservation' },
    { v: 'property',   l: '🏠 Signalement de logement' },
    { v: 'payment',    l: '💶 Question de paiement' },
    { v: 'account',    l: '👤 Problème de compte' },
    { v: 'technical',  l: '🔧 Problème technique' },
    { v: 'other',      l: '📝 Autre' },
  ]

  return (
    <div className="pt-20 pb-16 px-4 min-h-screen">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-3xl mb-4"
            style={{ background: 'linear-gradient(135deg, var(--primary-1), var(--primary-2))' }}>
            💬
          </div>
          <h1 className="text-4xl font-black mb-3" style={{ color: 'var(--txt)' }}>
            Contactez-<span className="gradient-text">nous</span>
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--txt-3)' }}>
            Notre équipe est disponible 7j/7 pour vous aider.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Infos de contact */}
          <div className="space-y-4">
            {[
              { icon: '📧', title: 'Email', val: 'support@etnair.com', sub: 'Réponse sous 24h' },
              { icon: '📞', title: 'Téléphone', val: '+33 1 23 45 67 89', sub: 'Lun–Ven 9h–18h' },
              { icon: '💬', title: 'Chat en direct', val: 'Disponible', sub: '7j/7 · 8h–22h' },
              { icon: '📍', title: 'Adresse', val: '75 Rue de la Tech', sub: '75001 Paris, France' },
            ].map(c => (
              <div key={c.title} className="glass-card p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: 'rgba(255,107,53,0.12)', border: '1px solid rgba(255,107,53,0.2)' }}>
                  {c.icon}
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: 'var(--txt)' }}>{c.title}</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--primary-1)' }}>{c.val}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--txt-4)' }}>{c.sub}</p>
                </div>
              </div>
            ))}

            {/* FAQ rapide */}
            <div className="glass-card p-5">
              <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--txt)' }}>❓ Questions fréquentes</h3>
              <div className="space-y-2">
                {[
                  { q: 'Comment annuler une réservation ?', to: '/bookings' },
                  { q: 'Comment devenir hôte ?', to: '/profile' },
                  { q: 'Comment signaler un logement ?', to: '/search' },
                ].map(f => (
                  <Link key={f.q} to={f.to}
                    className="block text-xs py-1.5 transition-colors hover:underline"
                    style={{ color: 'var(--txt-3)' }}>
                    → {f.q}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <div className="lg:col-span-2">
            {sent ? (
              <div className="glass-card p-12 text-center">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-black mb-2" style={{ color: 'var(--txt)' }}>Message envoyé !</h2>
                <p className="text-sm mb-6" style={{ color: 'var(--txt-3)' }}>
                  Merci <strong>{form.name}</strong>, notre équipe vous répondra à <strong>{form.email}</strong> sous 24h.
                </p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => { setSent(false); setForm(f => ({ ...f, subject: '', message: '', type: 'general' })) }}
                    className="btn-secondary px-5 py-2.5 text-sm">
                    Envoyer un autre message
                  </button>
                  <Link to="/" className="btn-primary px-5 py-2.5 text-sm">← Retour à l'accueil</Link>
                </div>
              </div>
            ) : (
              <div className="glass-card p-6">
                <h2 className="font-black text-xl mb-5" style={{ color: 'var(--txt)' }}>Envoyer un message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--txt-2)' }}>
                        Nom complet <span style={{ color: 'var(--primary-1)' }}>*</span>
                      </label>
                      <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                        className="input-field" placeholder="Votre nom" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--txt-2)' }}>
                        Email <span style={{ color: 'var(--primary-1)' }}>*</span>
                      </label>
                      <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                        className="input-field" placeholder="votre@email.com" required />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--txt-2)' }}>Catégorie</label>
                    <select value={form.type} onChange={e => set('type', e.target.value)} className="input-field">
                      {SUBJECT_TYPES.map(t => <option key={t.v} value={t.v}>{t.l}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--txt-2)' }}>
                      Sujet <span style={{ color: 'var(--primary-1)' }}>*</span>
                    </label>
                    <input type="text" value={form.subject} onChange={e => set('subject', e.target.value)}
                      className="input-field" placeholder="Résumez votre demande en quelques mots" required />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--txt-2)' }}>
                      Message <span style={{ color: 'var(--primary-1)' }}>*</span>
                      <span className="font-normal ml-1.5" style={{ color: 'var(--txt-4)' }}>({form.message.length}/1000)</span>
                    </label>
                    <textarea value={form.message} onChange={e => set('message', e.target.value)}
                      className="input-field resize-none" rows={6}
                      placeholder="Décrivez votre demande en détail..." maxLength={1000} required />
                  </div>

                  <button type="submit" disabled={loading}
                    className="btn-primary btn-shimmer w-full py-3 font-bold flex items-center justify-center gap-2 disabled:opacity-60">
                    {loading
                      ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Envoi...</>
                      : '📨 Envoyer le message'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
