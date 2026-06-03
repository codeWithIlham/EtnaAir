import { createContext, useContext, useState } from 'react'

const CompareContext = createContext(null)

export function CompareProvider({ children }) {
  const [compareList, setCompareList] = useState([])

  const toggle = (property) => {
    setCompareList(prev => {
      if (prev.find(p => p.id === property.id)) return prev.filter(p => p.id !== property.id)
      if (prev.length >= 2) return [prev[1], property]
      return [...prev, property]
    })
  }

  const remove  = (id) => setCompareList(prev => prev.filter(p => p.id !== id))
  const clear   = ()   => setCompareList([])
  const isIn    = (id) => compareList.some(p => p.id === id)

  return (
    <CompareContext.Provider value={{ compareList, toggle, remove, clear, isIn }}>
      {children}
    </CompareContext.Provider>
  )
}

export const useCompare = () => useContext(CompareContext)
