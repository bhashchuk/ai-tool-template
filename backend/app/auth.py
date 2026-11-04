"""Supabase auth for backend endpoints.

Validates the caller's access token by asking Supabase Auth who it belongs to.
This costs one HTTP call per request, which is fine for internal tools. Switch to
local JWT verification if latency or load ever matters.
"""

from typing import Annotated, Any

import httpx
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .config import get_settings

_bearer = HTTPBearer(auto_error=False)


def current_user(
    creds: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
) -> dict[str, Any]:
    if creds is None:
        raise HTTPException(status_code=401, detail="Missing bearer token")

    settings = get_settings()
    try:
        response = httpx.get(
            f"{settings.supabase_url}/auth/v1/user",
            headers={
                "Authorization": f"Bearer {creds.credentials}",
                "apikey": settings.supabase_anon_key,
            },
            timeout=5.0,
        )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=503, detail="Auth service unavailable") from exc

    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid token")
    user: dict[str, Any] = response.json()
    return user
