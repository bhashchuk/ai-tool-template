# 0001. Standard stack for AI tools

Date: 2026-11-04
Status: accepted

## Context
Each tool is owned end to end by one engineer. A shared stack lets anyone read, review and operate any tool, and lets Claude Code work with the same conventions everywhere.

## Decision
- Backend: Python + FastAPI in Docker on Hetzner (published on port 8000).
- Frontend: Next.js on Vercel.
- Data and auth: Supabase, schema changed only through migrations.
- Prompts as files, LLM behavior covered by evals in CI.
- All changes through PRs with automated checks and an AI review pass.

## Alternatives considered
- Backend on Vercel functions: LLM calls and background work outgrow function time limits.
- Calling the LLM from the frontend: exposes keys and removes the place to enforce cost and auth limits.

## Consequences
Less per-tool decision making and faster onboarding. A tool that does not fit the stack needs its own ADR.
