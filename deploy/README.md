# Hetzner backend deploy

The `Deploy backend` workflow builds the image, pushes it to GHCR, copies this folder to the server and runs `remote-deploy.sh`, which starts the new image, checks `/health`, and rolls back to the previous image if the check fails.

## One-time server setup

1. Create a Hetzner server (Ubuntu LTS). In the Hetzner firewall allow only ports 22, 80 and 443.
2. Install Docker: `curl -fsSL https://get.docker.com | sh`
3. Create a deploy user in the `docker` group and add the deploy public key to its `~/.ssh/authorized_keys`. Disable SSH password login.
4. `mkdir -p /opt/<repo-name>` owned by the deploy user. The folder name must match the GitHub repository name.
5. Create `/opt/<repo-name>/.env` with the backend variables from `backend/.env.example` plus `DOMAIN=<your domain>`.
6. Point the domain's A record at the server. Caddy gets the TLS certificate automatically on first start.

## GitHub secrets (environment `production`)

| Secret | Value |
| --- | --- |
| `HETZNER_HOST` | server IP or hostname |
| `HETZNER_USER` | deploy user |
| `HETZNER_SSH_KEY` | private key for the deploy user |
| `HETZNER_KNOWN_HOSTS` | output of `ssh-keyscan <host>` |

## Operating

- Logs: `cd /opt/<repo-name> && IMAGE=$(cat .current_image) docker compose logs -f backend`
- Roll back: run the `Deploy backend` workflow manually and pass a previous commit SHA as `image_tag`.
