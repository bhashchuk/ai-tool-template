"""Single entry point for LLM calls.

Every call goes through `complete`, so model pinning, token limits, timeouts and
usage logging live in one place. Prompts are files in `app/prompts/`.
"""

import logging
import time
from pathlib import Path
from string import Template

from anthropic import Anthropic

from .config import get_settings

log = logging.getLogger("llm")

PROMPTS_DIR = Path(__file__).parent / "prompts"


def load_prompt(name: str, **variables: str) -> str:
    """Load `prompts/<name>.md`. Use `$name` placeholders for variables."""
    text = (PROMPTS_DIR / f"{name}.md").read_text(encoding="utf-8")
    return Template(text).safe_substitute(variables)


def complete(prompt_name: str, user_input: str, **variables: str) -> str:
    settings = get_settings()
    client = Anthropic(
        api_key=settings.anthropic_api_key,
        timeout=settings.llm_timeout_s,
        max_retries=2,
    )

    start = time.perf_counter()
    message = client.messages.create(
        model=settings.llm_model,
        max_tokens=settings.llm_max_tokens,
        system=load_prompt(prompt_name, **variables),
        messages=[{"role": "user", "content": user_input}],
    )
    latency_ms = int((time.perf_counter() - start) * 1000)

    log.info(
        "llm_call prompt=%s model=%s input_tokens=%d output_tokens=%d latency_ms=%d",
        prompt_name,
        settings.llm_model,
        message.usage.input_tokens,
        message.usage.output_tokens,
        latency_ms,
    )
    return "".join(block.text for block in message.content if block.type == "text")
