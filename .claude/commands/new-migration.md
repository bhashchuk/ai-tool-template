---
description: Create a Supabase migration
argument-hint: "<snake_case_name>"
allowed-tools: Bash(supabase migration new:*)
---

Create a new Supabase migration named `$ARGUMENTS`.

1. The name must match `^[a-z][a-z0-9_]*$`. If it does not, stop and ask for a snake_case name. Never put the name in an unquoted shell expansion.
2. Run `supabase migration new '<name>'` with the validated name in single quotes.
3. Write the SQL in the new file under `supabase/migrations/`. Rules:
   - Never edit an existing migration. Add a new one.
   - Every new table enables row level security and has explicit policies.
   - Prefer additive, backward-compatible changes (add nullable columns, backfill, then tighten in a later migration).
   - Add indexes for foreign keys and common filters.
4. Tell the user to run `supabase db reset` themselves to confirm the chain on a clean local database. Do not run it; it wipes local data.
5. Remind the user that a migration makes the PR High risk.
