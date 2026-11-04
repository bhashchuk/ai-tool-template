from typing import Annotated, Any

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .auth import current_user
from .config import get_settings
from .llm import complete

app = FastAPI(title="Tool backend")

_origins = [o.strip() for o in get_settings().allowed_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


# Example endpoint. Replace with the tool's real endpoints, and keep the auth dependency.
class SummarizeIn(BaseModel):
    text: str = Field(min_length=1, max_length=20_000)


class SummarizeOut(BaseModel):
    summary: str


@app.post("/summarize", response_model=SummarizeOut)
def summarize(
    body: SummarizeIn,
    _user: Annotated[dict[str, Any], Depends(current_user)],
) -> SummarizeOut:
    return SummarizeOut(summary=complete("example", body.text))
