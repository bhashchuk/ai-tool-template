@AGENTS.md

## Claude Code specifics

- Shared permissions and hooks are in `.claude/settings.json`. Edited Python and TS files are auto-formatted by a hook. Do not work around the deny rules; if one blocks you, tell the user.
- Slash commands: `/pr` opens a draft PR from the template, `/review` runs the reviewer subagent on the current branch, `/new-migration <name>` creates a Supabase migration.
- Before `/pr`, run `/review` and fix anything it marks as blocking.
- Personal overrides go in `CLAUDE.local.md` or `.claude/settings.local.json` (both git-ignored).
