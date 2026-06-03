import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import PasswordInput from '../components/PasswordInput'
import LogoIcon from '../components/LogoIcon'

// Mini confetti on success
function Confetti() {
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: ['#FF6B35','#FFC857','#00B8D9','#FFD700','#FF6B35'][i % 5],
    delay: Math.random() * 0.8,
    size: 6 + Math.random() * 8,
    drift: (Math.random() - 0.5) * 80,
  }))
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.x}%`,
          top: -20,
          width: p.size,
          height: p.size,
          borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          background: p.color,
          animation: `confettiFall ${1.6 + Math.random()}s ease ${p.delay}s forwards`,
          '--drift': `${p.drift}px`,
          transform: `rotate(${Math.random() * 360}deg)`,
        }} />
      ))}
    </div>
  )
}

function validate(form) {
  const errs = {}
  if (!form.first_name.trim()) errs.first_name = 'Prénom requis'
  if (!form.last_name.trim())  errs.last_name  = 'Nom requis'
  if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = 'Email invalide'
  if (form.password.length < 6) errs.password = 'Min. 6 caractères'
  if (form.password !== form.confirm) errs.confirm = 'Les mots de passe ne correspondent pas'
  if (!form.terms) errs.terms = 'Vous devez accepter les conditions'
  return errs
}

export default function Register() {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '',
    password: '', confirm: '', terms: false,
  })
  const [touched, setTouched] = useState({})
  const [errs, setErrs]       = useState({})
  const [loading, setLoading] = useState(false)
  const [globalErr, setGlobalErr] = useState('')
  const [success, setSuccess] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setTouched(t => ({ ...t, [k]: true }))
  }

  // Validation en temps réel
  useEffect(() => {
    setErrs(validate(form))
  }, [form])

  const fieldErr = (k) => touched[k] && errs[k]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ first_name:true, last_name:true, email:true, password:true, confirm:true, terms:true })
    const validation = validate(form)
    if (Object.keys(validation).length > 0) return
    setGlobalErr('')
    setLoading(true)
    try {
      const { data } = await authAPI.register({
        first_name: form.first_name.trim(),
        last_name:  form.last_name.trim(),
        email:      form.email.toLowerCase().trim(),
        password:   form.password,
      })
      setSuccess(true)
      setTimeout(() => {
        login(data.token, data.user)
        navigate('/')
      }, 2200)
    } catch (err) {
      setGlobalErr(err.response?.data?.message || 'Erreur lors de l\'inscription.')
    } finally {
      setLoading(false)
    }
  }

  const progress = Object.keys(validate(form)).length
  const completeness = Math.round(((6 - Math.min(progress, 6)) / 6) * 100)

  if (success) {
    return (
      <>
        <Confetti />
        <div className="min-h-screen flex items-center justify-center px-4 pt-20">
          <div className="text-center animate-zoom-in">
            <div className="text-8xl mb-6" style={{ animation: 'float 2s ease infinite' }}>🎉</div>
            <h2 className="text-3xl font-black mb-3" style={{ color: 'var(--txt)' }}>
              Bienvenue sur <span className="gradient-text">ETNAir</span> !
            </h2>
            <p className="text-lg mb-2" style={{ color: 'var(--txt-2)' }}>
              Compte créé avec succès, <strong style={{ color: 'var(--txt)' }}>{form.first_name}</strong> ! 🚀
            </p>
            <p className="text-sm mb-6" style={{ color: 'var(--txt-3)' }}>Redirection en cours…</p>
            <div className="w-64 mx-auto h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <div className="h-full rounded-full animate-glow-pulse"
                style={{ background: 'linear-gradient(90deg, var(--primary-1), var(--secondary), var(--accent))', width: '100%' }} />
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-10">
      {/* Orbs décoratifs */}
      <div className="fixed top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none animate-pulse-slow"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.09), transparent)' }} />
      <div className="fixed bottom-1/3 left-1/4 w-72 h-72 rounded-full blur-3xl pointer-events-none animate-pulse-slow"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.06), transparent)', animationDelay: '2s' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in-up">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-5 hover:scale-105 transition-transform">
            <LogoIcon size={28} />
            <span className="font-black text-2xl" style={{ color: 'var(--txt)' }}>
              ETN<span className="gradient-text">Air</span>
            </span>
          </Link>
          <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--txt)' }}>Créer votre compte ✨</h1>
          <p className="text-sm" style={{ color: 'var(--txt-3)' }}>Rejoignez des milliers de voyageurs</p>
        </div>

        <div className="glass-card p-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>

          {/* Social login */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button type="button" className="btn-social" onClick={() => {}}>
              <svg viewBox="0 0 48 48" width="18" height="18">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span>Google</span>
            </button>
            <button type="button" className="btn-social" onClick={() => {}}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>GitHub</span>
            </button>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--txt-3)' }}>ou avec email</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          {/* Barre de progression */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold" style={{ color: 'var(--txt-3)' }}>Complétion du formulaire</span>
              <span className="text-xs font-bold" style={{ color: completeness === 100 ? '#00B8D9' : 'var(--primary-1)' }}>
                {completeness}%
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${completeness}%`,
                  background: completeness === 100
                    ? 'linear-gradient(90deg, #00B8D9, #FFC857)'
                    : 'linear-gradient(90deg, var(--primary-1), var(--secondary))'
                }} />
            </div>
          </div>

          {globalErr && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2 animate-fade-in-up">
              ⚠️ {globalErr}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Prénom + Nom */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--txt-2)' }}>
                  Prénom <span style={{ color: 'var(--primary-1)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.first_name}
                  onChange={e => set('first_name', e.target.value)}
                  className={`input-field transition-all ${fieldErr('first_name') ? 'border-rose-500/50' : form.first_name && !errs.first_name ? 'border-emerald-500/50' : ''}`}
                  placeholder="Jean"
                />
                {fieldErr('first_name') && (
                  <p className="text-xs mt-1 text-rose-400">{errs.first_name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--txt-2)' }}>
                  Nom <span style={{ color: 'var(--primary-1)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.last_name}
                  onChange={e => set('last_name', e.target.value)}
                  className={`input-field transition-all ${fieldErr('last_name') ? 'border-rose-500/50' : form.last_name && !errs.last_name ? 'border-emerald-500/50' : ''}`}
                  placeholder="Dupont"
                />
                {fieldErr('last_name') && (
                  <p className="text-xs mt-1 text-rose-400">{errs.last_name}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--txt-2)' }}>
                Adresse email <span style={{ color: 'var(--primary-1)' }}>*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  className={`input-field pr-10 transition-all ${fieldErr('email') ? 'border-rose-500/50' : form.email && !errs.email ? 'border-emerald-500/50' : ''}`}
                  placeholder="jean.dupont@email.com"
                />
                {form.email && !errs.email && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 text-base">✓</span>
                )}
              </div>
              {fieldErr('email') && (
                <p className="text-xs mt-1 text-rose-400">{errs.email}</p>
              )}
            </div>

            {/* Mot de passe avec force */}
            <PasswordInput
              label={<>Mot de passe <span style={{ color: 'var(--primary-1)' }}>*</span></>}
              value={form.password}
              onChange={e => set('password', e.target.value)}
              placeholder="Min. 6 caractères"
              showStrength
              required
            />
            {fieldErr('password') && (
              <p className="text-xs -mt-2 text-rose-400">{errs.password}</p>
            )}

            {/* Confirmer */}
            <PasswordInput
              label={<>Confirmer le mot de passe <span style={{ color: 'var(--primary-1)' }}>*</span></>}
              value={form.confirm}
              onChange={e => set('confirm', e.target.value)}
              placeholder="••••••••"
              required
            />
            {fieldErr('confirm') && (
              <p className="text-xs -mt-2 text-rose-400">{errs.confirm}</p>
            )}
            {form.confirm && form.password === form.confirm && form.confirm.length > 0 && (
              <p className="text-xs -mt-2 text-emerald-400">✓ Les mots de passe correspondent</p>
            )}

            {/* Info rôle */}
            <div className="p-3 rounded-xl text-xs flex items-start gap-2"
              style={{ background: 'rgba(255,107,53,0.06)', border: '1px solid rgba(255,107,53,0.15)' }}>
              <span className="text-base shrink-0">ℹ️</span>
              <div style={{ color: 'var(--txt-3)' }}>
                Compte créé avec le rôle <strong style={{ color: 'var(--txt-2)' }}>voyageur</strong>.
                Vous pourrez rechercher et réserver des logements immédiatement.
                Pour devenir hôte, contactez l'administration.
              </div>
            </div>

            {/* CGU */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5 shrink-0">
                <input type="checkbox" className="sr-only" checked={form.terms}
                  onChange={e => set('terms', e.target.checked)} />
                <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center
                  ${form.terms ? 'border-transparent' : fieldErr('terms') ? 'border-rose-500/70' : 'border-white/20'}`}
                  style={form.terms ? { background: 'linear-gradient(135deg, var(--primary-1), var(--primary-2))' } : {}}>
                  {form.terms && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>}
                </div>
              </div>
              <span className="text-sm leading-snug" style={{ color: 'var(--txt-3)' }}>
                J'accepte les{' '}
                <span className="font-semibold cursor-pointer" style={{ color: 'var(--primary-1)' }}>
                  conditions générales d'utilisation
                </span>{' '}
                et la{' '}
                <span className="font-semibold cursor-pointer" style={{ color: 'var(--primary-1)' }}>
                  politique de confidentialité
                </span>
              </span>
            </label>
            {fieldErr('terms') && (
              <p className="text-xs text-rose-400">Veuillez accepter les conditions</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || Object.keys(errs).length > 0}
              className="btn-primary btn-shimmer w-full py-3.5 text-base relative overflow-hidden animate-glow-pulse"
              style={{ opacity: loading || Object.keys(errs).length > 0 ? 0.6 : 1 }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Création en cours…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>Créer mon compte gratuitement</span>
                  <span className="text-lg">🚀</span>
                </span>
              )}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--txt-3)' }}>
            Déjà un compte ?{' '}
            <Link to="/login" className="font-semibold transition-colors"
              style={{ color: 'var(--primary-1)' }}
              onMouseOver={e => e.currentTarget.style.opacity = '0.8'}
              onMouseOut={e => e.currentTarget.style.opacity = '1'}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

