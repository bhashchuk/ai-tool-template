## What
<!-- 1-2 sentences on what changed. Don't restate the diff or list files. -->

## Why
<!-- The reason for the change, not a description of it. Link the ticket. -->

Ticket:

## Review focus
<!-- Name the specific files or logic that deserve a human's attention, and anything uncertain. Say what is deliberately not included. Skip style and obvious bugs; CI and the AI reviewer cover those. -->

## Risk
<!-- Pick exactly one and give a one-line reason. Keep the "Level:" line format; CI reads it.
High: auth, payments, permissions, migrations, public API, infra.
Medium: business logic, new endpoints, prompt or model changes.
Low: tooling, copy, docs. -->

Level:
Reason:

## Verification
<!-- CI covers lint, typecheck and the test suite. Don't repeat that here. Only list:
- Which tests cover the new behavior, and whether they fail without this change.
- Anything you checked by hand that CI can't (UI, integration, data).
If you didn't verify something, write "not run". -->

## Rollout / rollback
<!-- Only if there is a flag, migration, or non-trivial rollback. Otherwise delete this section. -->

## Authorship
AI-assisted: yes
<!-- A human must read the full diff before marking this ready for review. -->
