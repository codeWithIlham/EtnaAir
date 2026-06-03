import { createContext, useContext, useState, useEffect } from 'react'
import { translations } from '../i18n/translations'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('etnair_lang')
    // Détecter la langue du navigateur
    if (!saved) {
      const browser = navigator.language?.slice(0, 2)
      return translations[browser] ? browser : 'fr'
    }
    return saved
  })

  // Appliquer direction RTL/LTR + lang HTML
  useEffect(() => {
    const t = translations[lang]
    document.documentElement.lang = lang
    document.documentElement.dir  = t?.dir || 'ltr'
    localStorage.setItem('etnair_lang', lang)
  }, [lang])

  const t = translations[lang] || translations.fr

  // Helper : accès par chemin "nav.home", "hero.title1", etc.
  const translate = (path, fallback = '') => {
    const keys = path.split('.')
    let val = t
    for (const k of keys) {
      if (val == null) return fallback
      val = val[k]
    }
    return val ?? fallback
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, translate }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
