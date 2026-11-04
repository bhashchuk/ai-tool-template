# Runbook: <TOOL_NAME>

Keep this short and current. Update it in the same PR that changes any of the below.

## Purpose and owner

- What it does:
- Owner:
- Users:

## Architecture and data flow

<!-- Browser (Vercel) -> backend (Hetzner) -> Supabase / LLM provider. List what data goes where, and what is stored. -->

## External dependencies

| Dependency | Used for | If it is down |
| --- | --- | --- |
| Supabase | auth, data | |
| LLM provider | | |

## Configuration

- Backend env vars: see `backend/.env.example`. Real values live in `/opt/<repo>/.env` on the server.
- Frontend env vars: see `frontend/.env.example`. Real values live in the Vercel project settings.
- Model: pinned through `LLM_MODEL`.

## Deploy

- Frontend: merge to `main`, Vercel deploys automatically.
- Backend: merge to `main` runs the `Deploy backend` workflow (build image, push to GHCR, deploy to Hetzner, health check, auto-rollback on failure).
- Database: changes under `supabase/migrations/` run through the `Deploy Supabase migrations` workflow.

## Rollback

- Backend: run the `Deploy backend` workflow manually and set `image_tag` to a previous commit SHA.
- Frontend: promote a previous deployment in Vercel.
- Database: write a new forward migration. Do not edit applied ones.
- Prompt or model change: revert the PR, or switch `LLM_MODEL` back in the server `.env` and restart.

## Known failure modes

<!-- Symptom, likely cause, fix. Add one every time something breaks. -->

## Monitoring

- Health: `https://<domain>/health`
- Logs: `ssh <host>` then `cd /opt/<repo> && docker compose logs -f backend`
- LLM calls log prompt name, model, token counts and latency (`llm_call` log lines).
