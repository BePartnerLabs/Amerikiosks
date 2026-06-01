/**
 * One-time script: marks existing migrations as applied in the payload_migrations
 * table when the DB was already bootstrapped via dev-mode schema push.
 * Run with: node scripts/mark-migrations-applied.mjs
 */
import pg from '../node_modules/.pnpm/pg@8.16.3/node_modules/pg/lib/index.js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '..', '.env')

// Parse .env manually
const env = {}
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const idx = trimmed.indexOf('=')
  if (idx === -1) continue
  const key = trimmed.slice(0, idx).trim()
  const val = trimmed.slice(idx + 1).trim()
  env[key] = val
}

const DATABASE_URL = env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('DATABASE_URL not found in .env')
  process.exit(1)
}

const { Client } = pg
const client = new Client({ connectionString: DATABASE_URL })
await client.connect()

const migrations = ['20260528_232318', '20260601_000000']

for (const name of migrations) {
  const { rows } = await client.query(
    'SELECT id FROM payload_migrations WHERE name = $1',
    [name]
  )
  if (rows.length === 0) {
    await client.query(
      'INSERT INTO payload_migrations (name, batch, updated_at, created_at) VALUES ($1, $2, now(), now())',
      [name, 1]
    )
    console.log(`Marked ${name} as applied`)
  } else {
    console.log(`${name} already recorded`)
  }
}

await client.end()
console.log('Done.')
