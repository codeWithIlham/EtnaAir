import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('etnair_theme')
    if (saved) return saved === 'dark'
    // Respecter la préférence système
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const html = document.documentElement
    if (dark) {
      html.classList.remove('light')
      html.setAttribute('data-theme', 'dark')
    } else {
      html.classList.add('light')
      html.setAttribute('data-theme', 'light')
    }
    localStorage.setItem('etnair_theme', dark ? 'dark' : 'light')
  }, [dark])

  const toggle = () => setDark(d => !d)

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
