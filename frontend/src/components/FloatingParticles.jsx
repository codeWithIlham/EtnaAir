import { useMemo } from 'react'

const SHAPES = ['●', '◆', '▲', '★', '✦', '⬡']
const COLORS = [
  'rgba(255,107,53,0.5)',
  'rgba(255,140,0,0.50)',
  'rgba(0,194,168,0.4)',
  'rgba(255,107,53,0.3)',
  'rgba(255,255,255,0.25)',
]

export default function FloatingParticles({ count = 18 }) {
  const particles = useMemo(() => (
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: 6 + Math.random() * 10,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 10,
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      drift: (Math.random() - 0.5) * 60,
    }))
  ), [count])

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 2 }}>
      {particles.map(p => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            bottom: '-20px',
            fontSize: p.size,
            color: p.color,
            animation: `particleRise ${p.duration}s ease-in ${p.delay}s infinite`,
            '--drift': `${p.drift}px`,
          }}
        >
          {p.shape}
        </span>
      ))}
    </div>
  )
}
