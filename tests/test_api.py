from unittest.mock import Mock, patch

from fastapi import HTTPException
from fastapi.testclient import TestClient

from app.providers.base import AIResponse

from app.main import app

from app.core.database import get_db

from app.api.dependencies.auth import authenticate_api_key


client = TestClient(app)


TEST_API_KEY = "af_test_api_key"


def create_mock_api_key():

    mock_api_key = Mock()

    mock_api_key.id = 1
    mock_api_key.rate_limit = 10

    return mock_api_key


def create_mock_db():

    return Mock()


def test_chat_missing_api_key():

    response = client.post(
        "/v1/chat",
        json={
            "prompt": "Hello AegisFlow"
        }
    )

    assert response.status_code == 401

    assert response.json()["detail"] == (
        "Missing AegisFlow API key"
    )


def test_chat_invalid_api_key():

    def override_auth():

        raise HTTPException(
            status_code=401,
            detail="Invalid or inactive AegisFlow API key"
        )

    app.dependency_overrides[
        authenticate_api_key
    ] = override_auth

    try:

        response = client.post(
            "/v1/chat",
            headers={
                "X-AegisFlow-Key": "invalid-key"
            },
            json={
                "prompt": "Hello AegisFlow"
            }
        )

    finally:

        app.dependency_overrides.clear()

    assert response.status_code == 401

    assert response.json()["detail"] == (
        "Invalid or inactive AegisFlow API key"
    )


def test_chat_success():

    mock_api_key = create_mock_api_key()

    mock_db = create_mock_db()

    mock_db.refresh.side_effect = (
        lambda obj: setattr(
            obj,
            "request_id",
            "test-request-id"
        )
    )

    app.dependency_overrides[
        authenticate_api_key
    ] = lambda: mock_api_key

    app.dependency_overrides[
        get_db
    ] = lambda: mock_db

    try:

        with patch(
            "app.api.routes.chat.check_budget"
        ) as mock_check_budget:

            mock_check_budget.return_value = None

            with patch(
                "app.api.routes.chat.generate_response"
            ) as mock_generate:

                mock_generate.return_value = AIResponse(
                    content="Hello from AegisFlow",
                    prompt_tokens=10,
                    completion_tokens=20,
                    total_tokens=30,
                    cost_usd=0.001
                )

                with patch(
                    "app.api.routes.chat.get_cached_response"
                ) as mock_cache:

                    mock_cache.return_value = None

                    with patch(
                        "app.api.routes.chat.cache_response"
                    ):

                        response = client.post(
                            "/v1/chat",
                            headers={
                                "X-AegisFlow-Key": TEST_API_KEY
                            },
                            json={
                                "prompt": "Hello AegisFlow"
                            }
                        )

    finally:

        app.dependency_overrides.clear()

    assert response.status_code == 200

    data = response.json()

    assert data["response"] == (
        "Hello from AegisFlow"
    )

    assert data["model"] == "openrouter/free"

    assert data["provider"] == "openrouter"

    assert data["request_id"] == (
        "test-request-id"
    )

    assert "latency_ms" in data

    mock_check_budget.assert_called_once_with(
        mock_db,
        mock_api_key
    )


def test_chat_provider_failure():

    mock_api_key = create_mock_api_key()

    mock_db = create_mock_db()

    app.dependency_overrides[
        authenticate_api_key
    ] = lambda: mock_api_key

    app.dependency_overrides[
        get_db
    ] = lambda: mock_db

    try:

        with patch(
            "app.api.routes.chat.check_budget"
        ) as mock_check_budget:

            mock_check_budget.return_value = None

            with patch(
                "app.api.routes.chat.generate_response"
            ) as mock_generate:

                mock_generate.side_effect = Exception(
                    "Test provider failure"
                )

                with patch(
                    "app.api.routes.chat.get_cached_response"
                ) as mock_cache:

                    mock_cache.return_value = None

                    response = client.post(
                        "/v1/chat",
                        headers={
                            "X-AegisFlow-Key": TEST_API_KEY
                        },
                        json={
                            "prompt": "Test failure"
                        }
                    )

    finally:

        app.dependency_overrides.clear()

    assert response.status_code == 502

    assert response.json()["detail"] == (
        "AI provider request failed"
    )

    mock_check_budget.assert_called_once_with(
        mock_db,
        mock_api_key
    )

def test_chat_budget_exceeded():

    mock_api_key = create_mock_api_key()

    mock_db = create_mock_db()

    app.dependency_overrides[
        authenticate_api_key
    ] = lambda: mock_api_key

    app.dependency_overrides[
        get_db
    ] = lambda: mock_db

    try:

        with patch(
            "app.api.routes.chat.check_budget"
        ) as mock_check_budget:

            mock_check_budget.side_effect = ValueError(
                "Monthly AI budget exceeded"
            )

            with patch(
                "app.api.routes.chat.generate_response"
            ) as mock_generate:

                response = client.post(
                    "/v1/chat",
                    headers={
                        "X-AegisFlow-Key": TEST_API_KEY
                    },
                    json={
                        "prompt": "This should be blocked"
                    }
                )

    finally:

        app.dependency_overrides.clear()

    assert response.status_code == 429

    assert response.json()["detail"] == (
        "Monthly AI budget exceeded"
    )

    mock_check_budget.assert_called_once_with(
        mock_db,
        mock_api_key
    )

    mock_generate.assert_not_called()