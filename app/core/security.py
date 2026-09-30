from datetime import datetime, timedelta, timezone

import jwt
from pwdlib import PasswordHash

from app.core.config import settings


password_hash = PasswordHash.recommended()

JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = 60


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(
    password: str,
    hashed_password: str
) -> bool:
    return password_hash.verify(
        password,
        hashed_password
    )


def create_access_token(user_id: int) -> str:
    secret = settings.jwt_secret

    if not secret:
        raise RuntimeError(
            "JWT_SECRET environment variable is not configured"
        )

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=JWT_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "exp": expire,
    }

    return jwt.encode(
        payload,
        secret,
        algorithm=JWT_ALGORITHM
    )


def decode_access_token(token: str) -> int:
    secret = settings.jwt_secret

    if not secret:
        raise RuntimeError(
            "JWT_SECRET environment variable is not configured"
        )

    payload = jwt.decode(
        token,
        secret,
        algorithms=[JWT_ALGORITHM]
    )

    user_id = payload.get("sub")

    if not user_id:
        raise ValueError("Invalid access token")

    return int(user_id)