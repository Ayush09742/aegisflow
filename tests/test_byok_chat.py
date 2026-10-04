from unittest.mock import Mock, patch

from fastapi.testclient import TestClient

from app.main import app
from app.core.database import get_db
from app.api.dependencies.auth import authenticate_api_key
from app.providers.base import AIResponse


client = TestClient(app)


def test_chat_uses_user_byok_credential():
    # ---------------------------------------------------------
    # Mock user-owned AegisFlow API key
    # ---------------------------------------------------------

    mock_api_key = Mock()

    mock_api_key.id = 4
    mock_api_key.user_id = 3
    mock_api_key.rate_limit = 10
    mock_api_key.monthly_budget_usd = 5
    mock_api_key.is_active = True

    # ---------------------------------------------------------
    # Mock database
    # ---------------------------------------------------------

    mock_db = Mock()

    mock_db.refresh.side_effect = (
        lambda obj: None
    )

    # ---------------------------------------------------------
    # Override authentication + database
    # ---------------------------------------------------------

    app.dependency_overrides[
        authenticate_api_key
    ] = lambda: mock_api_key

    app.dependency_overrides[
        get_db
    ] = lambda: mock_db

    try:

        with patch(
            "app.api.routes.chat.check_budget"
        ) as mock_check_budget, patch(
            "app.api.routes.chat.get_provider_credential"
        ) as mock_get_credential, patch(
            "app.api.routes.chat.get_decrypted_provider_api_key"
        ) as mock_get_decrypted_key, patch(
            "app.api.routes.chat.get_cached_response"
        ) as mock_cache_get, patch(
            "app.api.routes.chat.cache_response"
        ) as mock_cache_set, patch(
            "app.api.routes.chat.generate_response"
        ) as mock_generate:

            # -------------------------------------------------
            # Configure mocks
            # -------------------------------------------------

            mock_check_budget.return_value = None

            mock_credential = Mock()
            mock_credential.id = 1
            mock_credential.updated_at = Mock()
            mock_credential.updated_at.isoformat.return_value = (
                "2026-10-01T21:35:55+05:30"
            )

            mock_get_credential.return_value = (
                mock_credential
            )

            mock_get_decrypted_key.return_value = (
                "test-user-openrouter-key"
            )

            mock_cache_get.return_value = None

            mock_generate.return_value = AIResponse(
                content="BYOK response",
                prompt_tokens=10,
                completion_tokens=5,
                total_tokens=15,
                cost_usd=0.001
            )

            # -------------------------------------------------
            # Execute request
            # -------------------------------------------------

            response = client.post(
                "/v1/chat",
                headers={
                    "X-AegisFlow-Key": "test-aegisflow-key"
                },
                json={
                    "prompt": "Test BYOK routing"
                }
            )

            # -------------------------------------------------
            # Assertions
            # -------------------------------------------------

            assert response.status_code == 200

            data = response.json()

            assert data["response"] == (
                "BYOK response"
            )

            assert data["model"] == (
                "openrouter/free"
            )

            assert data["provider"] == (
                "openrouter"
            )

            # Budget was checked.
            mock_check_budget.assert_called_once_with(
                mock_db,
                mock_api_key
            )

            # Correct user's credential was requested.
            mock_get_credential.assert_called_once_with(
                mock_db,
                user_id=3,
                provider="openrouter"
            )

            # Credential was decrypted for user 3.
            mock_get_decrypted_key.assert_called_once_with(
                mock_db,
                user_id=3,
                provider="openrouter"
            )

            # -------------------------------------------------
            # MOST IMPORTANT ASSERTION
            # -------------------------------------------------
            #
            # The decrypted BYOK key must actually reach
            # generate_response().
            # -------------------------------------------------

            mock_generate.assert_called_once_with(
                "Test BYOK routing",
                "openrouter/free",
                "test-user-openrouter-key"
            )

            # Response should be cached.
            mock_cache_set.assert_called_once()

    finally:

        app.dependency_overrides.clear()

def test_chat_without_byok_uses_platform_provider():
    # ---------------------------------------------------------
    # Mock API key without a user
    # ---------------------------------------------------------

    mock_api_key = Mock()

    mock_api_key.id = 1
    mock_api_key.user_id = None
    mock_api_key.rate_limit = 10
    mock_api_key.monthly_budget_usd = 5
    mock_api_key.is_active = True

    # ---------------------------------------------------------
    # Mock database
    # ---------------------------------------------------------

    mock_db = Mock()

    mock_db.refresh.side_effect = (
        lambda obj: None
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
        ) as mock_check_budget, patch(
            "app.api.routes.chat.get_provider_credential"
        ) as mock_get_credential, patch(
            "app.api.routes.chat.generate_response"
        ) as mock_generate, patch(
            "app.api.routes.chat.get_cached_response"
        ) as mock_cache_get, patch(
            "app.api.routes.chat.cache_response"
        ) as mock_cache_set:

            mock_check_budget.return_value = None

            mock_cache_get.return_value = None

            mock_generate.return_value = AIResponse(
                content="Platform response",
                prompt_tokens=10,
                completion_tokens=5,
                total_tokens=15,
                cost_usd=0.001
            )

            response = client.post(
                "/v1/chat",
                headers={
                    "X-AegisFlow-Key": "test-platform-key"
                },
                json={
                    "prompt": "Test platform provider"
                }
            )

            assert response.status_code == 200

            data = response.json()

            assert data["response"] == (
                "Platform response"
            )

            # Budget still checked.
            mock_check_budget.assert_called_once_with(
                mock_db,
                mock_api_key
            )

            # No user means no BYOK lookup.
            mock_get_credential.assert_not_called()

            # -------------------------------------------------
            # MOST IMPORTANT ASSERTION
            # -------------------------------------------------
            #
            # Platform-managed flow keeps the old signature.
            # -------------------------------------------------

            mock_generate.assert_called_once_with(
                "Test platform provider"
            )

            mock_cache_set.assert_called_once()

    finally:

        app.dependency_overrides.clear()

def test_chat_fails_when_byok_credential_cannot_be_decrypted():
    # ---------------------------------------------------------
    # Mock user-owned API key
    # ---------------------------------------------------------

    mock_api_key = Mock()

    mock_api_key.id = 4
    mock_api_key.user_id = 3
    mock_api_key.rate_limit = 10
    mock_api_key.monthly_budget_usd = 5
    mock_api_key.is_active = True

    mock_db = Mock()

    app.dependency_overrides[
        authenticate_api_key
    ] = lambda: mock_api_key

    app.dependency_overrides[
        get_db
    ] = lambda: mock_db

    try:

        with patch(
            "app.api.routes.chat.check_budget"
        ) as mock_check_budget, patch(
            "app.api.routes.chat.get_provider_credential"
        ) as mock_get_credential, patch(
            "app.api.routes.chat.get_decrypted_provider_api_key"
        ) as mock_get_decrypted_key, patch(
            "app.api.routes.chat.generate_response"
        ) as mock_generate:

            mock_check_budget.return_value = None

            mock_credential = Mock()
            mock_credential.id = 1
            mock_credential.updated_at = Mock()
            mock_credential.updated_at.isoformat.return_value = (
                "2026-10-01T21:35:55+05:30"
            )

            mock_get_credential.return_value = (
                mock_credential
            )

            # Simulate corrupted/invalid encrypted credential.
            mock_get_decrypted_key.side_effect = Exception(
                "Invalid encrypted provider credential"
            )

            response = client.post(
                "/v1/chat",
                headers={
                    "X-AegisFlow-Key": "test-byok-key"
                },
                json={
                    "prompt": "Test corrupted BYOK credential"
                }
            )

            assert response.status_code == 500

            assert response.json()["detail"] == (
                "Unable to load provider credentials"
            )

            # Provider must NEVER be called.
            mock_generate.assert_not_called()

            mock_check_budget.assert_called_once_with(
                mock_db,
                mock_api_key
            )

            mock_get_decrypted_key.assert_called_once_with(
                mock_db,
                user_id=3,
                provider="openrouter"
            )

    finally:

        app.dependency_overrides.clear()

def test_byok_cache_isolation_between_users():
    mock_db = Mock()

    mock_api_key_user_1 = Mock()
    mock_api_key_user_1.id = 10
    mock_api_key_user_1.user_id = 3
    mock_api_key_user_1.rate_limit = 10
    mock_api_key_user_1.monthly_budget_usd = 5
    mock_api_key_user_1.is_active = True

    mock_api_key_user_2 = Mock()
    mock_api_key_user_2.id = 11
    mock_api_key_user_2.user_id = 4
    mock_api_key_user_2.rate_limit = 10
    mock_api_key_user_2.monthly_budget_usd = 5
    mock_api_key_user_2.is_active = True

    credential_user_1 = Mock()
    credential_user_1.id = 1
    credential_user_1.updated_at.isoformat.return_value = (
        "2026-10-01T21:35:55+05:30"
    )

    credential_user_2 = Mock()
    credential_user_2.id = 2
    credential_user_2.updated_at.isoformat.return_value = (
        "2026-10-01T21:35:55+05:30"
    )

    app.dependency_overrides[get_db] = lambda: mock_db

    try:
        with patch(
            "app.api.routes.chat.check_budget"
        ) as mock_check_budget, patch(
            "app.api.routes.chat.get_provider_credential"
        ) as mock_get_credential, patch(
            "app.api.routes.chat.get_decrypted_provider_api_key"
        ) as mock_get_decrypted_key, patch(
            "app.api.routes.chat.get_cached_response"
        ) as mock_get_cache, patch(
            "app.api.routes.chat.cache_response"
        ), patch(
            "app.api.routes.chat.generate_response"
        ) as mock_generate:

            mock_check_budget.return_value = None
            mock_get_cache.return_value = None

            def credential_lookup(db, user_id, provider):
                if user_id == 3:
                    return credential_user_1
                if user_id == 4:
                    return credential_user_2
                return None

            mock_get_credential.side_effect = credential_lookup

            def decrypted_key_lookup(db, user_id, provider):
                return {
                    3: "user-1-openrouter-key",
                    4: "user-2-openrouter-key",
                }[user_id]

            mock_get_decrypted_key.side_effect = decrypted_key_lookup

            mock_generate.side_effect = [
                AIResponse(
                    content="Response for user 1",
                    prompt_tokens=10,
                    completion_tokens=10,
                    total_tokens=20,
                    cost_usd=0.001,
                ),
                AIResponse(
                    content="Response for user 2",
                    prompt_tokens=10,
                    completion_tokens=10,
                    total_tokens=20,
                    cost_usd=0.001,
                ),
            ]

            app.dependency_overrides[
                authenticate_api_key
            ] = lambda: mock_api_key_user_1

            response_1 = client.post(
                "/v1/chat",
                headers={
                    "X-AegisFlow-Key": "user-1-key"
                },
                json={
                    "prompt": "Same prompt for both users"
                },
            )

            assert response_1.status_code == 200
            assert response_1.json()["response"] == "Response for user 1"

            app.dependency_overrides[
                authenticate_api_key
            ] = lambda: mock_api_key_user_2

            response_2 = client.post(
                "/v1/chat",
                headers={
                    "X-AegisFlow-Key": "user-2-key"
                },
                json={
                    "prompt": "Same prompt for both users"
                },
            )

            assert response_2.status_code == 200
            assert response_2.json()["response"] == "Response for user 2"

            assert mock_generate.call_count == 2

            first_cache_scope = mock_get_cache.call_args_list[0].args[2]
            second_cache_scope = mock_get_cache.call_args_list[1].args[2]

            assert first_cache_scope != second_cache_scope

    finally:
        app.dependency_overrides.clear()