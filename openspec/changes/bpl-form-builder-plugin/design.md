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

## Shape

A plugin that **wraps** `@payloadcms/plugin-form-builder` rather than patching it
from outside, exposing three things:

1. **Field types we actually need** — phone, toggle, radio, date, and an upload
   whose accepted types are a validated list rather than free text — declared as
   our own blocks instead of mutations of someone else's.
2. **An integration target as an optional slice.** Today Monday; the field names
   in the schema should not be Monday's. `integrationTarget` + a per-adapter
   config, with the Monday adapter carried by the package described in
   `openspec/changes/` for the Monday extraction (see the roadmap entry), not
   baked into the form fields.
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

- **Fork the Payload plugin.** Inherits its release cadence and every future
  merge conflict, to avoid an adapter layer we want anyway.
- **Keep growing `formOverrides`.** Works, and is what happens by default. The
  cost is not visible in this repo — it appears the day someone copies 450 lines
  of overrides into another project and copies the bugs with them.
- **Wait for Payload to add the missing field types.** `radio` and `date` ship
  disabled and `toggle` does not exist; there is no signal that changes, and the
  Monday-specific parts would never be upstream anyway.
