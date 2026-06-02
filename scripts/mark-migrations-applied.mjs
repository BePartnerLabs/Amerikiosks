/**
 * Marks existing migrations as applied in the payload_migrations table when
 * the DB was bootstrapped via dev-mode schema push (not via `payload migrate`).
 * Safe to re-run — skips already-recorded migrations.
 *
 * Usage:
 *   node scripts/mark-migrations-applied.mjs          # reads DATABASE_URL from env or .env
 */

import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env only if DATABASE_URL not already in environment
let DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  const envPath = join(__dirname, '..', '.env')
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const idx = trimmed.indexOf('=')
      if (idx === -1) continue
      if (trimmed.slice(0, idx).trim() === 'DATABASE_URL') {
        DATABASE_URL = trimmed.slice(idx + 1).trim()
        break
      }
    }
  }
}

if (!DATABASE_URL) {
  console.error('DATABASE_URL not found in environment or .env')
  process.exit(1)
}

const { Client } = pg
const client = new Client({ connectionString: DATABASE_URL })
await client.connect()

// Ensure the payload_migrations table exists (it may not on a fresh DB)
await client.query(`
  CREATE TABLE IF NOT EXISTS payload_migrations (
    id serial PRIMARY KEY,
    name varchar NOT NULL,
    batch integer,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
  )
`)

// Keep this list in sync with src/migrations/index.ts
const migrations = ['20260601_174356', '20260601_184027']

for (const name of migrations) {
  const { rows } = await client.query('SELECT id FROM payload_migrations WHERE name = $1', [name])
  if (rows.length === 0) {
    await client.query(
      'INSERT INTO payload_migrations (name, batch, updated_at, created_at) VALUES ($1, $2, now(), now())',
      [name, 1],
    )
    console.log(`Marked ${name} as applied`)
  } else {
    console.log(`${name} already recorded — skipping`)
  }
}

await client.end()
console.log('Done.')
