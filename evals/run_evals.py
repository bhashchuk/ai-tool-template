"""Run LLM eval cases and fail if the pass rate drops below a threshold.

Usage:
    python evals/run_evals.py                  # real model calls (needs ANTHROPIC_API_KEY)
    python evals/run_evals.py --mock           # plumbing check only, no API calls
    python evals/run_evals.py --threshold 0.9  # minimum pass rate (default 0.9)

Cases live in evals/cases/*.jsonl, one JSON object per line:
    {"id": "...", "prompt": "<prompt file name>", "input": "...",
     "must_contain": ["..."], "must_not_contain": ["..."]}
Checks are case-insensitive. Keep cases real: copy inputs from production logs.
"""

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "backend"))


def load_cases() -> list[dict]:
    cases = []
    for path in sorted((ROOT / "evals" / "cases").glob("*.jsonl")):
        for line in path.read_text(encoding="utf-8").splitlines():
            if line.strip():
                cases.append(json.loads(line))
    return cases


def check(output: str, case: dict) -> list[str]:
    text = output.lower()
    failures = []
    for needle in case.get("must_contain", []):
        if needle.lower() not in text:
            failures.append(f"missing: {needle!r}")
    for needle in case.get("must_not_contain", []):
        if needle.lower() in text:
            failures.append(f"forbidden: {needle!r}")
    return failures


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--mock", action="store_true", help="echo the input instead of calling the model")
    parser.add_argument("--threshold", type=float, default=0.9)
    args = parser.parse_args()

    cases = load_cases()
    if not cases:
        print("No eval cases found in evals/cases/. Add some.")
        return 1

    if args.mock:

        def complete(prompt_name: str, user_input: str) -> str:
            return user_input

    else:
        from app.llm import complete  # noqa: PLC0415

    passed = 0
    for case in cases:
        try:
            output = complete(case["prompt"], case["input"])
            failures = check(output, case)
        except Exception as exc:  # noqa: BLE001
            failures = [f"error: {exc}"]
        if failures:
            print(f"FAIL {case['id']}: {'; '.join(failures)}")
        else:
            passed += 1
            print(f"PASS {case['id']}")

    rate = passed / len(cases)
    print(f"\n{passed}/{len(cases)} passed ({rate:.0%}), threshold {args.threshold:.0%}")
    return 0 if rate >= args.threshold else 1


if __name__ == "__main__":
    sys.exit(main())
