import { useState, useEffect } from 'react'

const KEY = 'etnair_recently_viewed'
const MAX = 8

export function useRecentlyViewed() {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
  })

  const add = (property) => {
    if (!property?.id) return
    setItems(prev => {
      const filtered = prev.filter(p => p.id !== property.id)
      const next = [property, ...filtered].slice(0, MAX)
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }

  const clear = () => { localStorage.removeItem(KEY); setItems([]) }

  return { items, add, clear }
}
