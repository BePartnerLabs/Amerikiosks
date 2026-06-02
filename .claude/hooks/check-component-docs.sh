#!/bin/bash
# Remind to update openspec/specs/ when components/blocks/heros are touched
touched=$(git diff --name-only HEAD 2>/dev/null | grep -E '^src/(components|blocks|heros)/')
[ -z "$touched" ] && exit 0

docs_touched=$(git diff --name-only HEAD 2>/dev/null | grep '^openspec/')
[ -n "$docs_touched" ] && exit 0

components=$(echo "$touched" | sed -E 's|^src/[^/]+/||' | cut -d'/' -f1 | sort -u | tr '\n' ',' | sed 's/,$//')
echo "{\"systemMessage\": \"Docs reminder: $components were touched — check if openspec/specs/ needs updating.\"}"
