---
description: Review the current branch against main before opening a PR
---

Run `git diff main...HEAD` and `git diff main...HEAD --stat`. Pass both, in full, to the `reviewer` subagent and ask it to review them. Show its findings as-is, grouped as Blocking, Should fix and Notes, and include its suggested risk level. Do not fix anything until the user says so.
