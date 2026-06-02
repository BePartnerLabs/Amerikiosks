'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

function PreviewLoginForm() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const redirect = searchParams.get('redirect') || '/'
    router.push(`${redirect}?preview=${encodeURIComponent(password)}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '300px' }}
    >
      <h1 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Site Preview</h1>
      <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
        Enter the access password to continue.
      </p>
      <input
        type="password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value)
          setError(false)
        }}
        placeholder="Password"
        style={{
          padding: '8px 12px',
          border: '1px solid #ccc',
          borderRadius: '6px',
          fontSize: '1rem',
        }}
      />
      {error && <p style={{ color: 'red', margin: 0, fontSize: '0.85rem' }}>Incorrect password</p>}
      <button
        type="submit"
        style={{
          padding: '8px 12px',
          background: '#000',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '1rem',
        }}
      >
        Access Site
      </button>
    </form>
  )
}

export default function PreviewLoginPage() {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
      }}
    >
      <Suspense>
        <PreviewLoginForm />
      </Suspense>
    </div>
  )
}
