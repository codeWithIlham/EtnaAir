import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { userAPI, bookingAPI, reviewAPI, uploadAPI } from '../services/api'
import PasswordInput from '../components/PasswordInput'

function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [msg])
  if (!msg) return null
  const isError = type === 'error'
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up max-w-sm"
      style={{
        background: isError ? 'rgba(255,107,53,0.15)' : 'rgba(16,185,129,0.15)',
        border: `1px solid ${isError ? 'rgba(255,107,53,0.4)' : 'rgba(16,185,129,0.4)'}`,
        borderRadius: '1rem',
        padding: '1rem 1.25rem',
        backdropFilter: 'blur(12px)',
        boxShadow: isError ? '0 8px 32px rgba(255,107,53,0.2)' : '0 8px 32px rgba(16,185,129,0.2)',
        color: isError ? '#f87171' : '#34d399',
      }}>
      <div className="flex items-center gap-3">
        <span className="text-xl">{isError ? '⚠️' : '✅'}</span>
        <span className="font-semibold text-sm">{msg}</span>
        <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-opacity font-bold">✕</button>
      </div>
    </div>
  )
}

// ── Composant : Devenir hôte ──────────────────────────────
function BecomeHostSection({ refreshUser, setToast }) {
  const [loading,   setLoading]   = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const handleBecomeHost = async () => {
    if (!confirmed) { setConfirmed(true); return }
    setLoading(true)
    try {
      const res = await userAPI.becomeHost()
      const { user: newUser, token: newToken } = res.data
      refreshUser(newToken, newUser)
      setToast({ msg: '🎉 Vous êtes maintenant hôte ! Bienvenue dans votre espace hôte.', type: 'success' })
      // Rediriger vers l'espace hôte après 1.5s
      setTimeout(() => { window.location.href = '/host' }, 1500)
    } catch (err) {
      setToast({ msg: err.response?.data?.message || 'Erreur lors du changement de rôle.', type: 'error' })
      setConfirmed(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-8 rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(16,185,129,0.25)', background: 'rgba(16,185,129,0.05)' }}>

      {/* Header */}
      <div className="p-6 pb-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)' }}>
            🏠
          </div>
          <div>
            <h3 className="font-black text-lg" style={{ color: 'var(--txt)' }}>Devenez hôte</h3>
            <p className="text-sm" style={{ color: 'var(--txt-3)' }}>Louez votre logement et générez des revenus</p>
          </div>
        </div>
      </div>

      {/* Avantages */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {[
            { icon: '💶', title: 'Revenus',      desc: 'Gagnez de l\'argent en louant votre logement' },
            { icon: '📅', title: 'Flexibilité', desc: 'Définissez vos propres disponibilités et tarifs' },
            { icon: '🌍', title: 'Visibilité',  desc: 'Publiez sur une plateforme avec des milliers de voyageurs' },
          ].map(a => (
            <div key={a.title} className="glass p-4 rounded-xl text-center">
              <div className="text-2xl mb-1">{a.icon}</div>
              <p className="font-bold text-sm" style={{ color: 'var(--txt)' }}>{a.title}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--txt-3)' }}>{a.desc}</p>
            </div>
          ))}
        </div>

        {/* Confirmation */}
        {confirmed && (
          <div className="mb-4 p-4 rounded-xl text-sm"
            style={{ background: 'rgba(255,200,87,0.12)', border: '1px solid rgba(255,200,87,0.3)', color: '#FFC857' }}>
            ⚠️ <strong>Confirmez-vous ?</strong> Votre rôle passera à <strong>Hôte</strong>. Vous pourrez ajouter des logements et recevoir des réservations. Cette action est immédiate.
          </div>
        )}

        <button onClick={handleBecomeHost} disabled={loading}
          className="w-full py-3 rounded-xl font-bold text-white transition-all hover:scale-[1.02] disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ background: confirmed ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #10b981, #FFC857)', boxShadow: '0 4px 20px rgba(16,185,129,0.35)' }}>
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Activation...</>
          ) : confirmed ? (
            '✅ Oui, je deviens hôte !'
          ) : (
            '🏠 Devenir hôte maintenant'
          )}
        </button>
        {confirmed && (
          <button onClick={() => setConfirmed(false)} className="w-full mt-2 text-sm py-2" style={{ color: 'var(--txt-4)' }}>
            Annuler
          </button>
        )}
      </div>
    </div>
  )
}

export default function Profile() {
  const { user, login, token, logout, refreshUser } = useAuth()
  const { dark, toggle } = useTheme()

  const [form, setForm]       = useState({ first_name: '', last_name: '', phone_number: '', bio: '' })
  const [pwForm, setPw]       = useState({ password: '', confirm: '' })
  const [saving, setSaving]         = useState(false)
  const [savingPw, setSavingPw]     = useState(false)
  const [tab, setTab]               = useState('profile')
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarPreview, setAvatarPreview]     = useState(null)
  const [toast, setToast]     = useState({ msg: '', type: '' })
  const [bookingCount, setBookingCount] = useState(null)
  const [reviewCount,  setReviewCount]  = useState(null)
  const [notifEnabled, setNotifEnabled] = useState(true)

  const showToast = (msg, type = 'success') => setToast({ msg, type })
  const clearToast = () => setToast({ msg: '', type: '' })

  useEffect(() => {
    if (user) {
      setForm({
        first_name:   user.first_name   || '',
        last_name:    user.last_name    || '',
        phone_number: user.phone_number || '',
        bio:          user.bio          || '',
      })
    }
  }, [user])

  useEffect(() => {
    if (!user) return
    bookingAPI.getAll()
      .then(res => setBookingCount(Array.isArray(res.data) ? res.data.length : 0))
      .catch(() => setBookingCount(null))
    // Compter les vrais avis laissés par l'utilisateur (via les avis des propriétés visitées)
    bookingAPI.getAll()
      .then(res => {
        const ids = [...new Set((res.data || []).map(b => b.property_id).filter(Boolean))]
        return Promise.all(ids.map(id => reviewAPI.getByProperty(id).catch(() => ({ data: [] }))))
      })
      .then(allReviews => {
        const flat = allReviews.flatMap(res => Array.isArray(res.data) ? res.data : [])
        const count = flat.filter(r => r.reviewer_id === user.id || r.reviewer?.id === user.id).length
        setReviewCount(count)
      })
      .catch(() => setReviewCount(0))
  }, [user?.id])

  const set    = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setPwF = (k, v) => setPw(f => ({ ...f, [k]: v }))

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Aperçu local immédiat
    const reader = new FileReader()
    reader.onload = ev => setAvatarPreview(ev.target.result)
    reader.readAsDataURL(file)
    // Upload vers MinIO
    setAvatarUploading(true)
    try {
      const res = await uploadAPI.upload(file)
      const url = res.data?.image_url
      if (url) {
        await userAPI.updateProfile({ profile_picture: url })
        login(token, { ...user, profile_picture: url })
        showToast('Photo de profil mise à jour !')
      }
    } catch {
      showToast('Erreur lors de l\'upload.', 'error')
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await userAPI.updateProfile(form)
      login(token, { ...user, ...res.data })
      showToast('Profil mis à jour avec succès !')
    } catch (e) {
      showToast(e.response?.data?.message || 'Erreur lors de la sauvegarde', 'error')
    } finally { setSaving(false) }
  }

  const handlePw = async (e) => {
    e.preventDefault()
    if (pwForm.password !== pwForm.confirm) return showToast('Les mots de passe ne correspondent pas', 'error')
    if (pwForm.password.length < 6) return showToast('Minimum 6 caractères', 'error')
    setSavingPw(true)
    try {
      await userAPI.updateProfile({ password: pwForm.password })
      setPw({ password: '', confirm: '' })
      showToast('Mot de passe modifié !')
    } catch (e) {
      showToast(e.response?.data?.message || 'Erreur', 'error')
    } finally { setSavingPw(false) }
  }

  const roleStyle = {
    admin: { bg: 'rgba(245,158,11,0.18)', color: '#f59e0b', label: '⚡ Admin' },
    host:  { bg: 'rgba(16,185,129,0.18)', color: '#10b981', label: '🏠 Hôte' },
    guest: { bg: 'rgba(14,165,233,0.18)',  color: '#38bdf8', label: '👤 Voyageur' },
  }
  const role = roleStyle[user?.role] || roleStyle.guest

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : 'récemment'

  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || '?'

  const TABS = [
    { id: 'profile',  label: '👤 Profil' },
    { id: 'security', label: '🔒 Sécurité' },
    { id: 'prefs',    label: '⚙️ Préférences' },
  ]

  return (
    <div className="min-h-screen pb-16" style={{ color: 'var(--txt)' }}>
      <Toast msg={toast.msg} type={toast.type} onClose={clearToast} />

      {/* Hero bannière */}
      <div className="relative h-52 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(255,107,53,0.7) 0%, rgba(255,140,0,0.7) 50%, rgba(0,194,168,0.5) 100%)' }}>
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,107,53,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,107,53,0.35) 0%, transparent 50%)',
        }} />
        {/* Motif décoratif */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />
      </div>

      <div className="max-w-3xl mx-auto px-4">
        {/* Avatar flottant — cliquable pour upload */}
        <div className="relative -mt-16 mb-4 flex items-end gap-5">
          <label className="relative cursor-pointer group shrink-0" title="Changer la photo de profil">
            <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl"
              style={{ border: '3px solid var(--bg)' }}>
              {(avatarPreview || user?.profile_picture) ? (
                <img src={avatarPreview || user.profile_picture} alt="Avatar"
                  className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-black"
                  style={{ background: 'linear-gradient(135deg, var(--primary-1), var(--secondary))', color: 'white' }}>
                  {initials}
                </div>
              )}
              {/* Overlay hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"
                style={{ background: 'rgba(0,0,0,0.5)' }}>
                {avatarUploading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                )}
              </div>
            </div>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} className="sr-only" />
          </label>
          <div className="pb-2">
            <h1 className="text-2xl font-black" style={{ color: 'var(--txt)' }}>
              {user?.first_name} {user?.last_name}
            </h1>
            <p className="text-sm" style={{ color: 'var(--txt-3)' }}>{user?.email}</p>
          </div>
          <div className="ml-auto pb-2">
            <span className="text-xs px-3 py-1.5 rounded-full font-bold"
              style={{ background: role.bg, color: role.color }}>
              {role.label}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="glass p-4 mb-6 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--txt-4)' }}>Membre depuis</p>
            <p className="font-bold text-sm" style={{ color: 'var(--txt)' }}>{memberSince}</p>
          </div>
          <div style={{ borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--txt-4)' }}>Réservations</p>
            <p className="font-black text-xl" style={{ color: 'var(--primary-1)' }}>
              {bookingCount !== null ? bookingCount : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--txt-4)' }}>Avis laissés</p>
            <p className="font-black text-xl" style={{ color: 'var(--accent)' }}>
              {reviewCount !== null ? reviewCount : '—'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 glass p-1 mb-6 w-fit rounded-2xl">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={tab === t.id
                ? { background: 'linear-gradient(135deg, var(--primary-1), var(--secondary))', color: 'white', boxShadow: '0 4px 14px rgba(255,107,53,0.25)' }
                : { color: 'var(--txt-3)', background: 'transparent' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Onglet Profil */}
        {tab === 'profile' && (
          <div className="glass-card p-8 animate-fade-in-up">
            <h2 className="font-black text-lg mb-6" style={{ color: 'var(--txt)' }}>Mes informations</h2>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--txt-3)' }}>Prénom</label>
                  <input type="text" value={form.first_name} onChange={e => set('first_name', e.target.value)}
                    className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--txt-3)' }}>Nom</label>
                  <input type="text" value={form.last_name} onChange={e => set('last_name', e.target.value)}
                    className="input-field" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--txt-3)' }}>📧 Email</label>
                <input type="email" value={user?.email || ''} className="input-field opacity-50 cursor-not-allowed" disabled />
                <p className="text-xs mt-1" style={{ color: 'var(--txt-4)' }}>L'email ne peut pas être modifié</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--txt-3)' }}>📱 Téléphone</label>
                <input type="tel" value={form.phone_number} onChange={e => set('phone_number', e.target.value)}
                  className="input-field" placeholder="+33 6 12 34 56 78" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--txt-3)' }}>
                  📝 Bio
                  <span className="ml-2 text-xs" style={{ color: 'var(--txt-4)' }}>{form.bio.length}/500</span>
                </label>
                <textarea value={form.bio} onChange={e => set('bio', e.target.value)}
                  className="input-field resize-none" rows={4}
                  placeholder="Parlez-vous en quelques mots..." maxLength={500} />
                <div className="h-1 mt-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${(form.bio.length / 500) * 100}%`, background: 'linear-gradient(90deg, var(--primary-1), var(--secondary))' }} />
                </div>
              </div>
              <button type="submit" disabled={saving} className="btn-primary w-full py-3 disabled:opacity-60 btn-shimmer">
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sauvegarde...
                  </span>
                ) : '💾 Sauvegarder les modifications'}
              </button>
            </form>
          </div>
        )}

        {/* Onglet Sécurité */}
        {tab === 'security' && (
          <div className="glass-card p-8 animate-fade-in-up">
            <h2 className="font-black text-lg mb-2" style={{ color: 'var(--txt)' }}>🔒 Changer le mot de passe</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--txt-3)' }}>
              Choisissez un mot de passe fort d'au moins 6 caractères.
            </p>
            <form onSubmit={handlePw} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--txt-3)' }}>Nouveau mot de passe</label>
                <PasswordInput value={pwForm.password} onChange={e => setPwF('password', e.target.value)}
                  placeholder="Min. 6 caractères" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--txt-3)' }}>Confirmer le mot de passe</label>
                <PasswordInput value={pwForm.confirm} onChange={e => setPwF('confirm', e.target.value)}
                  placeholder="••••••••" required />
                {pwForm.confirm && pwForm.password !== pwForm.confirm && (
                  <p className="text-xs mt-1.5" style={{ color: 'var(--primary-1)' }}>
                    ⚠️ Les mots de passe ne correspondent pas
                  </p>
                )}
              </div>

              {/* Indicateur de force */}
              {pwForm.password && (
                <div>
                  <p className="text-xs mb-1" style={{ color: 'var(--txt-4)' }}>Force du mot de passe</p>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: pwForm.password.length < 6 ? '25%' : pwForm.password.length < 10 ? '60%' : '100%',
                        background: pwForm.password.length < 6 ? '#ef4444' : pwForm.password.length < 10 ? '#f59e0b' : '#10b981',
                      }} />
                  </div>
                </div>
              )}

              <button type="submit" disabled={savingPw} className="btn-primary w-full py-3 disabled:opacity-60">
                {savingPw ? 'Modification...' : '🔒 Modifier le mot de passe'}
              </button>
            </form>
          </div>
        )}

        {/* Onglet Préférences */}
        {tab === 'prefs' && (
          <div className="glass-card p-8 animate-fade-in-up space-y-6">
            <h2 className="font-black text-lg" style={{ color: 'var(--txt)' }}>⚙️ Préférences</h2>

            {/* Toggle thème */}
            <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--txt)' }}>{dark ? '🌙 Mode sombre' : '☀️ Mode clair'}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--txt-4)' }}>Changer l'apparence de l'interface</p>
              </div>
              <button onClick={toggle}
                className="relative w-14 h-7 rounded-full transition-all duration-300 shrink-0"
                style={{ background: dark ? 'linear-gradient(135deg, var(--primary-1), var(--secondary))' : 'var(--border)' }}>
                <span className="absolute top-0.5 transition-all duration-300 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center text-xs"
                  style={{ left: dark ? '1.75rem' : '0.125rem' }}>
                  {dark ? '🌙' : '☀️'}
                </span>
              </button>
            </div>

            {/* Langue */}
            <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--txt)' }}>🌍 Langue</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--txt-4)' }}>Langue de l'interface</p>
              </div>
              <select className="input-field w-auto text-sm py-1.5" defaultValue="fr">
                <option value="fr">🇫🇷 Français</option>
                <option value="en">🇬🇧 English</option>
                <option value="es">🇪🇸 Español</option>
              </select>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--txt)' }}>🔔 Notifications email</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--txt-4)' }}>Recevoir des alertes pour vos réservations</p>
              </div>
              <button onClick={() => setNotifEnabled(n => !n)}
                className="relative w-14 h-7 rounded-full transition-all duration-300 shrink-0"
                style={{ background: notifEnabled ? 'linear-gradient(135deg, #10b981, #059669)' : 'var(--border)' }}>
                <span className="absolute top-0.5 transition-all duration-300 w-6 h-6 bg-white rounded-full shadow-lg"
                  style={{ left: notifEnabled ? '1.75rem' : '0.125rem' }} />
              </button>
            </div>
          </div>
        )}

        {/* ── Devenir hôte — visible seulement pour les voyageurs ── */}
        {user?.role === 'guest' && (
          <BecomeHostSection refreshUser={refreshUser} setToast={setToast} />
        )}

        {/* Zone danger — déconnexion */}
        <div className="mt-8 p-6 rounded-2xl" style={{ background: 'rgba(255,107,53,0.06)', border: '1px solid rgba(255,107,53,0.2)' }}>
          <h3 className="font-bold text-base mb-1" style={{ color: '#f87171' }}>⚠️ Zone de danger</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--txt-4)' }}>Cette action vous déconnectera immédiatement de votre compte.</p>
          <button onClick={logout}
            className="px-6 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105"
            style={{ background: 'rgba(255,107,53,0.12)', color: '#f87171', border: '1px solid rgba(255,107,53,0.25)' }}>
            🚪 Se déconnecter
          </button>
        </div>
      </div>
    </div>
  )
}
