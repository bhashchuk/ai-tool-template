# Evals

Fixed test cases for LLM behavior. CI runs them whenever prompts, `llm.py`, `config.py` or this folder change, and fails the PR if the pass rate drops below the threshold.

- Add cases to `cases/*.jsonl` (format is in the docstring of `run_evals.py`).
- Aim for 20-50 real cases per tool, copied from real usage. Add a case every time a bug is found in production.
- `python evals/run_evals.py --mock` checks the runner itself without API calls. It says nothing about model quality.
- Substring checks are crude on purpose. When a tool needs graded quality scoring, extend the runner with an LLM judge in this folder and note it in an ADR.
