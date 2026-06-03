import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import LogoIcon from './LogoIcon'

export default function Footer() {
  const { user, isAuth } = useAuth()
  const { t } = useLanguage()
  const isAdmin = user?.role === 'admin'
  const year = new Date().getFullYear()

  return (
    <footer style={{ borderTop: '1px solid var(--border)', marginTop: '2rem', background: 'var(--bg-2)' }}>
      <div className="max-w-7xl mx-auto px-4 py-10 sm:py-14 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-8 sm:gap-10">

        {/* Brand */}
        <div className="col-span-2 md:col-span-2">
          <Link to="/" className="flex items-center gap-2.5 mb-5 w-fit group">
            <div className="transition-transform group-hover:scale-105">
              <LogoIcon size={24} />
            </div>
            <span className="font-black text-xl" style={{ color: 'var(--txt)' }}>
              ETN<span className="gradient-text">Air</span>
            </span>
          </Link>
          <p className="text-sm leading-relaxed mb-6 max-w-xs" style={{ color: 'var(--txt-3)' }}>
            {t.footer.tagline}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            {[t.flag + ' ' + t.lang, t.footer.currency, t.footer.secure].map(badge => (
              <span key={badge} className="text-xs px-3 py-1.5 rounded-full"
                style={{ background: 'var(--surface)', color: 'var(--txt-3)', border: '1px solid var(--border)' }}>
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Destinations */}
        <div>
          <h4 className="font-bold text-sm mb-5 uppercase tracking-wider" style={{ color: 'var(--txt-2)' }}>
            {t.footer.destinations}
          </h4>
          <ul className="space-y-3">
            {[
              { c: 'Paris',     e: '🗼' }, { c: 'Nice',      e: '🌊' },
              { c: 'Lyon',      e: '🦁' }, { c: 'Bordeaux',  e: '🍷' },
              { c: 'Marseille', e: '⚓' }, { c: 'Chamonix',  e: '🏔' },
            ].map(({ c, e }) => (
              <li key={c}>
                <Link to={`/search?city=${c}`} className="text-sm flex items-center gap-2 transition-colors"
                  style={{ color: 'var(--txt-3)' }}
                  onMouseOver={ev => ev.currentTarget.style.color = 'var(--primary-1)'}
                  onMouseOut={ev => ev.currentTarget.style.color = 'var(--txt-3)'}>
                  <span>{e}</span>{c}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Types de logement */}
        <div>
          <h4 className="font-bold text-sm mb-5 uppercase tracking-wider" style={{ color: 'var(--txt-2)' }}>
            {t.footer.types}
          </h4>
          <ul className="space-y-3">
            {[
              { to: '/search?type=studio',    l: t.footer.studios },
              { to: '/search?type=apartment', l: t.footer.apartments },
              { to: '/search?type=house',     l: t.footer.houses },
              { to: '/search?type=villa',     l: t.footer.villas },
              { to: '/search',                l: t.footer.allAds },
            ].map(x => (
              <li key={x.to}>
                <Link to={x.to} className="text-sm transition-colors"
                  style={{ color: 'var(--txt-3)' }}
                  onMouseOver={ev => ev.currentTarget.style.color = 'var(--primary-1)'}
                  onMouseOut={ev => ev.currentTarget.style.color = 'var(--txt-3)'}>
                  {x.l}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Mon espace */}
        <div>
          <h4 className="font-bold text-sm mb-5 uppercase tracking-wider" style={{ color: 'var(--txt-2)' }}>
            {t.footer.account}
          </h4>
          <ul className="space-y-3">
            {[
              ...(!isAuth ? [
                { to: '/login',    l: t.footer.login },
                { to: '/register', l: t.footer.register },
              ] : []),
              ...(isAuth ? [
                { to: '/bookings', l: t.footer.myBookings },
                { to: '/wishlist', l: t.footer.myFavorites },
                { to: '/profile',  l: t.footer.profile },
              ] : []),
              { to: '/search', l: t.footer.search },
            ].map(x => (
              <li key={x.to}>
                <Link to={x.to} className="text-sm transition-colors"
                  style={{ color: 'var(--txt-3)' }}
                  onMouseOver={ev => ev.currentTarget.style.color = 'var(--primary-1)'}
                  onMouseOut={ev => ev.currentTarget.style.color = 'var(--txt-3)'}>
                  {x.l}
                </Link>
              </li>
            ))}
          </ul>

          {/* Outils admin */}
          {isAdmin && (
            <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--border)' }}>
              <p className="text-xs font-bold mb-3 text-amber-400 uppercase tracking-wider">⚙️ Admin</p>
              <ul className="space-y-2">
                {[{ to: '/admin', label: '⚡ Dashboard' }].map(x => (
                  <li key={x.to}>
                    <Link to={x.to} className="text-xs text-amber-400/70 hover:text-amber-400 transition-colors">{x.label}</Link>
                  </li>
                ))}
                {[
                  { href: 'http://localhost:3000/api-docs', label: '📄 API Docs' },
                  { href: 'http://localhost:5050',           label: '🗄️ Base de données' },
                  { href: 'http://localhost:9001',           label: '📁 Stockage' },
                  { href: 'http://localhost:3001',           label: '📊 Monitoring' },
                ].map(x => (
                  <li key={x.href}>
                    <a href={x.href} target="_blank" rel="noreferrer"
                      className="text-xs text-amber-400/70 hover:text-amber-400 transition-colors">{x.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="py-5 px-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-xs" style={{ color: 'var(--txt-4)' }}>
            © {year} ETNAir — {t.footer.allRights}
          </p>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--txt-4)' }}>
            <span>{t.footer.bottomTagline}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
