'use client'

import Link from 'next/link'
import { useEffect } from 'react'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

// This replaces the ENTIRE document (both route groups' layouts, i18n
// middleware/providers, everything) when the crash happens above where any
// of that can run — so it renders its own <html>/<body> and can't lean on
// next-intl, the design system's CSS, or any other app-level dependency
// that might itself be the reason we're here. Colors are hardcoded to the
// brand's coral/navy pair (see tokens.css) rather than referencing CSS
// custom properties that this document never loads.
export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          background: '#000d1a',
          color: '#ffffff',
          fontFamily:
            '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '40rem',
            margin: '0 auto',
            padding: '4rem 1.5rem',
          }}
        >
          <p
            aria-hidden="true"
            style={{
              color: '#d41a3a',
              fontSize: 'clamp(4rem, 14vw, 7rem)',
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: '-0.04em',
              margin: '0 0 1.5rem',
            }}
          >
            Oops
          </p>
          <h1
            style={{
              margin: '0 0 1rem',
              fontSize: 'clamp(1.5rem, 3vw + 0.5rem, 2.25rem)',
              fontWeight: 700,
              lineHeight: 1.15,
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              margin: error.digest ? '0 0 0.5rem' : '0 0 2rem',
              fontSize: '1.125rem',
              lineHeight: 1.65,
              color: 'rgba(255, 255, 255, 0.7)',
              maxWidth: '38ch',
            }}
          >
            We hit a snag loading this page. Try again, or head back to the homepage.
          </p>
          {error.digest && (
            <p
              style={{
                margin: '0 0 2rem',
                fontSize: '0.875rem',
                fontFamily: 'monospace',
                color: 'rgba(255, 255, 255, 0.45)',
              }}
            >
              Ref: {error.digest}
            </p>
          )}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={reset}
              style={{
                border: 'none',
                borderRadius: '999px',
                padding: '0.75rem 1.75rem',
                fontSize: '0.9375rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: '#d41a3a',
                color: '#ffffff',
              }}
            >
              Try again
            </button>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                borderRadius: '999px',
                padding: '0.75rem 1.75rem',
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: '#ffffff',
                textDecoration: 'none',
              }}
            >
              Back to Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
