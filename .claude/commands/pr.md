---
description: Open a draft PR using the repo template
argument-hint: "[ticket id]"
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git push -u origin HEAD), Bash(gh pr create:*)
---

Open a draft pull request for the current branch. Ticket: $ARGUMENTS

1. Run `git status`, `git log main..HEAD --oneline` and `git diff main...HEAD`. If the current branch is `main`, or there are uncommitted changes, stop and tell the user.
2. Read `.github/PULL_REQUEST_TEMPLATE.md` and follow the instructions in its comments.
3. Fill every section from the actual diff:
   - **What**: 1-2 sentences. No file lists, no restating the diff.
   - **Why**: the reason for the change. Ticket from the argument, else from the branch name, else "none".
   - **Review focus**: the specific files or logic a human must read closely, anything you are unsure about, and what is deliberately left out.
   - **Risk**: exactly one `Level:` line (`Low`, `Medium` or `High`) and a one-line reason. Auth, payments, permissions, migrations, public API and infra are High. Business logic and new endpoints are Medium. A prompt, model or retrieval change is at least Medium.
   - **Verification**: only the tests that cover the new behavior and manual checks you actually performed. Write "not run" for anything you did not do. Do not list lint, typecheck or the general test suite; CI reports those.
   - **Rollout / rollback**: only if there is a flag, migration or non-trivial rollback. Otherwise delete the section.
   - **Authorship**: `AI-assisted: yes`.
4. Run `git push -u origin HEAD`, then `gh pr create --draft --title "<short imperative title>" --body "$(cat <<'EOF' ... EOF)"` with the filled body.
5. Tell the user the PR is a draft: they must read the full diff, then mark it ready for review, which triggers the AI reviewer.
