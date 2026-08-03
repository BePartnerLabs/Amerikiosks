# A BPL form-builder plugin of our own — design

> Packaging what this project already bolted onto
> `@payloadcms/plugin-form-builder`, once a second client needs forms.

## Context

The plugin got this project a long way, but everything it did not cover was
added through `formOverrides` in `src/plugins/index.ts`:

- **Per-field `externalId`** — the Monday column each answer maps to, added to
  every field block except `message` and `payment`.
- **`valueType`** (plain text / phone / website) — declared rather than guessed,
  because the plugin has no phone field and a regex over field names missed
  anything an editor called "Cell" or "Número de contacto". A missed phone
  reaches Monday unnormalised, which its phone column rejects.
- **`autocomplete`** as a select of HTML spec tokens — free text meant a typo
  like `e-mail` failed silently, since the browser ignores an unknown token.
- **A consent toggle plus localized `consentText`**, with `consentGiven`/
  `consentAt` written onto each submission at the moment of capture.
- **`description`, `footnote`, structured confirmation fields**, and
  `displayTitle` (the localized public heading, kept separate from `title`,
  which is the internal identifier GA and the admin list key off).
- **Field types**: `radio` and `date`, which the plugin ships but does not
  enable, and `toggle`, which it does not have.

## Why this is a plugin and not configuration

Two things say the seam is in the wrong place.

**We mutate the plugin's shared block objects.** Its blocks are exported as
shared object instances and this config is evaluated more than once (dev
hot-reload, repeated imports), so pushing fields onto `block.fields` appended
them again on every pass — Payload refused to boot with
`A field with the name 'valueType' was found multiple times`. The `addOnce`
guard papers over it. Writing into another package's objects is not a thing to
keep doing.

**The upload block's `mimeTypes` is free text**, so a typo silently disables the
filter. Same class of failure the `autocomplete` select was introduced to
prevent, still present one field over.

## Two packages, not one

**`@bpl/payload-forms`** and **`@bpl/payload-monday`**, with the dependency
pointing one way only: the Monday package knows the integration interface, the
forms package knows nothing about Monday.

That is not tidiness. Today Monday's vocabulary is *in the form schema* — a field
is literally called `mondayGroupId`. The day a client uses HubSpot that field is
still there, empty and lying about what it means. The forms package should define
a target as an interface (take a submission, return an external id) and stop
there.

The Monday package carries everything specific: the board and group pickers, the
boards cache in Settings, the column drift check, `create_item` /
`change_multiple_column_values`, and `add_file_to_column` with its multipart
upload. All of that is already written in this repo and none of it depends on
Amerikiosks — which is why the roadmap has a separate entry for extracting it.
The two should land together, since the forms package's adapter slot is what the
Monday package plugs into.

## It wraps the Payload plugin, it does not replace it

`@payloadcms/plugin-form-builder` provides the `forms` and `form-submissions`
collections, the admin field editor, emails and confirmations. Reimplementing
that means taking on its maintenance for no gain.

But wrapping properly is not "keep mutating it from the inside". The mutation is
where the `addOnce` guard came from: its blocks are shared object instances and
this config is evaluated more than once, so pushing fields onto `block.fields`
appended them again on every pass until Payload refused to boot.

The plugin **accepts blocks of our own through configuration** — `formOverrides`
already declares `number` and `toggle` that way. The clean version declares our
blocks for every type we care about and disables the plugin's, instead of writing
into its objects. `addOnce` then disappears by construction rather than by patch,
which is the difference between a fix and a workaround.

## Shape

`@bpl/payload-forms` exposes three things:

1. **Field types we actually need** — phone, toggle, radio, date, and an upload
   whose accepted types are a validated list rather than free text — declared as
   our own blocks instead of mutations of someone else's.
2. **An integration target as an interface, not a vendor.** `integrationTarget`
   plus a per-adapter config supplied by whoever installs it. The adapter takes a
   submission and returns an external id; retries, status recording and the
   resync endpoint stay in the forms package, because those are the same whatever
   the destination is.
3. **The trust envelope**, which already exists but is spread across a route:
   honeypot, minimum fill time, Turnstile, rate limit and server-side validation
   against the declared field list. That is the part most likely to be
   reimplemented badly by whoever builds the next client's forms.

## What this buys

Not elegance. Today, standing up forms for another client means carrying the
bugs again: the `addOnce` boot failure, phone normalisation, the column mapping,
the consent record, the submission payload that must be filtered down to
declared fields or every real submission 400s.

## When

**When a second client needs forms — not before.** Packaging for one consumer
means guessing the API; a second one shows which parts are Amerikiosks-specific
(board ids, the claim flow) and which are common. The same reasoning applies to
extracting the Monday integration, and the two should land together since the
plugin's adapter slice is what the Monday package would plug into.

## Not chosen

- **Fork the Payload plugin, or replace it.** Both mean owning the `forms` and
  `form-submissions` collections, the admin field editor, emails and
  confirmations — a lot of maintenance to avoid an adapter layer we want anyway.
- **One package instead of two.** Simpler to build and wrong the first time a
  client uses anything other than Monday: the vendor's vocabulary would stay in
  the form schema, which is exactly the problem this is meant to remove.
- **Keep growing `formOverrides`.** Works, and is what happens by default. The
  cost is not visible in this repo — it appears the day someone copies 450 lines
  of overrides into another project and copies the bugs with them.
- **Wait for Payload to add the missing field types.** `radio` and `date` ship
  disabled and `toggle` does not exist; there is no signal that changes, and the
  Monday-specific parts would never be upstream anyway.
