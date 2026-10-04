from datetime import datetime, timezone

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_user
from app.core.database import get_db
from app.models.provider_credential import ProviderCredential
from app.models.user import User
from app.providers.openrouter import OpenRouterProvider
from app.schemas.provider import (
    ProviderConnectionTestRequest,
    ProviderConnectionTestResponse,
    ProviderCredentialCreateRequest,
    ProviderCredentialResponse,
)
from app.services.provider_credential_service import encrypt_api_key


router = APIRouter(
    prefix="/v1/user/providers",
    tags=["User Providers"]
)


@router.post(
    "/test",
    response_model=ProviderConnectionTestResponse
)
def test_provider_connection(
    request: ProviderConnectionTestRequest,
    current_user: User = Depends(get_current_user)
):
    provider_name = request.provider.lower().strip()

    if provider_name != "openrouter":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported provider: {provider_name}"
        )

    api_key = request.api_key.get_secret_value()

    try:
        provider = OpenRouterProvider(
            api_key=api_key
        )

        provider.test_connection()

        return {
            "provider": provider_name,
            "connected": True,
            "message": "Provider connection successful"
        }

    except Exception:
        return {
            "provider": provider_name,
            "connected": False,
            "message": "Unable to connect to provider"
        }


@router.post(
    "",
    response_model=ProviderCredentialResponse,
    status_code=status.HTTP_201_CREATED
)
def save_provider_credential(
    request: ProviderCredentialCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    provider_name = request.provider.lower().strip()

    if provider_name != "openrouter":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported provider: {provider_name}"
        )

    api_key = request.api_key.get_secret_value()

    # Validate the provider key before saving it.
    try:
        provider = OpenRouterProvider(
            api_key=api_key
        )

        provider.test_connection()

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to validate provider credentials"
        )

    existing_credential = (
        db.query(ProviderCredential)
        .filter(
            ProviderCredential.user_id == current_user.id,
            ProviderCredential.provider == provider_name
        )
        .first()
    )

    encrypted_key = encrypt_api_key(api_key)

    if existing_credential:
        existing_credential.encrypted_api_key = encrypted_key
        existing_credential.is_active = True
        existing_credential.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(existing_credential)

        return existing_credential

    credential = ProviderCredential(
        user_id=current_user.id,
        provider=provider_name,
        encrypted_api_key=encrypted_key,
        is_active=True
    )

    db.add(credential)
    db.commit()
    db.refresh(credential)

    return credential


@router.get(
    "",
    response_model=list[ProviderCredentialResponse]
)
def list_provider_credentials(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    credentials = (
        db.query(ProviderCredential)
        .filter(
            ProviderCredential.user_id == current_user.id
        )
        .order_by(
            ProviderCredential.created_at.desc()
        )
        .all()
    )

    return credentials


@router.delete(
    "/{provider}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_provider_credential(
    provider: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    provider_name = provider.lower().strip()

    credential = (
        db.query(ProviderCredential)
        .filter(
            ProviderCredential.user_id == current_user.id,
            ProviderCredential.provider == provider_name
        )
        .first()
    )

    if credential is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Provider credential not found"
        )

    db.delete(credential)
    db.commit()

    return None