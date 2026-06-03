import { useState } from 'react'

function getStrength(pw) {
  if (!pw) return 0
  let score = 0
  if (pw.length >= 6)  score++
  if (pw.length >= 10) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}

const STRENGTH = [
  { label: '',         color: 'var(--border)',   width: '0%' },
  { label: 'Faible',   color: '#ef4444',         width: '20%' },
  { label: 'Faible',   color: '#f97316',         width: '40%' },
  { label: 'Moyen',    color: '#eab308',         width: '60%' },
  { label: 'Fort',     color: '#22c55e',         width: '80%' },
  { label: 'Très fort',color: '#00B8D9',         width: '100%' },
]

export default function PasswordInput({ value, onChange, placeholder = '••••••••', showStrength = false, label, name, required, autoComplete }) {
  const [show, setShow] = useState(false)
  const strength = showStrength ? getStrength(value) : 0
  const s = STRENGTH[Math.min(strength, 5)]

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--txt-2)' }}>{label}</label>
      )}
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          name={name}
          required={required}
          autoComplete={autoComplete}
          className="input-field pr-11"
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
          style={{ color: 'var(--txt-3)' }}
          onMouseOver={e => e.currentTarget.style.color = 'var(--primary-1)'}
          onMouseOut={e => e.currentTarget.style.color = 'var(--txt-3)'}
          tabIndex={-1}
          title={show ? 'Masquer' : 'Afficher'}
        >
          {show ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
      {showStrength && value && (
        <div className="mt-2">
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: s.width, background: s.color }} />
          </div>
          {s.label && (
            <p className="text-xs mt-1 font-medium" style={{ color: s.color }}>{s.label}</p>
          )}
        </div>
      )}
    </div>
  )
}
