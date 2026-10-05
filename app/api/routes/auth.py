from urllib.parse import urlencode

import secrets
import hashlib
from datetime import datetime, timezone

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from fastapi.responses import RedirectResponse
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)
from app.models.oauth_account import OAuthAccount
from app.models.user import User
from app.schemas.auth import (
    AuthResponse,
    LoginRequest,
    OAuthExchangeRequest,
    SignupRequest,
    UserResponse,
)
from app.services.oauth_service import (
    consume_oauth_exchange_code,
    consume_oauth_state,
    create_oauth_exchange_code,
    create_oauth_state,
    exchange_github_code,
    exchange_google_code,
    get_github_authorization_url,
    get_google_authorization_url,
)
from app.models.password_reset_token import PasswordResetToken

from app.schemas.auth import (
    AuthResponse,
    ForgotPasswordRequest,
    LoginRequest,
    OAuthExchangeRequest,
    ResetPasswordRequest,
    SignupRequest,
    UserResponse,
)

from app.services.password_reset_service import (
    create_password_reset_token,
)
from app.services.email_service import send_password_reset_email


router = APIRouter(
    prefix="/v1/auth",
    tags=["Authentication"]
)

bearer_scheme = HTTPBearer()


def build_auth_response(
    user: User
) -> dict:
    access_token = create_access_token(
        user.id
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "name": user.name,
        "email": user.email,
    }


@router.post(
    "/signup",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED
)
def signup(
    request: SignupRequest,
    db: Session = Depends(get_db)
):
    existing_user = (
        db.query(User)
        .filter(User.email == request.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "An account with this email "
                "already exists"
            )
        )

    user = User(
        name=request.name,
        email=request.email,
        password_hash=hash_password(
            request.password
        ),
        is_active=True
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return build_auth_response(user)


@router.post(
    "/login",
    response_model=AuthResponse
)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.email == request.email)
        .first()
    )

    if not user or not verify_password(
        request.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    return build_auth_response(user)
@router.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(User.email == request.email)
        .first()
    )

    # Always return the same response to avoid
    # revealing whether an email is registered.
    generic_response = {
        "message": (
            "If an account with that email exists, "
            "a password reset link has been sent."
        )
    }

    if not user or not user.is_active:
        return generic_response

    raw_token = create_password_reset_token(
        db=db,
        user=user,
    )

    reset_url = (
        f"{settings.oauth_frontend_url}"
        f"/reset-password?token={raw_token}"
    )

    try:
        send_password_reset_email(
            recipient_email=user.email,
            reset_url=reset_url,
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to send password reset email",
        )

    return generic_response
@router.post("/reset-password")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    token_hash = hashlib.sha256(
        request.token.encode("utf-8")
    ).hexdigest()

    reset_token = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.token_hash == token_hash
        )
        .first()
    )

    if not reset_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token",
        )

    now = datetime.now(timezone.utc)

    if reset_token.used_at is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token",
        )

    if reset_token.expires_at <= now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token",
        )

    user = (
        db.query(User)
        .filter(User.id == reset_token.user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    # Update password using AegisFlow's existing password hashing.
    user.password_hash = hash_password(
        request.new_password
    )

    # Make the reset token single-use.
    reset_token.used_at = now

    db.commit()

    return {
        "message": "Password reset successfully",
    }


@router.get(
    "/google/start"
)
def google_start():
    state = create_oauth_state("google")

    return RedirectResponse(
        url=get_google_authorization_url(state),
        status_code=status.HTTP_302_FOUND,
    )


@router.get(
    "/google/callback"
)
def google_callback(
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    db: Session = Depends(get_db),
):
    if error:
        params = urlencode({
            "error": "Google authorization was cancelled"
        })

        return RedirectResponse(
            url=(
                f"{settings.oauth_frontend_url}"
                f"/oauth/callback?{params}"
            ),
            status_code=status.HTTP_302_FOUND,
        )

    if not code or not state:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Google OAuth parameters"
        )

    if not consume_oauth_state(
        state,
        "google"
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OAuth state"
        )

    try:
        identity = exchange_google_code(code)
    except Exception:
        params = urlencode({
            "error": "Google authentication failed"
        })

        return RedirectResponse(
            url=(
                f"{settings.oauth_frontend_url}"
                f"/oauth/callback?{params}"
            ),
            status_code=status.HTTP_302_FOUND,
        )

    user = (
        db.query(OAuthAccount)
        .filter(
            OAuthAccount.provider == identity.provider,
            OAuthAccount.provider_user_id
            == identity.provider_user_id,
        )
        .first()
    )

    if user:
        existing_user = (
            db.query(User)
            .filter(User.id == user.user_id)
            .first()
        )

        if not existing_user or not existing_user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )

    else:
        existing_user = (
            db.query(User)
            .filter(
                func.lower(User.email)
                == identity.email.lower()
            )
            .first()
        )

        if not existing_user:
            existing_user = User(
                name=identity.name,
                email=identity.email,
                password_hash=hash_password(
                    secrets.token_urlsafe(32)
                ),
                is_active=True,
            )

            db.add(existing_user)
            db.flush()

        elif not existing_user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )

        oauth_account = OAuthAccount(
            user_id=existing_user.id,
            provider=identity.provider,
            provider_user_id=identity.provider_user_id,
            email=identity.email,
        )

        db.add(oauth_account)

        try:
            db.commit()
        except IntegrityError:
            db.rollback()

            oauth_account = (
                db.query(OAuthAccount)
                .filter(
                    OAuthAccount.provider
                    == identity.provider,
                    OAuthAccount.provider_user_id
                    == identity.provider_user_id,
                )
                .first()
            )

            if not oauth_account:
                raise HTTPException(
                    status_code=500,
                    detail="Unable to create OAuth account"
                )

            existing_user = (
                db.query(User)
                .filter(
                    User.id
                    == oauth_account.user_id
                )
                .first()
            )

    exchange_code = create_oauth_exchange_code(
        existing_user.id
    )

    return RedirectResponse(
        url=(
            f"{settings.oauth_frontend_url}"
            f"/oauth/callback?code={exchange_code}"
        ),
        status_code=status.HTTP_302_FOUND,
    )


@router.get(
    "/github/start"
)
def github_start():
    state = create_oauth_state("github")

    return RedirectResponse(
        url=get_github_authorization_url(state),
        status_code=status.HTTP_302_FOUND,
    )


@router.get(
    "/github/callback"
)
def github_callback(
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    db: Session = Depends(get_db),
):
    if error:
        params = urlencode({
            "error": "GitHub authorization was cancelled"
        })

        return RedirectResponse(
            url=(
                f"{settings.oauth_frontend_url}"
                f"/oauth/callback?{params}"
            ),
            status_code=status.HTTP_302_FOUND,
        )

    if not code or not state:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing GitHub OAuth parameters"
        )

    if not consume_oauth_state(
        state,
        "github"
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OAuth state"
        )

    try:
        identity = exchange_github_code(code)
    except Exception:
        params = urlencode({
            "error": "GitHub authentication failed"
        })

        return RedirectResponse(
            url=(
                f"{settings.oauth_frontend_url}"
                f"/oauth/callback?{params}"
            ),
            status_code=status.HTTP_302_FOUND,
        )

    oauth_account = (
        db.query(OAuthAccount)
        .filter(
            OAuthAccount.provider
            == identity.provider,
            OAuthAccount.provider_user_id
            == identity.provider_user_id,
        )
        .first()
    )

    if oauth_account:
        user = (
            db.query(User)
            .filter(
                User.id == oauth_account.user_id
            )
            .first()
        )

        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )

    else:
        user = (
            db.query(User)
            .filter(
                func.lower(User.email)
                == identity.email.lower()
            )
            .first()
        )

        if not user:
            user = User(
                name=identity.name,
                email=identity.email,
                password_hash=hash_password(
                    secrets.token_urlsafe(32)
                ),
                is_active=True,
            )

            db.add(user)
            db.flush()

        elif not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )

        oauth_account = OAuthAccount(
            user_id=user.id,
            provider=identity.provider,
            provider_user_id=identity.provider_user_id,
            email=identity.email,
        )

        db.add(oauth_account)

        try:
            db.commit()
        except IntegrityError:
            db.rollback()

            oauth_account = (
                db.query(OAuthAccount)
                .filter(
                    OAuthAccount.provider
                    == identity.provider,
                    OAuthAccount.provider_user_id
                    == identity.provider_user_id,
                )
                .first()
            )

            if not oauth_account:
                raise HTTPException(
                    status_code=500,
                    detail="Unable to create OAuth account"
                )

            user = (
                db.query(User)
                .filter(
                    User.id == oauth_account.user_id
                )
                .first()
            )

    exchange_code = create_oauth_exchange_code(
        user.id
    )

    return RedirectResponse(
        url=(
            f"{settings.oauth_frontend_url}"
            f"/oauth/callback?code={exchange_code}"
        ),
        status_code=status.HTTP_302_FOUND,
    )


@router.post(
    "/oauth/exchange",
    response_model=AuthResponse
)
def oauth_exchange(
    request: OAuthExchangeRequest,
    db: Session = Depends(get_db),
):
    user_id = consume_oauth_exchange_code(
        request.code
    )

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OAuth code"
        )

    user = (
        db.query(User)
        .filter(
            User.id == user_id,
            User.is_active == True
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )

    return build_auth_response(user)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        bearer_scheme
    ),
    db: Session = Depends(get_db)
) -> User:

    try:
        user_id = decode_access_token(
            credentials.credentials
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token"
        )

    user = (
        db.query(User)
        .filter(
            User.id == user_id,
            User.is_active == True
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )

    return user


@router.get(
    "/me",
    response_model=UserResponse
)
def get_me(
    current_user: User = Depends(get_current_user)
):
    return current_user