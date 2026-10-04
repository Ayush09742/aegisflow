from cryptography.fernet import Fernet
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.provider_credential import ProviderCredential


def get_encryption_key() -> bytes:
    return settings.provider_credential_encryption_key.encode(
        "utf-8"
    )


def encrypt_api_key(api_key: str) -> str:
    fernet = Fernet(get_encryption_key())

    encrypted = fernet.encrypt(
        api_key.encode("utf-8")
    )

    return encrypted.decode("utf-8")


def decrypt_api_key(
    encrypted_api_key: str
) -> str:
    fernet = Fernet(get_encryption_key())

    decrypted = fernet.decrypt(
        encrypted_api_key.encode("utf-8")
    )

    return decrypted.decode("utf-8")


def get_provider_credential(
    db: Session,
    user_id: int,
    provider: str
) -> ProviderCredential | None:

    provider_name = provider.lower().strip()

    return (
        db.query(ProviderCredential)
        .filter(
            ProviderCredential.user_id == user_id,
            ProviderCredential.provider == provider_name,
            ProviderCredential.is_active.is_(True)
        )
        .first()
    )


def get_decrypted_provider_api_key(
    db: Session,
    user_id: int,
    provider: str
) -> str | None:

    credential = get_provider_credential(
        db,
        user_id,
        provider
    )

    if credential is None:
        return None

    return decrypt_api_key(
        credential.encrypted_api_key
    )