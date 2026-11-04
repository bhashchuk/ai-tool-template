# <TOOL_NAME>

<!-- One paragraph: what this tool does and who uses it. Fill in on the first commit. -->

## Stack

- `backend/`: Python 3.12, FastAPI. Runs on Hetzner (Docker + Caddy).
- `frontend/`: Next.js (App Router, TypeScript). Runs on Vercel.
- `supabase/`: Postgres, auth, storage. Schema changes only through migrations.
- `evals/`: fixed test cases for LLM behavior, run in CI.
- Prompts live in `backend/app/prompts/*.md`. Never inline a prompt in code.

## Commands

Backend (run from `backend/`):

- Install: `pip install -e ".[dev]"`
- Run: `uvicorn app.main:app --reload`
- Check: `ruff check . && ruff format --check . && mypy app && pytest -q`

Frontend (run from `frontend/`):

- Install: `npm install`
- Run: `npm run dev`
- Check: `npm run lint && npm run typecheck && npm run build`

Other:

- Evals: `python evals/run_evals.py` (add `--mock` to test the runner without API calls)
- New migration: `supabase migration new <name>`
- Local DB: `supabase start`, `supabase db reset`

## Rules

1. Never commit to `main`. Work on `feat/...` or `fix/...` branches and open a PR with the template. Use `/pr`.
2. One PR, one concern, under about 400 changed lines. Split larger work.
3. Changing a prompt, model, temperature or retrieval logic means adding or updating eval cases in the same PR. Treat it as at least Medium risk.
4. Database: add a new migration file. Never edit a migration that has been merged. Every table gets row level security.
5. The browser never calls an LLM provider and never sees the Supabase service role key. All LLM calls go through the backend.
6. Every non-public backend endpoint depends on `current_user` from `app/auth.py`.
7. Secrets go in `.env` files only. When you add a variable, add it to the matching `.env.example`.
8. Prefer existing dependencies. A new dependency needs a one-line reason in the PR.
9. Keep LLM calls bounded: set `max_tokens`, a timeout, and no unbounded retry or agent loops.
10. Pin the model through `LLM_MODEL`. Do not switch models inside a PR that does something else.

## Definition of done

- New behavior has tests that fail without the change.
- Prompt or model changes have eval coverage.
- `docs/runbook.md` is updated if env vars, deploy steps or failure modes changed.
- The PR body follows the template and is honest: write "not run" for anything you did not verify. Do not repeat lint, typecheck or test results that CI already reports.
