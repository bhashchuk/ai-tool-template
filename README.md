# AI tool template

Starting point for every new AI tool: Python backend on Hetzner, Next.js frontend on Vercel, Supabase for data and auth, with Claude Code config, CI, AI review, evals and deploys already wired.

## Create a new tool

One-time: push this repo to GitHub as `ai-tool-template` and enable **Settings > Template repository**.

Per tool:

```bash
gh repo create <org>/<tool-name> --template <org>/ai-tool-template --private --clone
cd <tool-name>
scripts/setup-repo.sh        # merge rules, labels, branch protection, production environment
```

Then, in the new repo:

1. Replace `<TOOL_NAME>` (search the repo), `CHANGE_ME` in `supabase/config.toml`, and `@OWNER` in `.github/CODEOWNERS`.
2. Fill in the first paragraph of `AGENTS.md`.
3. Set the secrets listed below, install the Claude GitHub App on the repo, and connect it to Vercel with root directory `frontend`.
4. Set up the server following `deploy/README.md`.

## What is in the box

| Path | Purpose |
| --- | --- |
| `AGENTS.md`, `CLAUDE.md` | Rules and commands for agents. `CLAUDE.md` imports `AGENTS.md`, so there is one source of truth. |
| `.claude/` | Shared permissions, format-on-edit hook, `/pr`, `/review`, `/new-migration`, and a `reviewer` subagent. |
| `.github/PULL_REQUEST_TEMPLATE.md` | PR template written for agents to fill in. CI reads the `Level:` line. |
| `.github/workflows/ci.yml` | Backend, frontend, secret scan, and evals (only when prompts or model config change). |
| `.github/workflows/pr-checks.yml` | Requires a risk level, enforces a minimum level by path, labels the PR, warns above ~400 lines. |
| `.github/workflows/ai-review.yml` | Strict AI reviewer on non-draft PRs. |
| `.github/workflows/deploy-*.yml` | Backend to Hetzner (with health check and auto-rollback), migrations to Supabase. |
| `backend/` | FastAPI, Supabase auth dependency, LLM wrapper with prompt files and usage logging. |
| `frontend/` | Next.js with a Supabase client and an authenticated `api()` helper. |
| `supabase/` | Migrations folder. Schema changes only through migrations. |
| `evals/` | Eval runner and cases. |
| `docs/` | Runbook template and ADRs. |

## Daily workflow

1. Branch off `main` and build with Claude Code.
2. Run `/review`, fix anything blocking.
3. Run `/pr`. It opens a **draft** PR from the template.
4. Read the full diff yourself, then mark the PR ready. That triggers the AI reviewer.
5. CI and the AI review run. The code owner reviews, focusing on the Risk level, Review focus and AI review summary.
6. Squash merge. Frontend, backend and migrations deploy from `main`.

## Required checks

Configured by `scripts/setup-repo.sh`. Names must match the job names in the workflows.

| Check | What it does |
| --- | --- |
| `backend` | ruff, ruff format, mypy, pytest |
| `frontend` | eslint, typecheck, build |
| `secrets-scan` | gitleaks over the full history |
| `evals` | eval pass rate; skipped when nothing LLM-related changed |
| `pr-template` | risk level declared and not lower than the touched paths require |

## Secrets and variables

| Name | Where | Used by |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | repo secret | AI review, evals. Use a separate key with a spend limit. |
| `HETZNER_HOST`, `HETZNER_USER`, `HETZNER_SSH_KEY`, `HETZNER_KNOWN_HOSTS` | `production` environment | backend deploy |
| `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_REF` | `production` environment | migration deploy |
| `AI_REVIEW_MODEL` | repo variable, optional | overrides the AI review model |
| `NEXT_PUBLIC_*` | Vercel project | frontend |
| backend `.env` | on the server, `/opt/<repo>/.env` | backend runtime |

## Local development

```bash
# Backend
cd backend && cp .env.example .env && pip install -e ".[dev]" && uvicorn app.main:app --reload

# Frontend
cd frontend && cp .env.example .env.local && npm install && npm run dev

# Database
supabase start
```

Migrations and the backend deploy at the same time on merge, so keep migrations backward compatible with the previous backend version.
