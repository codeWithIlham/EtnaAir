import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function NotFound() {
  const navigate = useNavigate()
  const { isAuth, user } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-6" style={{ background: 'var(--bg)' }}>
      <div className="text-center max-w-lg">
        {/* Illustration */}
        <div className="relative inline-block mb-8">
          <div className="text-[10rem] leading-none select-none">🏠</div>
          <div className="absolute -top-2 -right-4 text-5xl">❓</div>
        </div>

        {/* Code erreur */}
        <div className="text-8xl font-black gradient-text mb-4">404</div>
        <h1 className="text-2xl font-black mb-3" style={{ color: 'var(--txt)' }}>
          Page introuvable
        </h1>
        <p className="text-base mb-10 leading-relaxed" style={{ color: 'var(--txt-2)' }}>
          Ce logement a peut-être déménagé… ou cette page n'existe pas.
          <br />Retournez à l'accueil pour continuer votre recherche.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <Link to="/" className="btn-primary px-8 py-3">
            🏠 Retour à l'accueil
          </Link>
          <Link to="/search" className="btn-secondary px-8 py-3">
            🔍 Chercher un logement
          </Link>
        </div>

        {/* Liens rapides selon rôle */}
        <div className="glass p-5 rounded-2xl text-left">
          <p className="text-xs font-semibold mb-4 uppercase tracking-wide" style={{ color: 'var(--txt-3)' }}>
            Peut-être cherchez-vous ?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { to: '/search',   l: '🔍 Rechercher', show: true },
              { to: '/bookings', l: '📅 Mes réservations', show: isAuth },
              { to: '/wishlist', l: '❤️ Mes favoris', show: isAuth },
              { to: '/profile',  l: '👤 Mon profil', show: isAuth },
              { to: '/host',     l: '🏠 Espace hôte', show: user?.role === 'host' || user?.role === 'admin' },
              { to: '/admin',    l: '⚡ Admin', show: user?.role === 'admin' },
              { to: '/login',    l: '🔐 Se connecter', show: !isAuth },
              { to: '/register', l: '✨ S\'inscrire', show: !isAuth },
            ].filter(x => x.show).map(x => (
              <Link key={x.to} to={x.to}
                className="text-sm px-3 py-2.5 rounded-xl transition-colors text-left"
                style={{ color: 'var(--txt-2)', background: 'var(--surface-2)' }}
                onMouseOver={e => e.currentTarget.style.color = 'var(--primary-1)'}
                onMouseOut={e => e.currentTarget.style.color = 'var(--txt-2)'}>
                {x.l}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

