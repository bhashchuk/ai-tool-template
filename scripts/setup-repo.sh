#!/usr/bin/env bash
# One-time GitHub repo configuration for a tool created from this template.
# Needs: gh CLI, logged in, with admin rights on the repo.
# Usage: scripts/setup-repo.sh [owner/repo]
#
# Note: branch protection on private repos requires GitHub Pro, Team or Enterprise.
set -euo pipefail

REPO="${1:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}"
echo "Configuring $REPO"

# Squash-only merges, auto-delete merged branches, allow auto-merge.
gh repo edit "$REPO" \
  --delete-branch-on-merge \
  --enable-squash-merge \
  --enable-merge-commit=false \
  --enable-rebase-merge=false \
  --enable-auto-merge

# Dependabot alerts and security updates.
gh api -X PUT "repos/$REPO/vulnerability-alerts" >/dev/null
gh api -X PUT "repos/$REPO/automated-security-fixes" >/dev/null

# Risk labels (the pr-template check also creates them on demand).
gh label create "risk:low" --color 0E8A16 --description "Low risk change" --repo "$REPO" --force
gh label create "risk:medium" --color FBCA04 --description "Medium risk change" --repo "$REPO" --force
gh label create "risk:high" --color B60205 --description "High risk change" --repo "$REPO" --force

# Protect main: PRs only, code owner review, required CI. Admins can still bypass in an emergency.
gh api -X PUT "repos/$REPO/branches/main/protection" --input - <<'JSON' >/dev/null
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["backend", "frontend", "secrets-scan", "evals", "pr-template"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "require_code_owner_reviews": true,
    "dismiss_stale_reviews": true
  },
  "required_conversation_resolution": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "restrictions": null
}
JSON

# Production environment used by the deploy workflows.
gh api -X PUT "repos/$REPO/environments/production" >/dev/null

cat <<EOF

Done. Still to do by hand:
  1. Replace @OWNER in .github/CODEOWNERS.
  2. Add required reviewers to the "production" environment (Settings > Environments).
  3. Set secrets (gh secret set NAME --repo $REPO):
       repo:        ANTHROPIC_API_KEY
       production:  HETZNER_HOST HETZNER_USER HETZNER_SSH_KEY HETZNER_KNOWN_HOSTS
                    SUPABASE_ACCESS_TOKEN SUPABASE_DB_PASSWORD SUPABASE_PROJECT_REF
     (use --env production for the production ones)
  4. Install the Claude GitHub App on the repo (needed by the AI review workflow).
  5. Connect the repo to Vercel with root directory "frontend".
EOF
