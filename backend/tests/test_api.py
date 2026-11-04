import pytest
from fastapi.testclient import TestClient

import app.main as main
from app.auth import current_user
from app.main import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def _clear_overrides() -> None:
    app.dependency_overrides.clear()


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_summarize_requires_auth() -> None:
    response = client.post("/summarize", json={"text": "hello"})
    assert response.status_code == 401


def test_summarize_returns_model_output(monkeypatch: pytest.MonkeyPatch) -> None:
    app.dependency_overrides[current_user] = lambda: {"id": "user-1"}
    monkeypatch.setattr(main, "complete", lambda prompt, text: "a summary")

    response = client.post("/summarize", json={"text": "some long text"})

    assert response.status_code == 200
    assert response.json() == {"summary": "a summary"}


def test_summarize_rejects_empty_text() -> None:
    app.dependency_overrides[current_user] = lambda: {"id": "user-1"}
    response = client.post("/summarize", json={"text": ""})
    assert response.status_code == 422
