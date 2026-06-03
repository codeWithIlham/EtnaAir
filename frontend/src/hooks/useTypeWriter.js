import { useState, useEffect, useRef } from 'react'

export function useTypeWriter(texts, speed = 75, pause = 2200) {
  const [idx, setIdx] = useState(0)
  const [display, setDisplay] = useState('')
  const [phase, setPhase] = useState('type')
  const [charIdx, setCharIdx] = useState(0)
  const prevFirstText = useRef(texts?.[0])

  // Reset complet quand la liste de phrases change (changement de langue)
  useEffect(() => {
    if (texts?.[0] !== prevFirstText.current) {
      prevFirstText.current = texts?.[0]
      setIdx(0)
      setDisplay('')
      setPhase('type')
      setCharIdx(0)
    }
  }, [texts?.[0]])

  useEffect(() => {
    if (!texts?.length) return
    if (phase === 'type') {
      if (charIdx < texts[idx].length) {
        const t = setTimeout(() => {
          setDisplay(texts[idx].slice(0, charIdx + 1))
          setCharIdx(c => c + 1)
        }, speed)
        return () => clearTimeout(t)
      } else {
        const t = setTimeout(() => setPhase('delete'), pause)
        return () => clearTimeout(t)
      }
    }
    if (phase === 'delete') {
      if (charIdx > 0) {
        const t = setTimeout(() => {
          setCharIdx(c => c - 1)
          setDisplay(texts[idx].slice(0, charIdx - 1))
        }, speed / 2.5)
        return () => clearTimeout(t)
      } else {
        setIdx(i => (i + 1) % texts.length)
        setPhase('type')
      }
    }
  }, [phase, charIdx, idx, texts, speed, pause])

  return display
}
