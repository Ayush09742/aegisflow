import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.password_reset_token import PasswordResetToken
from app.models.user import User


RESET_TOKEN_EXPIRE_MINUTES = 15


def create_password_reset_token(
    db: Session,
    user: User,
) -> str:
    # Invalidate any existing unused reset tokens.
    now = datetime.now(timezone.utc)

    existing_tokens = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.used_at.is_(None),
            PasswordResetToken.expires_at > now,
        )
        .all()
    )

    for token in existing_tokens:
        token.used_at = now

    # Generate a cryptographically secure random token.
    raw_token = secrets.token_urlsafe(32)

    # Store only the SHA-256 hash.
    token_hash = hashlib.sha256(
        raw_token.encode("utf-8")
    ).hexdigest()

    expires_at = now + timedelta(
        minutes=RESET_TOKEN_EXPIRE_MINUTES
    )

    reset_token = PasswordResetToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
    )

    db.add(reset_token)
    db.commit()

    return raw_token