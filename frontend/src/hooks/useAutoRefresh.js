import { useEffect, useRef } from 'react'

/**
 * Lance `callback` au montage, puis à chaque fois que
 * l'onglet reprend le focus (l'utilisateur revient sur la page).
 * Évite les appels trop rapprochés avec un délai minimum.
 */
export function useAutoRefresh(callback, minIntervalMs = 15000) {
  const lastFetch = useRef(0)

  useEffect(() => {
    // Premier chargement
    callback()
    lastFetch.current = Date.now()

    const onFocus = () => {
      if (Date.now() - lastFetch.current > minIntervalMs) {
        callback()
        lastFetch.current = Date.now()
      }
    }

    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])
}
