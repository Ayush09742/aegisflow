import hashlib
import secrets


def generate_api_key() -> str:
    random_part = secrets.token_urlsafe(32)

    return f"af_{random_part}"


def hash_api_key(api_key: str) -> str:
    return hashlib.sha256(
        api_key.encode("utf-8")
    ).hexdigest()