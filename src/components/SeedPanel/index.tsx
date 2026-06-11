'use client'
import { useState } from 'react'

const PARTS = [
  { key: 'home', label: 'Home' },
  { key: 'solutions', label: 'Solutions' },
  { key: 'where-it-works', label: 'Where It Works' },
  { key: 'case-studies', label: 'Case Studies' },
  { key: 'why-amerikiosks', label: 'Why Amerikiosks' },
  { key: 'contact', label: 'Contact' },
  { key: 'for-brands', label: 'For Brands' },
  { key: 'header', label: 'Header' },
  { key: 'footer', label: 'Footer' },
]

type Status = 'idle' | 'loading' | 'ok' | 'error'

export default function SeedPanel() {
  const [statuses, setStatuses] = useState<Record<string, Status>>({})

  const run = async (part?: string) => {
    const key = part ?? '__all__'
    setStatuses((s) => ({ ...s, [key]: 'loading' }))
    try {
      const url = part ? `/next/seed/run?part=${part}` : '/next/seed/run'
      const res = await fetch(url, { method: 'POST' })
      setStatuses((s) => ({ ...s, [key]: res.ok ? 'ok' : 'error' }))
    } catch {
      setStatuses((s) => ({ ...s, [key]: 'error' }))
    }
  }

  const icon = (key: string) =>
    ({ loading: ' ⏳', ok: ' ✓', error: ' ✗', idle: '' })[statuses[key] ?? 'idle']

  return (
    <div
      style={{
        padding: '1rem',
        borderTop: '1px solid var(--theme-elevation-100)',
        marginTop: '0.5rem',
      }}
    >
      <p
        style={{
          fontSize: '0.65rem',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--theme-elevation-500)',
          margin: '0 0 0.5rem',
        }}
      >
        Seed
      </p>
      <button
        type="button"
        onClick={() => run()}
        style={btn(true)}
      >
        🌱 Seed all{icon('__all__')}
      </button>
      <div
        style={{ marginTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}
      >
        {PARTS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => run(key)}
            style={btn(false)}
          >
            {label}
            {icon(key)}
          </button>
        ))}
      </div>
    </div>
  )
}

function btn(primary: boolean): React.CSSProperties {
  return {
    width: '100%',
    textAlign: 'left',
    padding: '0.35rem 0.6rem',
    fontSize: '0.8rem',
    fontWeight: primary ? 600 : 400,
    background: primary ? 'var(--theme-elevation-150)' : 'transparent',
    color: 'var(--theme-text)',
    border: '1px solid var(--theme-elevation-200)',
    borderRadius: 4,
    cursor: 'pointer',
  }
}
