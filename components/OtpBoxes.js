'use client'

import { useState, useRef, useEffect } from 'react'

// Code entry as separate square boxes. One real (invisible) input sits on top,
// so typing, backspace, paste and one-time-code autofill all work natively.
const OTP_LEN = 8

export default function OtpBoxes({ value, onChange, length = OTP_LEN }) {
  const [focused, setFocused] = useState(false)
  const inputRef = useRef(null)
  useEffect(() => { if (inputRef.current && document.activeElement === inputRef.current) setFocused(true) }, [])
  const active = Math.min(value.length, length - 1)

  return (
    <div style={{ position: 'relative', margin: '6px 0 4px' }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {Array.from({ length }).map((_, i) => {
          const isActive = focused && i === active
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontWeight: 700,
                color: '#111',
                background: '#fff',
                border: isActive ? '1.5px solid #111' : value[i] ? '1.5px solid #555' : '1.5px solid #cfcfcf',
                borderRadius: 10,
                boxShadow: isActive ? '0 0 0 3px rgba(0,0,0,.08)' : 'none',
                transition: 'border-color .15s, box-shadow .15s',
                userSelect: 'none',
                WebkitUserSelect: 'none'
              }}
            >
              {value[i] || ''}
            </div>
          )
        })}
      </div>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        aria-label="Verification code"
        maxLength={length}
        required
        autoFocus
        value={value}
        onChange={e => onChange(e.target.value.replace(/[^0-9]/g, '').slice(0, length))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, fontSize: 16, border: 0, padding: 0, background: 'transparent', caretColor: 'transparent' }}
      />
    </div>
  )
}
