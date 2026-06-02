#!/bin/bash
# Run unit tests if any source files were touched
touched=$(git diff --name-only HEAD 2>/dev/null | grep -E '^src/')
[ -z "$touched" ] && exit 0

output=$(pnpm vitest run --config ./vitest.config.mts tests/unit 2>&1)
if [ $? -ne 0 ]; then
  failures=$(echo "$output" | grep -E "✗|×|FAIL" | head -5 | tr '\n' ' ')
  echo "{\"systemMessage\": \"Unit tests failed: $failures\"}"
fi
