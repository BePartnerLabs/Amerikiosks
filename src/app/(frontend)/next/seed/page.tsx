'use client'
import { useState } from 'react'

const PARTS = [
  { key: 'home', label: 'Home page' },
  { key: 'solutions', label: 'Solutions page' },
  { key: 'where-it-works', label: 'Where It Works page' },
  { key: 'case-studies', label: 'Case Studies page' },
  { key: 'why-amerikiosks', label: 'Why Amerikiosks page' },
  { key: 'header', label: 'Header' },
  { key: 'footer', label: 'Footer' },
  { key: 'partners', label: 'Partners (Trust Strip logos)' },
]

type Status = 'idle' | 'loading' | 'ok' | 'error'

export default function SeedPage() {
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

  const badge = (key: string) => {
    const s = statuses[key]
    if (!s || s === 'idle') return null
    const map = { loading: '⏳', ok: '✅', error: '❌' }
    return <span style={{ marginLeft: 8 }}>{map[s]}</span>
  }

  return (
    <div
      style={{ fontFamily: 'sans-serif', maxWidth: 520, margin: '4rem auto', padding: '0 1.5rem' }}
    >
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Seed panel</h1>
      <p style={{ color: '#666', marginBottom: '2rem', fontSize: '0.875rem' }}>
        Only available while logged in. Each button re-seeds that section (upsert — safe to re-run).
      </p>

      <div style={{ marginBottom: '2rem' }}>
        <button
          type="button"
          onClick={() => run()}
          style={btnStyle('#011936', '#fff')}
        >
          🌱 Seed everything{badge('__all__')}
        </button>
      </div>

      <hr style={{ margin: '1.5rem 0', borderColor: '#eee' }} />
      <p
        style={{
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#999',
          marginBottom: '1rem',
        }}
      >
        Individual sections
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {PARTS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => run(key)}
            style={btnStyle('#f4f4f5', '#111')}
          >
            {label}
            {badge(key)}
          </button>
        ))}
      </div>
    </div>
  )
}

function btnStyle(bg: string, color: string): React.CSSProperties {
  return {
    background: bg,
    color,
    border: 'none',
    borderRadius: 8,
    padding: '0.65rem 1.25rem',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
  }
}
