from app.services.provider_credential_service import (
    encrypt_api_key,
    decrypt_api_key,
)


def test_encrypt_and_decrypt_api_key():

    original_key = "test-provider-api-key-123"

    encrypted_key = encrypt_api_key(
        original_key
    )

    assert encrypted_key != original_key

    decrypted_key = decrypt_api_key(
        encrypted_key
    )

    assert decrypted_key == original_key