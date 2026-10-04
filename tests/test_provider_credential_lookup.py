from unittest.mock import MagicMock

from app.services.provider_credential_service import (
    encrypt_api_key,
    get_decrypted_provider_api_key,
)


def test_get_decrypted_provider_api_key():
    original_key = "test-openrouter-key"

    encrypted_key = encrypt_api_key(
        original_key
    )

    credential = MagicMock()
    credential.encrypted_api_key = encrypted_key
    credential.is_active = True

    query = MagicMock()
    query.filter.return_value.first.return_value = credential

    db = MagicMock()
    db.query.return_value = query

    result = get_decrypted_provider_api_key(
        db,
        user_id=3,
        provider="openrouter"
    )

    assert result == original_key


def test_get_decrypted_provider_api_key_when_missing():
    query = MagicMock()
    query.filter.return_value.first.return_value = None

    db = MagicMock()
    db.query.return_value = query

    result = get_decrypted_provider_api_key(
        db,
        user_id=999,
        provider="openrouter"
    )

    assert result is None