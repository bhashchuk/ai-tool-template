---
description: Create a Supabase migration
argument-hint: "<snake_case_name>"
allowed-tools: Bash(supabase migration new:*), Bash(supabase db reset)
---

Create a new Supabase migration named `$ARGUMENTS`.

1. Run `supabase migration new $ARGUMENTS`.
2. Write the SQL in the new file under `supabase/migrations/`. Rules:
   - Never edit an existing migration. Add a new one.
   - Every new table enables row level security and has explicit policies.
   - Prefer additive, backward-compatible changes (add nullable columns, backfill, then tighten in a later migration).
   - Add indexes for foreign keys and common filters.
3. Run `supabase db reset` to confirm the full migration chain applies on a clean local database.
4. Remind the user that a migration makes the PR High risk.
