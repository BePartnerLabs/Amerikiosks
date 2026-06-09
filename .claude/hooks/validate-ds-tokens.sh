#!/bin/bash
# Runs DS token validator on any CSS file just edited by Claude
FILE=$(jq -r '.tool_input.file_path' 2>/dev/null)
if [[ "$FILE" == *.css ]]; then
  node scripts/validate-ds-tokens.mjs "$FILE" 2>/dev/null || true
fi
