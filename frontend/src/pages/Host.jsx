import { useState, useEffect, useRef, useCallback } from 'react'
import { useAutoRefresh } from '../hooks/useAutoRefresh'
import { Link, useSearchParams } from 'react-router-dom'
import { propertyAPI, bookingAPI, uploadAPI, getPropertyImage } from '../services/api'
import { useAuth } from '../context/AuthContext'
import RevenueChart from '../components/RevenueChart'
import CityAutocomplete from '../components/CityAutocomplete'

// ── Export CSV ─────────────────────────────────────────────
function exportCSV(bookings) {
  const headers = ['ID', 'Logement', 'Voyageur', 'Statut', 'Arrivée', 'Départ', 'Total (€)']
  const rows = bookings.map(b => [
    b.id,
    b.property?.title || b.property_id,
    b.guest ? `${b.guest.first_name} ${b.guest.last_name}` : b.guest_id,
    b.booking_status,
    b.start_date?.split('T')[0] || '',
    b.end_date?.split('T')[0] || '',
    parseFloat(b.total_price || 0).toFixed(2),
  ])
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
  a.download = `reservations_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
}

// ── Badges statut ──────────────────────────────────────────
const STATUS_BADGE = {
  pending:   { cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30',   label: '⏳ En attente' },
  confirmed: { cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', label: '✅ Confirmée' },
  completed: { cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30',      label: '🏁 Terminée' },
  cancelled: { cls: 'bg-rose-500/20 text-rose-400 border-rose-500/30',      label: '❌ Annulée' },
}

// ── Onglet Réservations ────────────────────────────────────
function BookingsTab({ bookings, properties, fmtDate, onStatusChange }) {
  const [updating, setUpdating] = useState(null)

  const handleStatus = async (id, status) => {
    setUpdating(id)
    try {
      await bookingAPI.updateStatus(id, status)
      onStatusChange(id, status)
    } catch (e) { alert(e.response?.data?.message || 'Erreur') }
    finally { setUpdating(null) }
  }

  if (bookings.length === 0) return (
    <div className="glass p-16 text-center rounded-2xl">
      <div className="text-6xl mb-4">📅</div>
      <p className="font-bold text-xl mb-2" style={{ color: 'var(--txt)' }}>Aucune réservation reçue</p>
      <p className="text-sm" style={{ color: 'var(--txt-3)' }}>Vos voyageurs apparaîtront ici dès leur première réservation</p>
    </div>
  )

  return (
    <div className="space-y-4">
      {bookings.map(b => {
        const prop = properties.find(p => p.id === b.property_id)
        const nights = Math.max(1, Math.ceil((new Date(b.end_date) - new Date(b.start_date)) / 86400000))
        const badge = STATUS_BADGE[b.booking_status] || STATUS_BADGE.pending
        const isPending = b.booking_status === 'pending'
        return (
          <div key={b.id} className="glass-card p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                {prop && (
                  <img src={getPropertyImage(prop)} alt={prop.title}
                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                    onError={e => { e.target.style.display = 'none' }} />
                )}
                <div>
                  <p className="font-bold" style={{ color: 'var(--txt)' }}>{prop?.title || `Logement #${b.property_id}`}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--txt-3)' }}>
                    {fmtDate(b.start_date)} → {fmtDate(b.end_date)} · {nights} nuit{nights > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--txt-4)' }}>
                    Voyageur : {b.guest ? `${b.guest.first_name} ${b.guest.last_name}` : `#${b.guest_id}`}
                  </p>
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full border mt-1 ${badge.cls}`}>
                    {badge.label}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xl font-black gradient-text">{parseFloat(b.total_price || 0).toFixed(0)} €</div>
                {isPending && (
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => handleStatus(b.id, 'confirmed')} disabled={updating === b.id}
                      className="text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50"
                      style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', borderColor: 'rgba(16,185,129,0.3)' }}>
                      ✅ Confirmer
                    </button>
                    <button onClick={() => handleStatus(b.id, 'cancelled')} disabled={updating === b.id}
                      className="text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50"
                      style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}>
                      ❌ Refuser
                    </button>
                  </div>
                )}
                {b.booking_status === 'confirmed' && (
                  <button onClick={() => handleStatus(b.id, 'completed')} disabled={updating === b.id}
                    className="mt-2 text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50"
                    style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', borderColor: 'rgba(59,130,246,0.3)' }}>
                    🏁 Marquer terminé
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Modal Ajouter / Modifier annonce ──────────────────────
function PropertyFormModal({ onClose, onSaved, userId, editProperty = null }) {
  const isEdit = !!editProperty

  const [form, setForm] = useState({
    title:           editProperty?.title           || '',
    description:     editProperty?.description     || '',
    price_per_night: editProperty?.price_per_night || '',
    max_guests:      editProperty?.max_guests      || '',
    bedrooms:        editProperty?.bedrooms        || '1',
    bathrooms:       editProperty?.bathrooms       || '1',
    property_type:   editProperty?.property_type   || 'apartment',
    city:            editProperty?.city            || '',
    country:         editProperty?.country         || 'France',
    address:         editProperty?.address         || '',
  })

  // Images existantes en DB (mode édition)
  const [existingImages, setExistingImages] = useState(
    editProperty?.images || []
  )
  // Nouvelles images à uploader (fichiers)
  const [newFiles,    setNewFiles]    = useState([])
  const [newPreviews, setNewPreviews] = useState([])

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const fileRef = useRef(null)

  const totalCount = existingImages.length + newFiles.length
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // ── Supprimer une image existante (DB + MinIO) ──────────
  const removeExisting = async (img) => {
    if (!window.confirm('Supprimer cette photo ?')) return
    try {
      await uploadAPI.deleteImage(img.id)
      setExistingImages(prev => prev.filter(i => i.id !== img.id))
    } catch {
      // Suppression soft : retire de l'affichage même si l'API échoue
      setExistingImages(prev => prev.filter(i => i.id !== img.id))
    }
  }

  // ── Retirer une nouvelle image (pas encore uploadée) ────
  const removeNew = (i) => {
    setNewFiles(prev => prev.filter((_, idx) => idx !== i))
    setNewPreviews(prev => prev.filter((_, idx) => idx !== i))
  }

  // ── Sélection de fichiers ────────────────────────────────
  const handleFiles = (files) => {
    const remaining = 8 - totalCount
    if (remaining <= 0) return
    const valid = Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .slice(0, remaining)
    if (valid.length === 0) return

    setNewFiles(prev => [...prev, ...valid])
    valid.forEach(f => {
      const reader = new FileReader()
      reader.onload = ev => setNewPreviews(prev => [...prev, ev.target.result])
      reader.readAsDataURL(f)
    })
  }

  const handleDrop = (e) => { e.preventDefault(); handleFiles(e.dataTransfer.files) }

  // ── Soumission ───────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        ...form,
        price_per_night: parseFloat(form.price_per_night),
        max_guests:  parseInt(form.max_guests),
        bedrooms:    parseInt(form.bedrooms),
        bathrooms:   parseInt(form.bathrooms),
      }

      let propertyId
      if (isEdit) {
        await propertyAPI.update(editProperty.id, payload)
        propertyId = editProperty.id
      } else {
        const res = await propertyAPI.create(payload)
        propertyId = res.data?.id
      }

      if (!propertyId) throw new Error('ID du logement introuvable après création')

      // Upload uniquement les NOUVELLES images
      if (newFiles.length > 0) {
        const noImagesLeft = existingImages.length === 0
        await Promise.allSettled(
          newFiles.map((file, i) =>
            uploadAPI.upload(file, propertyId, noImagesLeft && i === 0)
          )
        )
      }

      onSaved()
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="glass-card w-full max-w-2xl max-h-[92vh] overflow-y-auto"
        style={{ border: '1px solid rgba(255,107,53,0.25)' }}>

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
          style={{ background: 'var(--bg-2)', borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-xl font-black" style={{ color: 'var(--txt)' }}>
            {isEdit ? '✏️ Modifier l\'annonce' : '🏠 Ajouter un logement'}
          </h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-xl transition-all hover:scale-110"
            style={{ background: 'var(--surface)', color: 'var(--txt-3)' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {error && (
            <div className="px-4 py-3 rounded-xl text-sm"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Titre */}
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--txt-2)' }}>
              Titre <span style={{ color: 'var(--primary-1)' }}>*</span>
            </label>
            <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
              className="input-field" placeholder="Studio cosy au cœur de Montmartre" required />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--txt-2)' }}>
              Description <span style={{ color: 'var(--primary-1)' }}>*</span>
            </label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              className="input-field resize-none" rows={4}
              placeholder="Décrivez votre logement : emplacement, ambiance, équipements..." required />
          </div>

          {/* Prix + Capacité */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--txt-2)' }}>
                Prix / nuit (€) <span style={{ color: 'var(--primary-1)' }}>*</span>
              </label>
              <input type="number" value={form.price_per_night} onChange={e => set('price_per_night', e.target.value)}
                className="input-field" placeholder="85" min="1" step="0.01" required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--txt-2)' }}>
                Capacité max <span style={{ color: 'var(--primary-1)' }}>*</span>
              </label>
              <input type="number" value={form.max_guests} onChange={e => set('max_guests', e.target.value)}
                className="input-field" placeholder="4" min="1" required />
            </div>
          </div>

          {/* Type + Chambres + SDB */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--txt-2)' }}>Type</label>
              <select value={form.property_type} onChange={e => set('property_type', e.target.value)} className="input-field">
                <option value="studio">🏠 Studio</option>
                <option value="apartment">🏢 Appartement</option>
                <option value="house">🏡 Maison</option>
                <option value="villa">🌴 Villa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--txt-2)' }}>Chambres</label>
              <input type="number" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)}
                className="input-field" min="0" max="20" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--txt-2)' }}>Salles de bain</label>
              <input type="number" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)}
                className="input-field" min="0" max="10" />
            </div>
          </div>

          {/* Ville + Pays */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--txt-2)' }}>
                Ville <span style={{ color: 'var(--primary-1)' }}>*</span>
              </label>
              <div className="relative">
                <CityAutocomplete
                  value={form.city}
                  onChange={v => set('city', v)}
                  placeholder="Paris, Nice, Lyon..."
                  style={{ display: 'block' }}
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--txt-2)' }}>Pays</label>
              <input type="text" value={form.country} onChange={e => set('country', e.target.value)}
                className="input-field" placeholder="France" />
            </div>
          </div>

          {/* Adresse */}
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--txt-2)' }}>Adresse complète</label>
            <input type="text" value={form.address} onChange={e => set('address', e.target.value)}
              className="input-field" placeholder="12 Rue de la Paix, 75001 Paris" />
          </div>

          {/* Upload photos */}
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--txt-2)' }}>
              📷 Photos du logement
              <span className="font-normal ml-1.5" style={{ color: 'var(--txt-4)' }}>
                ({totalCount}/8 — JPG · PNG · WEBP)
              </span>
            </label>

            {/* Grille unifiée : existantes + nouvelles + bouton + */}
            {totalCount > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-3">

                {/* ── Images déjà en DB ── */}
                {existingImages.map((img, i) => (
                  <div key={`ex-${img.id}`} className="relative group aspect-square rounded-xl overflow-hidden"
                    style={{ border: img.is_main ? '2px solid var(--primary-1)' : '2px solid var(--border)' }}>
                    <img src={img.image_url} alt=""
                      className="w-full h-full object-cover"
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200&q=60' }}
                    />
                    {/* Overlay suppression */}
                    <button type="button" onClick={() => removeExisting(img)}
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'rgba(0,0,0,0.60)', fontSize: '1.25rem' }}>
                      🗑️
                    </button>
                    {img.is_main && (
                      <span className="absolute bottom-0 left-0 right-0 text-center text-white font-bold pointer-events-none"
                        style={{ fontSize: '0.48rem', background: 'var(--primary-1)', padding: '2px 0' }}>
                        PRINCIPALE
                      </span>
                    )}
                  </div>
                ))}

                {/* ── Nouvelles images (pas encore uploadées) ── */}
                {newPreviews.map((src, i) => (
                  <div key={`new-${i}`} className="relative group aspect-square rounded-xl overflow-hidden"
                    style={{
                      border: existingImages.length === 0 && i === 0
                        ? '2px solid var(--primary-1)'
                        : '2px dashed rgba(255,107,53,0.4)',
                    }}>
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeNew(i)}
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'rgba(0,0,0,0.60)', fontSize: '1.25rem' }}>
                      🗑️
                    </button>
                    {/* Badge "nouveau" */}
                    <span className="absolute top-1 right-1 text-white font-bold pointer-events-none"
                      style={{ fontSize: '0.48rem', background: 'rgba(255,107,53,0.85)', padding: '2px 4px', borderRadius: '4px' }}>
                      NOUVEAU
                    </span>
                    {existingImages.length === 0 && i === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 text-center text-white font-bold pointer-events-none"
                        style={{ fontSize: '0.48rem', background: 'var(--primary-1)', padding: '2px 0' }}>
                        PRINCIPALE
                      </span>
                    )}
                  </div>
                ))}

                {/* Bouton + ajouter */}
                {totalCount < 8 && (
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all hover:scale-105"
                    style={{ border: '2px dashed var(--border-2)', background: 'var(--surface)', color: 'var(--txt-4)' }}>
                    <span className="text-xl">+</span>
                    <span style={{ fontSize: '0.6rem' }}>Ajouter</span>
                  </button>
                )}
              </div>
            )}

            {/* Zone drag & drop — affichée seulement si pas encore d'images */}
            {totalCount === 0 && (
              <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 p-8 rounded-xl cursor-pointer transition-all"
                style={{ border: '2px dashed var(--border-2)', background: 'var(--surface)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-1)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)' }}>
                <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--txt-4)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <p className="text-sm font-medium" style={{ color: 'var(--txt-3)' }}>
                  Glisser des photos ici ou cliquer pour sélectionner
                </p>
                <p className="text-xs" style={{ color: 'var(--txt-4)' }}>Plusieurs fichiers acceptés · max 8</p>
              </div>
            )}

            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple
              onChange={e => handleFiles(e.target.files)} className="sr-only" />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="btn-primary flex-1 py-3 font-bold disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sauvegarde...</>
              ) : isEdit ? '💾 Enregistrer les modifications' : '🚀 Publier l\'annonce'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary px-5">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ══════════════════════════════════════════════════════════
export default function Host() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [properties, setProperties] = useState([])
  const [bookings,   setBookings]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [tab,        setTab]        = useState(searchParams.get('tab') || 'properties')
  const [showForm,   setShowForm]   = useState(false)
  const [editProp,   setEditProp]   = useState(null)  // null = nouvelle annonce
  const [success,    setSuccess]    = useState('')

  const fmtDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

  const reload = async () => {
    const [pRes, bRes] = await Promise.all([
      propertyAPI.getAll({ limit: 100 }),
      bookingAPI.getAll().catch(() => ({ data: [] })),
    ])
    const myProps = pRes.data.filter(p => p.owner_id === user?.id)
    const myIds   = new Set(myProps.map(p => p.id))
    setProperties(myProps)
    setBookings(bRes.data.filter(b => myIds.has(b.property_id)))
  }

  // Chargement initial + auto-refresh sur focus
  useAutoRefresh(() => {
    setLoading(true)
    reload().finally(() => setLoading(false))
  }, 20000)

  const handleSaved = async () => {
    setShowForm(false)
    setEditProp(null)
    setSuccess(editProp ? 'Annonce modifiée avec succès !' : 'Annonce publiée avec succès !')
    await reload()
    setTimeout(() => setSuccess(''), 4000)
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce logement ? Cette action est irréversible.')) return
    try {
      await propertyAPI.delete(id)
      setProperties(p => p.filter(x => x.id !== id))
      setSuccess('Annonce supprimée.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression.')
    }
  }

  const myRevenue = bookings
    .filter(b => b.booking_status !== 'cancelled')
    .reduce((s, b) => s + parseFloat(b.total_price || 0), 0)

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
        style={{ borderColor: 'var(--border-2)', borderTopColor: 'var(--primary-1)' }} />
    </div>
  )

  return (
    <div className="pt-20 pb-16 px-4 min-h-screen">
      <div className="max-w-6xl mx-auto">

        {/* ─── Header ──────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black" style={{ color: 'var(--txt)' }}>
              Mon espace <span className="gradient-text">hôte</span>
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--txt-3)' }}>
              Bonjour {user?.first_name} — Gérez vos logements et réservations
            </p>
          </div>
          <button onClick={() => { setEditProp(null); setShowForm(true) }}
            className="btn-primary btn-shimmer px-5 py-2.5 text-sm flex items-center gap-2">
            + Ajouter un logement
          </button>
        </div>

        {/* ─── Toast succès ────────────────────────────────── */}
        {success && (
          <div className="glass mb-6 px-4 py-3 flex items-center gap-3 rounded-2xl animate-fade-in-up"
            style={{ border: '1px solid rgba(16,185,129,0.35)', background: 'rgba(16,185,129,0.10)' }}>
            <span className="text-xl">✅</span>
            <p className="font-semibold text-sm" style={{ color: '#10b981' }}>{success}</p>
          </div>
        )}

        {/* ─── Stats ───────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: '🏠', label: 'Mes logements', value: properties.length,   color: '#10b981' },
            { icon: '📅', label: 'Réservations',  value: bookings.length,     color: '#FFC857' },
            { icon: '✅', label: 'Confirmées',    value: bookings.filter(b => b.booking_status === 'confirmed').length, color: '#00B8D9' },
            { icon: '💶', label: 'Revenus totaux',value: `${myRevenue.toFixed(0)} €`, color: '#FF6B35' },
          ].map(s => (
            <div key={s.label} className="glass-card p-5 text-center hover:scale-105 transition-transform">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--txt-3)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ─── Graphique revenus ───────────────────────────── */}
        <RevenueChart bookings={bookings} />

        {/* ─── Onglets ─────────────────────────────────────── */}
        <div className="flex gap-1 glass p-1 mb-6 w-fit rounded-2xl">
          {[
            { id: 'properties', label: '🏠 Mes logements',       count: properties.length },
            { id: 'bookings',   label: '📅 Réservations reçues', count: bookings.length },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
              style={tab === t.id ? {
                background: 'linear-gradient(135deg, var(--primary-1), var(--primary-2))',
                color: '#fff',
                boxShadow: '0 4px 14px rgba(255,107,53,0.30)',
              } : { color: 'var(--txt-3)' }}>
              {t.label}
              {t.count > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                  style={{
                    background: tab === t.id ? 'rgba(255,255,255,0.25)' : 'var(--surface-2)',
                    color: tab === t.id ? '#fff' : 'var(--txt-4)',
                  }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─── Mes logements ───────────────────────────────── */}
        {tab === 'properties' && (
          properties.length === 0 ? (
            <div className="glass p-16 text-center rounded-2xl">
              <div className="text-6xl mb-4">🏠</div>
              <p className="font-bold text-xl mb-2" style={{ color: 'var(--txt)' }}>Aucun logement publié</p>
              <p className="text-sm mb-6" style={{ color: 'var(--txt-3)' }}>
                Commencez à louer en ajoutant votre premier logement
              </p>
              <button onClick={() => { setEditProp(null); setShowForm(true) }}
                className="btn-primary btn-shimmer px-6 py-3">
                + Ajouter un logement
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {properties.map(p => (
                <div key={p.id} className="glass-card overflow-hidden group">
                  {/* Image */}
                  <div className="relative h-44">
                    <img src={getPropertyImage(p)} alt={p.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=60' }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white font-bold text-sm line-clamp-1">{p.title}</p>
                      <p className="text-white/60 text-xs">📍 {p.city}{p.country ? `, ${p.country}` : ''}</p>
                    </div>
                    <span className="absolute top-2 right-2 text-xs px-2 py-1 rounded-full font-semibold"
                      style={p.status === 'active'
                        ? { background: 'rgba(16,185,129,0.85)', color: '#fff' }
                        : { background: 'rgba(239,68,68,0.85)', color: '#fff' }}>
                      {p.status || 'active'}
                    </span>
                    {/* Nombre d'images */}
                    {p.images?.length > 0 && (
                      <span className="absolute top-2 left-2 text-xs px-2 py-1 rounded-full font-semibold"
                        style={{ background: 'rgba(0,0,0,0.55)', color: '#fff', backdropFilter: 'blur(4px)' }}>
                        📷 {p.images.length}
                      </span>
                    )}
                  </div>
                  {/* Footer */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-black gradient-text">{parseFloat(p.price_per_night).toFixed(0)} €/nuit</span>
                      <span className="text-xs" style={{ color: 'var(--txt-3)' }}>👥 {p.max_guests} max</span>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/annonces/${p.id}`}
                        className="btn-secondary text-xs py-1.5 px-3 flex-1 text-center">
                        👁 Voir
                      </Link>
                      <button onClick={() => { setEditProp(p); setShowForm(true) }}
                        className="text-xs py-1.5 px-3 rounded-xl border transition-colors"
                        style={{ background: 'rgba(255,107,53,0.10)', color: 'var(--primary-1)', borderColor: 'rgba(255,107,53,0.25)' }}>
                        ✏️ Modifier
                      </button>
                      <button onClick={() => handleDelete(p.id)}
                        className="text-xs py-1.5 px-3 rounded-xl border transition-colors"
                        style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', borderColor: 'rgba(239,68,68,0.25)' }}>
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ─── Réservations reçues ─────────────────────────── */}
        {tab === 'bookings' && (
          <>
            <div className="flex justify-end mb-4">
              <button onClick={() => exportCSV(bookings)}
                className="btn-secondary text-sm py-2 px-4 flex items-center gap-2">
                📥 Exporter CSV
              </button>
            </div>
            <BookingsTab
              bookings={bookings}
              properties={properties}
              fmtDate={fmtDate}
              onStatusChange={(id, status) =>
                setBookings(prev => prev.map(b => b.id === id ? { ...b, booking_status: status } : b))
              }
            />
          </>
        )}
      </div>

      {/* ─── Modal formulaire ────────────────────────────────── */}
      {showForm && (
        <PropertyFormModal
          onClose={() => { setShowForm(false); setEditProp(null) }}
          onSaved={handleSaved}
          userId={user?.id}
          editProperty={editProp}
        />
      )}
    </div>
  )
}
