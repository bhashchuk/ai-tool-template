# Hetzner backend deploy

The `Deploy backend` workflow builds the image, pushes it to GHCR, copies this
folder to the server and runs `remote-deploy.sh`, which starts the new image,
checks `/health`, and rolls back to the previous image if the check fails.

App directory is `/opt/<GitHub-repo-name>` — it must match
`github.event.repository.name` used by the workflow.

## One-time server setup

1. Create a Hetzner server (Ubuntu LTS). Firewall: **22** and **8000** (the API
   is published on `:8000`; frontend usually reaches it via Vercel rewrite or
   `NEXT_PUBLIC_API_URL`).
2. Install Docker: `curl -fsSL https://get.docker.com | sh`
3. Create a deploy user in the `docker` group and add the deploy public key to
   its `~/.ssh/authorized_keys`. Disable SSH password login.
4. `mkdir -p /opt/<repo-name>` owned by the deploy user.
5. Create `/opt/<repo-name>/.env` from `backend/.env.example` (set real
   `ALLOWED_ORIGINS` to the production frontend origin).

## GitHub secrets (environment `production`)

| Secret | Value |
| --- | --- |
| `HETZNER_HOST` | server IP or hostname |
| `HETZNER_USER` | deploy user |
| `HETZNER_SSH_KEY` | private key for the deploy user |
| `HETZNER_KNOWN_HOSTS` | output of `ssh-keyscan <host>` |

## Operating

- Logs: `cd /opt/<repo-name> && IMAGE=$(cat .current_image) docker compose logs -f backend`
- Health: `curl -fsS http://<host>:8000/health`
- Roll back: run the `Deploy backend` workflow manually and pass a previous
  commit SHA as `image_tag`.
