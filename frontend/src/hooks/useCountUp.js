import { useState, useEffect, useRef } from 'react'

export function useCountUp(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0)
  const frame = useRef(null)

  useEffect(() => {
    if (!start) return
    const num = parseFloat(target)
    if (isNaN(num)) return
    let startTime = null
    const step = (ts) => {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setCount(Math.floor(eased * num))
      if (progress < 1) frame.current = requestAnimationFrame(step)
      else setCount(num)
    }
    frame.current = requestAnimationFrame(step)
    return () => { if (frame.current) cancelAnimationFrame(frame.current) }
  }, [target, duration, start])

  return count
}
