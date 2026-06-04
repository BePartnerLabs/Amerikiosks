/**
 * Marks all existing migration files as applied in payload_migrations.
 * Safe to re-run — skips already-recorded migrations.
 * Run before `payload migrate` on DBs bootstrapped via dev-mode schema push.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

// Load DATABASE_URL from env or .env / .env.local
let DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  for (const envFile of ['.env.local', '.env']) {
    const envPath = join(root, envFile)
    if (!existsSync(envPath)) continue
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
    if (DATABASE_URL) break
  }
}

if (!DATABASE_URL) {
  console.error('DATABASE_URL not found in environment or .env / .env.local')
  process.exit(1)
}

// Discover migration names from src/migrations/ — any .ts file that isn't index.ts
const migrationsDir = join(root, 'src', 'migrations')
const migrations = readdirSync(migrationsDir)
  .filter((f) => f.endsWith('.ts') && f !== 'index.ts')
  .map((f) => f.replace(/\.ts$/, ''))
  .sort()

if (migrations.length === 0) {
  console.log('No migration files found — nothing to mark.')
  process.exit(0)
}

const { Client } = pg
const client = new Client({ connectionString: DATABASE_URL })
await client.connect()

await client.query(`
  CREATE TABLE IF NOT EXISTS payload_migrations (
    id serial PRIMARY KEY,
    name varchar NOT NULL,
    batch integer,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
  )
`)

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
