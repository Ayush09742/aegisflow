from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_user
from app.core.database import get_db
from app.models.api_key import APIKey
from app.models.user import User
from app.schemas.api_key import (
    APIKeyCreate,
    APIKeyCreateResponse,
    APIKeyListResponse
)
from app.services.api_key_service import (
    generate_api_key,
    hash_api_key
)


router = APIRouter(
    prefix="/v1/user/keys",
    tags=["User API Keys"]
)


@router.post(
    "",
    response_model=APIKeyCreateResponse,
    status_code=status.HTTP_201_CREATED
)
def create_user_api_key(
    request: APIKeyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    raw_api_key = generate_api_key()

    key_record = APIKey(
        user_id=current_user.id,
        name=request.name,
        key_hash=hash_api_key(raw_api_key),
        is_active=True,
        rate_limit=request.rate_limit,
        monthly_budget_usd=request.monthly_budget_usd,
        is_admin=False
    )

    db.add(key_record)
    db.commit()
    db.refresh(key_record)

    return {
        "id": key_record.id,
        "name": key_record.name,
        "api_key": raw_api_key,
        "rate_limit": key_record.rate_limit,
        "monthly_budget_usd": key_record.monthly_budget_usd,
        "is_active": key_record.is_active
    }


@router.get(
    "",
    response_model=list[APIKeyListResponse]
)
def list_user_api_keys(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    api_keys = (
        db.query(APIKey)
        .filter(
            APIKey.user_id == current_user.id
        )
        .order_by(APIKey.id.asc())
        .all()
    )

    return [
        {
            "id": api_key.id,
            "name": api_key.name,
            "rate_limit": api_key.rate_limit,
            "monthly_budget_usd": api_key.monthly_budget_usd,
            "is_active": api_key.is_active,
            "is_admin": api_key.is_admin
        }
        for api_key in api_keys
    ]


@router.delete(
    "/{key_id}"
)
def revoke_user_api_key(
    key_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    api_key = (
        db.query(APIKey)
        .filter(
            APIKey.id == key_id,
            APIKey.user_id == current_user.id
        )
        .first()
    )

    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )

    api_key.is_active = False

    db.commit()
    db.refresh(api_key)

    return {
        "message": "API key revoked successfully",
        "id": api_key.id,
        "name": api_key.name,
        "is_active": api_key.is_active
    }