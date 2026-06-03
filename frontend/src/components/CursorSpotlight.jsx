import { useState, useEffect } from 'react'

export default function CursorSpotlight() {
  const [pos, setPos] = useState({ x: -600, y: -600 })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const move = (e) => {
      setPos({ x: e.clientX, y: e.clientY })
      setVisible(true)
    }
    const leave = () => setVisible(false)
    window.addEventListener('mousemove', move)
    document.documentElement.addEventListener('mouseleave', leave)
    return () => {
      window.removeEventListener('mousemove', move)
      document.documentElement.removeEventListener('mouseleave', leave)
    }
  }, [])

  return (
    <div
      style={{
        pointerEvents: 'none',
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        width: 380,
        height: 380,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,107,53,0.04) 0%, rgba(255,107,53,0.025) 40%, transparent 70%)',
        transform: 'translate(-50%, -50%)',
        transition: 'left 0.12s ease, top 0.12s ease, opacity 0.3s ease',
        opacity: visible ? 1 : 0,
        zIndex: 1,
      }}
    />
  )
}
