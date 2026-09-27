from unittest.mock import Mock, patch

from fastapi import HTTPException
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import get_db
from app.api.dependencies.auth import require_admin


client = TestClient(app)


def create_mock_admin():
    mock_admin = Mock()

    mock_admin.id = 1
    mock_admin.is_admin = True

    return mock_admin


def create_mock_db():
    mock_db = Mock()

    mock_db.refresh.side_effect = (
        lambda obj: setattr(
            obj,
            "id",
            99
        )
    )

    return mock_db


def test_create_api_key_success():

    mock_admin = create_mock_admin()
    mock_db = create_mock_db()

    app.dependency_overrides[
        require_admin
    ] = lambda: mock_admin

    app.dependency_overrides[
        get_db
    ] = lambda: mock_db

    try:

        with patch(
            "app.api.routes.api_keys.generate_api_key"
        ) as mock_generate:

            mock_generate.return_value = (
                "af_test_generated_key"
            )

            with patch(
                "app.api.routes.api_keys.hash_api_key"
            ) as mock_hash:

                mock_hash.return_value = (
                    "test_hash"
                )

                response = client.post(
                    "/v1/keys",
                    json={
                        "name": "test-client",
                        "rate_limit": 20,
                        "monthly_budget_usd": 5
                    }
                )

    finally:

        app.dependency_overrides.clear()

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == 99

    assert data["name"] == "test-client"

    assert data["api_key"] == (
        "af_test_generated_key"
    )

    assert data["rate_limit"] == 20

    assert data["monthly_budget_usd"] == 5

    assert data["is_active"] is True

    mock_generate.assert_called_once()

    mock_hash.assert_called_once_with(
        "af_test_generated_key"
    )

    mock_db.add.assert_called_once()

    created_key = mock_db.add.call_args[0][0]

    assert created_key.name == "test-client"

    assert created_key.key_hash == "test_hash"

    assert created_key.rate_limit == 20

    assert created_key.monthly_budget_usd == 5

    assert created_key.is_active is True

    assert created_key.is_admin is False


def test_create_api_key_forbidden():

    def override_admin():

        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    app.dependency_overrides[
        require_admin
    ] = override_admin

    try:

        response = client.post(
            "/v1/keys",
            json={
                "name": "test-client",
                "rate_limit": 20
            }
        )

    finally:

        app.dependency_overrides.clear()

    assert response.status_code == 403

    assert response.json()["detail"] == (
        "Admin access required"
    )


def test_create_api_key_default_rate_limit():

    mock_admin = create_mock_admin()
    mock_db = create_mock_db()

    app.dependency_overrides[
        require_admin
    ] = lambda: mock_admin

    app.dependency_overrides[
        get_db
    ] = lambda: mock_db

    try:

        with patch(
            "app.api.routes.api_keys.generate_api_key"
        ) as mock_generate:

            mock_generate.return_value = (
                "af_test_default_key"
            )

            with patch(
                "app.api.routes.api_keys.hash_api_key"
            ) as mock_hash:

                mock_hash.return_value = (
                    "default_hash"
                )

                response = client.post(
                    "/v1/keys",
                    json={
                        "name": "default-client"
                    }
                )

    finally:

        app.dependency_overrides.clear()

    assert response.status_code == 200

    data = response.json()

    assert data["rate_limit"] == 10

    assert data["monthly_budget_usd"] is None

    created_key = mock_db.add.call_args[0][0]

    assert created_key.rate_limit == 10

    assert created_key.monthly_budget_usd is None


def test_revoke_api_key_success():

    mock_admin = create_mock_admin()
    mock_db = create_mock_db()

    mock_key = Mock()

    mock_key.id = 99
    mock_key.name = "test-client"
    mock_key.is_active = True

    mock_db.query.return_value.filter.return_value.first.return_value = (
        mock_key
    )

    app.dependency_overrides[
        require_admin
    ] = lambda: mock_admin

    app.dependency_overrides[
        get_db
    ] = lambda: mock_db

    try:

        response = client.delete(
            "/v1/keys/99"
        )

    finally:

        app.dependency_overrides.clear()

    assert response.status_code == 200

    data = response.json()

    assert data["message"] == (
        "API key revoked successfully"
    )

    assert data["id"] == 99

    assert data["name"] == "test-client"

    assert data["is_active"] is False

    assert mock_key.is_active is False

    mock_db.commit.assert_called_once()


def test_revoke_api_key_not_found():

    mock_admin = create_mock_admin()
    mock_db = create_mock_db()

    mock_db.query.return_value.filter.return_value.first.return_value = (
        None
    )

    app.dependency_overrides[
        require_admin
    ] = lambda: mock_admin

    app.dependency_overrides[
        get_db
    ] = lambda: mock_db

    try:

        response = client.delete(
            "/v1/keys/999"
        )

    finally:

        app.dependency_overrides.clear()

    assert response.status_code == 404

    assert response.json()["detail"] == (
        "API key not found"
    )


def test_revoke_api_key_forbidden():

    def override_admin():

        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    app.dependency_overrides[
        require_admin
    ] = override_admin

    try:

        response = client.delete(
            "/v1/keys/99"
        )

    finally:

        app.dependency_overrides.clear()

    assert response.status_code == 403

    assert response.json()["detail"] == (
        "Admin access required"
    )