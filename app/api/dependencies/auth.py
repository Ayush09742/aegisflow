import hashlib

from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyHeader
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.api_key import APIKey
from app.services.rate_limiter import check_rate_limit


api_key_header = APIKeyHeader(
    name="X-AegisFlow-Key",
    auto_error=False
)


def authenticate_api_key(
    x_aegisflow_key: str | None = Depends(api_key_header),
    db: Session = Depends(get_db)
):
    if not x_aegisflow_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing AegisFlow API key"
        )

    key_hash = hashlib.sha256(
        x_aegisflow_key.encode("utf-8")
    ).hexdigest()

    api_key = (
        db.query(APIKey)
        .filter(
            APIKey.key_hash == key_hash,
            APIKey.is_active == True
        )
        .first()
    )

    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or inactive AegisFlow API key"
        )

    check_rate_limit(
    api_key.id,
    api_key.rate_limit
)

    return api_key

def require_admin(
    api_key: APIKey = Depends(authenticate_api_key)
):
    if not api_key.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

    return api_key