import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import PasswordInput from '../components/PasswordInput'
import LogoIcon from '../components/LogoIcon'

const DEMO = [
  { label: 'Admin',    icon: '⚡', email: 'admin@etnair.com',       pass: 'password', color: '#f59e0b' },
  { label: 'Hôte',    icon: '🏠', email: 'james.carter@email.com', pass: 'password', color: '#10b981' },
  { label: 'Voyageur', icon: '✈️', email: 'oliver.davis@email.com', pass: 'password', color: 'var(--primary-1)' },
]

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authAPI.login(form)
      setSuccess(true)
      setTimeout(() => {
        login(data.token, data.user)
        const role = data.user?.role
        // Destinations autorisées par rôle
        const isGuestTryingProtected = role === 'guest' && from && (from.includes('/host') || from.includes('/admin'))
        if (from && from !== '/' && !isGuestTryingProtected) {
          navigate(from, { replace: true })
        } else {
          navigate('/', { replace: true })
        }
      }, 600)
    } catch (err) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-10">
      {/* Orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none animate-pulse-slow"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.10), transparent)' }} />
      <div className="fixed bottom-1/4 right-1/4 w-72 h-72 rounded-full blur-3xl pointer-events-none animate-pulse-slow"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.07), transparent)', animationDelay: '2s' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo + titre */}
        <div className="text-center mb-8 animate-fade-in-up">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-5 hover:scale-105 transition-transform">
            <LogoIcon size={28} />
            <span className="font-black text-2xl" style={{ color: 'var(--txt)' }}>
              ETN<span className="gradient-text">Air</span>
            </span>
          </Link>
          <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--txt)' }}>
            {success ? '✅ Connexion réussie !' : 'Bon retour ! 👋'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--txt-3)' }}>
            {success ? 'Redirection en cours…' : 'Connectez-vous à votre compte'}
          </p>
        </div>

        <div className={`glass-card p-8 animate-fade-in-up transition-all duration-500 ${success ? 'scale-95 opacity-60' : ''}`}
          style={{ animationDelay: '0.1s' }}>

          {/* Comptes demo */}
          <div className="mb-6 p-4 rounded-xl" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.18)' }}>
            <p className="text-xs font-bold mb-3" style={{ color: 'var(--primary-1)' }}>
              🔑 Accès rapide — comptes démo
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO.map(d => (
                <button key={d.email} type="button"
                  onClick={() => setForm({ email: d.email, password: d.pass })}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-semibold transition-all hover:scale-105 active:scale-95 btn-shimmer"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--txt-2)' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = d.color; e.currentTarget.style.color = d.color; e.currentTarget.style.background = `${d.color}12` }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--txt-2)'; e.currentTarget.style.background = 'var(--surface-2)' }}>
                  <span className="text-xl">{d.icon}</span>
                  <span className="font-bold">{d.label}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2 animate-fade-in-up">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--txt-2)' }}>Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                className="input-field" placeholder="votre@email.com" autoComplete="email" required />
            </div>

            <PasswordInput
              label="Mot de passe"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />

            <button type="submit" disabled={loading || success} className="btn-primary w-full py-3.5 text-base">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connexion…
                </span>
              ) : success ? '✅ Connecté !' : 'Se connecter →'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--txt-3)' }}>
            Pas encore de compte ?{' '}
            <Link to="/register" className="font-semibold" style={{ color: 'var(--primary-1)' }}>
              S'inscrire gratuitement ✨
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

