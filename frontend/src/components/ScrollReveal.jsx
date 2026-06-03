import { useScrollReveal } from '../hooks/useScrollReveal'

const VARIANTS = {
  fadeUp:   { hidden: 'opacity-0 translate-y-8',  visible: 'opacity-100 translate-y-0' },
  fadeIn:   { hidden: 'opacity-0',                 visible: 'opacity-100' },
  fadeLeft: { hidden: 'opacity-0 -translate-x-8', visible: 'opacity-100 translate-x-0' },
  fadeRight:{ hidden: 'opacity-0 translate-x-8',  visible: 'opacity-100 translate-x-0' },
  zoomIn:   { hidden: 'opacity-0 scale-95',        visible: 'opacity-100 scale-100' },
}

export default function ScrollReveal({ children, variant = 'fadeUp', delay = 0, className = '' }) {
  const [ref, visible] = useScrollReveal()
  const { hidden, visible: vis } = VARIANTS[variant] || VARIANTS.fadeUp

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? vis : hidden} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
