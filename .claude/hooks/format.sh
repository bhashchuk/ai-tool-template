#!/usr/bin/env bash
# Auto-format a file after Claude edits it. Never blocks the agent: always exits 0.
f=$(python3 -c 'import json,sys; print(json.load(sys.stdin).get("tool_input",{}).get("file_path",""))' 2>/dev/null)
[ -z "$f" ] && exit 0
root="${CLAUDE_PROJECT_DIR:-$PWD}"

case "$f" in
  *.py)
    if command -v ruff >/dev/null 2>&1; then
      ruff check --fix --quiet "$f" >/dev/null 2>&1
      ruff format --quiet "$f" >/dev/null 2>&1
    fi
    ;;
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.json|*.css)
    prettier="$root/frontend/node_modules/.bin/prettier"
    case "$f" in "$root"/frontend/*) [ -x "$prettier" ] && "$prettier" --write "$f" >/dev/null 2>&1 ;; esac
    ;;
esac
exit 0
