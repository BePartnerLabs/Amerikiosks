#!/bin/bash
# Run TypeScript check if any .ts/.tsx files were touched
touched=$(git diff --name-only HEAD 2>/dev/null | grep -E '\.(ts|tsx)$' | grep -v '^src/migrations/')
[ -z "$touched" ] && exit 0

output=$(pnpm tsc --noEmit 2>&1)
if [ $? -ne 0 ]; then
  echo "{\"systemMessage\": \"TypeScript errors found:\\n$output\"}"
fi
