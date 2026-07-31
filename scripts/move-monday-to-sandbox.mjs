#!/usr/bin/env node
/**
 * Repoints the LOCAL database's forms at the [LAB] Monday.com boards.
 *
 * Run it after every `./scripts/restore-prod-dump.sh`. A production restore
 * brings the *client's* board ids, group ids and column mappings with it, so a
 * local submission with the mock switched off would file a real item on a board
 * the sales team reads. This rewrites those ids to our own sandbox account, so
 * local can talk to a live Monday API without touching anything the client
 * depends on.
 *
 *   node scripts/move-monday-to-sandbox.mjs            # show the plan, change nothing
 *   node scripts/move-monday-to-sandbox.mjs --apply    # write it
 *
 * Reads MONDAY_API_TOKEN and DATABASE_URL from .env.local. That token must be
 * the sandbox one — the script refuses to run if it can see a production board.
 *
 * Idempotent: running it twice is a no-op, and it never touches form content,
 * only the integration ids.
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { Client } = require('pg')

const MONDAY_API = 'https://api.monday.com/v2'

// The client's boards. Their ids are what a production restore carries, and
// seeing any of them means the token is the wrong one — bail rather than risk
// a live write.
const PRODUCTION_BOARD_IDS = ['4024508641', '4024476985', '4042731281']

/**
 * Which sandbox board stands in for each production board, and which group new
 * items should land in. Matched by *name*, not id, so a board rebuilt from
 * scratch in the sandbox keeps working without editing this file.
 */
const LAB_EQUIVALENT = {
  4024508641: { board: '[LAB] Design your kiosk', group: 'Pending Review' },
  4024476985: { board: '[LAB] Amerikiosks Placement', group: 'Pending Review' },
  4042731281: { board: '[LAB] Contact Us - AK', group: 'Incoming' },
}

/**
 * Field label → sandbox column title, for the pairs normalisation cannot guess.
 * Everything else is matched by comparing the field's label with the column
 * title, ignoring case, accents and punctuation.
 */
const COLUMN_TITLE_OVERRIDES = {
  'company/brand name': 'name',
  'expected monthly sales per kiosk*': 'Sales Expectations',
  'which hardware are you interested in?': 'Kiosk Type',
  '¡qué máquina te interesa?': 'Kiosk Type',
  'do you currently have or have had automated kiosks?': 'Currently has kiosks?',
  'what products are you looking to commercialize?': 'Products',
  'what indicators would you evaluate for success?': 'success Indicators',
  'which types of locations/lease agreements?': 'Types of Locations',
  'additional info about your brand': 'Additional information',
  'upload media': 'Attachments',
  'attach images/files': 'Attachments',
  'attach pictures/map of property': 'Attachments',
  'phone number': 'Phone',
  'suggested location in the building': 'Location in the building',
  'current occupancy percentage': 'Occupancy %',
  'property name': 'Name',
  'expected monthly sales per kiosk': 'Sales Expectations',
  'upload (media)': 'Attachments',
}

const normalise = (value) =>
  (value ?? '')
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

function readEnvLocal() {
  const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  const env = {}
  for (const line of raw.split('\n')) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, '')
  }
  return env
}

async function monday(token, query) {
  const res = await fetch(MONDAY_API, {
    method: 'POST',
    headers: { Authorization: token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  const json = await res.json()
  if (json.errors) throw new Error(`Monday API: ${JSON.stringify(json.errors)}`)
  return json.data
}

const env = readEnvLocal()
const token = env.MONDAY_API_TOKEN
const databaseUrl = env.DATABASE_URL

if (!token) {
  console.error('MONDAY_API_TOKEN missing from .env.local — put your sandbox token there.')
  process.exit(1)
}
if (!databaseUrl || !/localhost|127\.0\.0\.1/.test(databaseUrl)) {
  console.error(`DATABASE_URL does not look local (${databaseUrl ?? 'unset'}). Refusing to run.`)
  process.exit(1)
}

const apply = process.argv.includes('--apply')

// Guard, not a formality: the whole point is that a restore leaves the client's
// token in Settings, and it would be easy to paste it into .env.local by
// mistake. If this token can see a production board, it is the wrong token.
const guard = await monday(token, `query { boards(ids:[${PRODUCTION_BOARD_IDS}]) { id name } }`)
if (guard.boards?.length) {
  console.error('REFUSING: this token can see production boards:')
  for (const b of guard.boards) console.error(`  ${b.id} ${b.name}`)
  console.error('Put the sandbox token in .env.local as MONDAY_API_TOKEN.')
  process.exit(1)
}

const account = await monday(token, 'query { me { account { name slug } } }')
console.log(`Monday account: ${account.me.account.name} (${account.me.account.slug})`)

const { boards } = await monday(
  token,
  'query { boards(limit:50) { id name groups { id title } columns { id title type } } }',
)
const labBoards = new Map(boards.map((b) => [b.name, b]))

const db = new Client({ connectionString: databaseUrl })
await db.connect()

const { rows: forms } = await db.query(
  `SELECT id, title, external_id, monday_group_id, integration_target
     FROM forms
    WHERE integration_target = 'monday'
    ORDER BY id`,
)

// Every field block the form builder can carry submission data on. Each has its
// own table, all with the same three columns we care about.
const FIELD_TABLES = [
  'forms_blocks_text',
  'forms_blocks_email',
  'forms_blocks_textarea',
  'forms_blocks_number',
  'forms_blocks_select',
  'forms_blocks_checkbox',
  'forms_blocks_upload',
  'forms_blocks_radio',
  'forms_blocks_date',
  'forms_blocks_toggle',
]

let changes = 0
let unmapped = 0

for (const form of forms) {
  const alreadySandbox = boards.some((b) => b.id === form.external_id)
  if (alreadySandbox) {
    console.log(`\n[${form.id}] ${form.title} — already pointed at the sandbox, nothing to do`)
    continue
  }

  const equivalent = LAB_EQUIVALENT[form.external_id]
  if (!equivalent) {
    console.log(
      `\n[${form.id}] ${form.title} — board ${form.external_id} has no LAB equivalent, skipped`,
    )
    continue
  }

  const board = labBoards.get(equivalent.board)
  if (!board) {
    console.error(`\n[${form.id}] ${form.title} — sandbox board "${equivalent.board}" not found`)
    process.exitCode = 1
    continue
  }

  const group = board.groups.find((g) => normalise(g.title) === normalise(equivalent.group))
  if (!group) {
    console.error(`\n[${form.id}] ${form.title} — group "${equivalent.group}" not on ${board.name}`)
    process.exitCode = 1
    continue
  }

  console.log(`\n[${form.id}] ${form.title}`)
  console.log(`  board ${form.external_id} -> ${board.id} (${board.name})`)
  console.log(`  group ${form.monday_group_id} -> ${group.id} (${group.title})`)
  changes += 1

  if (apply) {
    await db.query('UPDATE forms SET external_id = $1, monday_group_id = $2 WHERE id = $3', [
      board.id,
      group.id,
      form.id,
    ])
  }

  const columnsByTitle = new Map(board.columns.map((c) => [normalise(c.title), c]))

  for (const table of FIELD_TABLES) {
    const { rows: fields } = await db.query(
      `SELECT id, name, external_id FROM ${table} WHERE _parent_id = $1`,
      [form.id],
    )

    for (const field of fields) {
      // Whichever field carries `item_name` becomes the item's title rather
      // than a column — it is a sentinel, not an id, so leave it alone.
      if (!field.external_id || field.external_id === 'item_name') continue

      const { rows: labelRows } = await db.query(
        `SELECT label FROM ${table}_locales WHERE _parent_id = $1 AND _locale = 'en' LIMIT 1`,
        [field.id],
      )
      const label = labelRows[0]?.label ?? field.name

      const overridden = COLUMN_TITLE_OVERRIDES[label?.toLowerCase?.()]
      const column =
        columnsByTitle.get(normalise(overridden)) ??
        columnsByTitle.get(normalise(label)) ??
        columnsByTitle.get(normalise(field.name))

      if (!column) {
        // Left blank rather than guessed: an id that does not exist on the board
        // makes the whole submission fail, while a blank one just drops that
        // single answer from the sync.
        console.log(
          `    ! "${label}" — no sandbox column, clearing its id (was ${field.external_id})`,
        )
        unmapped += 1
        if (apply) {
          await db.query(`UPDATE ${table} SET external_id = NULL WHERE id = $1`, [field.id])
        }
        continue
      }

      if (column.id !== field.external_id) {
        console.log(`    "${label}" -> ${column.id} (${column.title})`)
        if (apply) {
          await db.query(`UPDATE ${table} SET external_id = $1 WHERE id = $2`, [
            column.id,
            field.id,
          ])
        }
      }
    }
  }
}

await db.end()

console.log(
  `\n${apply ? 'Applied' : 'Planned'}: ${changes} form(s) repointed, ${unmapped} field(s) without a sandbox column.`,
)
if (!apply) console.log('Nothing was written. Re-run with --apply to make the change.')
else console.log('Set MONDAY_LIVE=true in .env.local to send real items to the sandbox.')
