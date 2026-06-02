#!/bin/bash
# Warn when working directly on main branch
branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
if [ "$branch" = "main" ]; then
  echo '{"systemMessage": "Warning: you are on the main branch. Consider creating a feature branch before making changes."}'
fi
