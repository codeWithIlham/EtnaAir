import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from './context/AuthContext'

// Remet la page en haut à chaque changement de route
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

// Capture une frame de la vidéo IOSNA et l'utilise comme favicon
function useFaviconFromVideo() {
  useEffect(() => {
    const video = document.createElement('video')
    video.src = '/iosna.mp4?v=3'
    video.muted = true
    video.crossOrigin = 'anonymous'
    video.currentTime = 0.5

    const capture = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = 64
        canvas.height = 64
        const ctx = canvas.getContext('2d')
        // Centrer/recadrer la vidéo dans le carré 64x64
        const vw = video.videoWidth  || 64
        const vh = video.videoHeight || 64
        const scale = Math.max(64 / vw, 64 / vh)
        const dx = (64 - vw * scale) / 2
        const dy = (64 - vh * scale) / 2
        ctx.drawImage(video, dx, dy, vw * scale, vh * scale)
        const png = canvas.toDataURL('image/png')
        // Remplacer le favicon
        let link = document.querySelector("link[rel='icon']")
        if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link) }
        link.type = 'image/png'
        link.href = png
      } catch (e) {
        // Silencieux si la vidéo n'est pas accessible
      }
    }

    video.addEventListener('seeked', capture)
    video.addEventListener('loadeddata', () => { video.currentTime = 0.5 })
    video.load()

    return () => { video.removeEventListener('seeked', capture) }
  }, [])
}
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import BackToTop from './components/BackToTop'
import ScrollProgress from './components/ScrollProgress'
import CursorSpotlight from './components/CursorSpotlight'
import { ToastProvider } from './components/Toast'
import CompareBar from './components/CompareBar'
import { useCompare } from './context/CompareContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Search from './pages/Search'
import PropertyDetail from './pages/PropertyDetail'
import Bookings from './pages/Bookings'
import Admin from './pages/Admin'
import Host from './pages/Host'
import Notifications from './pages/Notifications'
import Contact from './pages/Contact'
import Services from './pages/Services'
import AI from './pages/AI'
import Profile from './pages/Profile'
import Wishlist from './pages/Wishlist'
import Messages from './pages/Messages'
import NotFound from './pages/NotFound'

// Spinner commun
function Loader() {
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="text-center">
        <div className="w-14 h-14 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4"
          style={{ borderColor: 'var(--border-2)', borderTopColor: 'var(--primary-1)' }} />
        <p className="text-sm" style={{ color: 'var(--txt-3)' }}>Chargement…</p>
      </div>
    </div>
  )
}

// Route protégée — redirige vers /login si non connecté
function PrivateRoute({ children }) {
  const { isAuth, loading } = useAuth()
  if (loading) return <Loader />
  return isAuth ? children : <Navigate to="/login" replace />
}

// Route hôte — redirige vers / si pas hôte
function HostRoute({ children }) {
  const { isAuth, user, loading } = useAuth()
  if (loading) return <Loader />
  if (!isAuth) return <Navigate to="/login" replace />
  if (user?.role !== 'host' && user?.role !== 'admin') return <Navigate to="/" replace />
  return children
}

// Route admin — redirige vers / si pas admin
function AdminRoute({ children }) {
  const { isAuth, user, loading } = useAuth()
  if (loading) return <Loader />
  if (!isAuth) return <Navigate to="/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/" replace />
  return children
}

// Redirige vers /login si déjà connecté (pages login/register)
function GuestOnly({ children }) {
  const { isAuth, loading } = useAuth()
  if (loading) return <Loader />
  return isAuth ? <Navigate to="/" replace /> : children
}

function GlobalCompareBar() {
  const { compareList, remove, clear } = useCompare()
  return <CompareBar properties={compareList} onRemove={remove} onClear={clear} />
}

export default function App() {
  useFaviconFromVideo()
  return (
    <ToastProvider>
      <ScrollToTop />
      <div className="app-wrapper min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)', color: 'var(--txt)' }}>
        <ScrollProgress />
        <CursorSpotlight />
        <Navbar />
        <main className="flex-1" style={{ paddingBottom: '5.5rem' }}>
          <Routes>
            {/* Pages publiques */}
            <Route path="/"             element={<Home />} />
            <Route path="/search"       element={<Search />} />
            <Route path="/annonces/:id" element={<PropertyDetail />} />

            {/* Auth — redirige si déjà connecté */}
            <Route path="/login"    element={<GuestOnly><Login /></GuestOnly>} />
            <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />

            {/* Pages connectées (tous rôles) */}
            <Route path="/bookings" element={<PrivateRoute><Bookings /></PrivateRoute>} />
            <Route path="/wishlist" element={<PrivateRoute><Wishlist /></PrivateRoute>} />
            <Route path="/profile"  element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/messages"       element={<PrivateRoute><Messages /></PrivateRoute>} />
            <Route path="/notifications"  element={<PrivateRoute><Notifications /></PrivateRoute>} />
            <Route path="/contact"        element={<Contact />} />
            <Route path="/services"       element={<Services />} />
            <Route path="/ai"             element={<AI />} />

            {/* Espace hôte (host + admin) */}
            <Route path="/host"     element={<HostRoute><Host /></HostRoute>} />

            {/* Admin seulement */}
            <Route path="/admin"    element={<AdminRoute><Admin /></AdminRoute>} />

            {/* 404 */}
            <Route path="*"         element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <BackToTop />
        <GlobalCompareBar />
      </div>
    </ToastProvider>
  )
}
