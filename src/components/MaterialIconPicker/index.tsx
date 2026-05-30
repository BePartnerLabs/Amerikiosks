'use client'

import React, { useState, useCallback } from 'react'
import { useField } from '@payloadcms/ui'
import type { TextFieldClientProps } from 'payload'

const COMMON_ICONS = [
  'storefront', 'handshake', 'campaign', 'rocket_launch',
  'flight_takeoff', 'theaters', 'hotel', 'local_mall',
  'apartment', 'groups', 'diversity_3', 'hub',
  'trending_up', 'star', 'bolt', 'verified',
  'place', 'map', 'explore', 'travel_explore',
  'sports_esports', 'stadium', 'museum', 'casino',
  'shopping_bag', 'school', 'business_center', 'domain',
]

export const MaterialIconPicker: React.FC<TextFieldClientProps> = ({ field, path }) => {
  const { value, setValue } = useField<string>({ path: path as string })
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  const filtered = search
    ? COMMON_ICONS.filter((i) => i.includes(search.toLowerCase()))
    : COMMON_ICONS

  const select = useCallback((name: string) => {
    setValue(name)
    setOpen(false)
    setSearch('')
  }, [setValue])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
        {field.label as string}
      </label>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {value && (
          <span className="material-symbols-outlined" style={{ fontSize: 28 }}>
            {value}
          </span>
        )}
        <input
          type="text"
          value={value ?? ''}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type icon name or pick below"
          style={{ flex: 1, padding: '6px 10px', border: '1px solid #ccc', borderRadius: 4, fontSize: 13 }}
        />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          style={{ padding: '6px 12px', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
        >
          {open ? 'Close' : 'Browse'}
        </button>
      </div>

      {open && (
        <div style={{ border: '1px solid #e0e0e0', borderRadius: 6, padding: 12, background: '#fafafa' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search icons..."
            style={{ width: '100%', padding: '6px 10px', marginBottom: 10, border: '1px solid #ccc', borderRadius: 4, fontSize: 13, boxSizing: 'border-box' }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))', gap: 6 }}>
            {filtered.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => select(name)}
                title={name}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  padding: '8px 4px', border: value === name ? '2px solid #e63946' : '1px solid #e0e0e0',
                  borderRadius: 6, background: value === name ? '#fff0f1' : '#fff',
                  cursor: 'pointer', fontSize: 10, color: '#555',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>{name}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }}>{name}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p style={{ color: '#999', fontSize: 12, gridColumn: '1/-1' }}>No icons found</p>
            )}
          </div>
        </div>
      )}

      {field.admin?.description && (
        <p style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{field.admin.description as string}</p>
      )}
    </div>
  )
}
