---
title: Voice and tone
read_when: Writing any copy that ships — block defaults, labels, error messages, meta descriptions.
enforced_by: nothing — this is a judgement call, and it needs the client's answer first
---

# Voice and tone

**Status: skeleton. Do not treat the observations below as decided.**

This file exists because copy is written constantly — field defaults, button
labels, error messages, meta descriptions — and right now every one of those is
an individual guess. A written voice makes them consistent.

It is deliberately unfinished. Inventing a brand voice and committing it to the
repo would give it the authority of a decision nobody made, and the client would
then be arguing with a document instead of answering a question. **These are
the questions to answer with them.**

## Questions for the client

**Who is the reader, in their words?** The site addresses brands, venues and
agencies. Do they see those as three audiences with different vocabularies, or
one buyer wearing three hats?

**Formal or direct?** Spanish forces this: *usted* or *tú*. The site currently
mixes registers. This is one decision that unblocks dozens of small ones.

**How technical?** The specs say things like "Refrigeration 4ºC–25ºC combined
with rapid microwave/360º oven heating". Is that the right altitude for a venue
manager, or is it specification-sheet language that belongs on the model page
only?

**What does the brand never say?** Usually more useful than what it does say.
"Innovative", "solutions", "cutting-edge" are the obvious candidates.

**English first or Spanish first?** Which locale is the original and which is
the translation matters for tone: translated copy inherits the rhythm of its
source.

## Observations from the current site, not conclusions

Recorded so the conversation starts from evidence rather than a blank page:

- Headlines are short and concrete: "Hot food, express speed." Product claims
  carry a number — "about 50 seconds", "90–160 boxes".
- Section eyebrows are uppercase mono, one or two words.
- CTAs are literal and specific: "Explore our Alpha Models", not "Learn more".
- Some UI copy is still English in the Spanish site (`See machine`), because
  field defaults were authored in English and saved into both locales.

## Where this gets used

Once decided: block field defaults, `docs/CLIENT-MANUAL.md`, meta titles and
descriptions, and the AIO/GEO question in
[`definition-of-done.md`](./definition-of-done.md) — a block that "answers a
question" has to answer it in the brand's voice.
