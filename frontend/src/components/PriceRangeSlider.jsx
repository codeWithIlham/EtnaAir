import { useState, useEffect, useRef } from 'react'

export default function PriceRangeSlider({ min = 0, max = 1500, value, onChange }) {
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

  const [minVal, setMinVal] = useState(clamp(value?.[0] ?? min, min, max))
  const [maxVal, setMaxVal] = useState(clamp(value?.[1] ?? max, min, max))
  const rangeRef = useRef(null)

  useEffect(() => {
    if (value) {
      setMinVal(clamp(value[0], min, max))
      setMaxVal(clamp(value[1], min, max))
    }
  }, [value?.[0], value?.[1]])

  // Pourcentage toujours entre 0 et 100 — ne sort jamais du conteneur
  const getPct = (v) => clamp(Math.round(((v - min) / (max - min)) * 100), 0, 100)

  useEffect(() => {
    if (rangeRef.current) {
      const lo = getPct(minVal)
      const hi = getPct(maxVal)
      rangeRef.current.style.left  = `${lo}%`
      rangeRef.current.style.width = `${Math.max(0, hi - lo)}%`
    }
  }, [minVal, maxVal])

  const handleMin = (e) => {
    const raw = Number(e.target.value)
    const v = clamp(raw, min, maxVal - 10)
    setMinVal(v)
    onChange?.([v, maxVal])
  }

  const handleMax = (e) => {
    const raw = Number(e.target.value)
    // Clamp entre minVal+10 ET max — jamais au-dessus de max
    const v = clamp(raw, minVal + 10, max)
    setMaxVal(v)
    onChange?.([minVal, v])
  }

  const isAtMax = maxVal >= max

  return (
    <div className="w-full">
      {/* Labels */}
      <div className="flex justify-between mb-3">
        <div>
          <span className="text-xs block" style={{ color: 'var(--txt-4)' }}>Min</span>
          <span className="font-bold text-sm" style={{ color: 'var(--primary-1)' }}>
            {minVal === 0 ? 'Gratuit' : `${minVal} €`}
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs block" style={{ color: 'var(--txt-4)' }}>Max</span>
          <span className="font-bold text-sm" style={{ color: 'var(--primary-1)' }}>
            {isAtMax ? '1500 €+' : `${maxVal} €`}
          </span>
        </div>
      </div>

      {/* Track */}
      <div className="relative h-2 mx-2">
        {/* Fond gris */}
        <div className="absolute inset-0 rounded-full" style={{ background: 'var(--border-2)' }} />
        {/* Plage active — toujours dans les limites grâce au clamp */}
        <div ref={rangeRef} className="absolute top-0 h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, var(--primary-1), var(--accent))' }} />

        {/* Thumb min */}
        <input type="range" min={min} max={max} value={minVal} onChange={handleMin}
          className="price-thumb"
          style={{ zIndex: minVal > max - 100 ? 5 : 3 }} />

        {/* Thumb max */}
        <input type="range" min={min} max={max} value={maxVal} onChange={handleMax}
          className="price-thumb"
          style={{ zIndex: 4 }} />
      </div>

      <style>{`
        .price-thumb {
          position: absolute;
          top: -6px; left: 0;
          width: 100%; height: 16px;
          background: none;
          pointer-events: none;
          -webkit-appearance: none; appearance: none;
          outline: none;
        }
        .price-thumb::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          pointer-events: all; cursor: grab;
          width: 20px; height: 20px;
          border-radius: 50%;
          background: var(--primary-1);
          border: 3px solid var(--bg);
          box-shadow: 0 2px 10px rgba(255,107,53,0.45);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .price-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.25);
          box-shadow: 0 4px 16px rgba(255,107,53,0.6);
        }
        .price-thumb:active::-webkit-slider-thumb { cursor: grabbing; }
        .price-thumb::-moz-range-thumb {
          pointer-events: all; cursor: grab;
          width: 20px; height: 20px;
          border-radius: 50%;
          background: var(--primary-1);
          border: 3px solid var(--bg);
          box-shadow: 0 2px 10px rgba(255,107,53,0.45);
        }
      `}</style>
    </div>
  )
}
