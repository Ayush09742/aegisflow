from dataclasses import dataclass
import secrets

import httpx

from app.core.config import settings
from app.core.redis import redis_client


OAUTH_STATE_TTL_SECONDS = 300
OAUTH_EXCHANGE_TTL_SECONDS = 60

GOOGLE_AUTHORIZATION_URL = (
    "https://accounts.google.com/o/oauth2/v2/auth"
)

GOOGLE_TOKEN_URL = (
    "https://oauth2.googleapis.com/token"
)

GOOGLE_USERINFO_URL = (
    "https://openidconnect.googleapis.com/v1/userinfo"
)

GITHUB_AUTHORIZATION_URL = (
    "https://github.com/login/oauth/authorize"
)

GITHUB_TOKEN_URL = (
    "https://github.com/login/oauth/access_token"
)

GITHUB_USER_URL = (
    "https://api.github.com/user"
)

GITHUB_EMAILS_URL = (
    "https://api.github.com/user/emails"
)


@dataclass
class OAuthIdentity:
    provider: str
    provider_user_id: str
    email: str
    name: str


def create_oauth_state(provider: str) -> str:
    state = secrets.token_urlsafe(32)

    redis_client.setex(
        f"aegisflow:oauth:state:{state}",
        OAUTH_STATE_TTL_SECONDS,
        provider
    )

    return state


def consume_oauth_state(
    state: str,
    provider: str
) -> bool:
    key = f"aegisflow:oauth:state:{state}"

    stored_provider = redis_client.get(key)

    if stored_provider is None:
        return False

    if stored_provider != provider:
        return False

    redis_client.delete(key)

    return True


def create_oauth_exchange_code(user_id: int) -> str:
    code = secrets.token_urlsafe(32)

    redis_client.setex(
        f"aegisflow:oauth:exchange:{code}",
        OAUTH_EXCHANGE_TTL_SECONDS,
        str(user_id)
    )

    return code


def consume_oauth_exchange_code(
    code: str
) -> int | None:
    key = f"aegisflow:oauth:exchange:{code}"

    user_id = redis_client.get(key)

    if user_id is None:
        return None

    redis_client.delete(key)

    return int(user_id)


def get_google_authorization_url(
    state: str
) -> str:
    from urllib.parse import urlencode

    params = {
        "client_id": settings.google_client_id,
        "redirect_uri": (
            "http://127.0.0.1:8000"
            "/v1/auth/google/callback"
        ),
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "access_type": "online",
        "prompt": "select_account",
    }

    return (
        f"{GOOGLE_AUTHORIZATION_URL}?"
        f"{urlencode(params)}"
    )


def get_github_authorization_url(
    state: str
) -> str:
    from urllib.parse import urlencode

    params = {
        "client_id": settings.github_client_id,
        "redirect_uri": (
            "http://127.0.0.1:8000"
            "/v1/auth/github/callback"
        ),
        "scope": "user:email",
        "state": state,
    }

    return (
        f"{GITHUB_AUTHORIZATION_URL}?"
        f"{urlencode(params)}"
    )


def exchange_google_code(
    code: str
) -> OAuthIdentity:

    response = httpx.post(
        GOOGLE_TOKEN_URL,
        data={
            "code": code,
            "client_id": settings.google_client_id,
            "client_secret": settings.google_client_secret,
            "redirect_uri": (
                "http://127.0.0.1:8000"
                "/v1/auth/google/callback"
            ),
            "grant_type": "authorization_code",
        },
        timeout=10.0,
    )

    if not response.is_success:
        raise ValueError(
            "Google authorization failed"
        )

    token_data = response.json()

    access_token = token_data.get("access_token")

    if not access_token:
        raise ValueError(
            "Google did not return an access token"
        )

    userinfo_response = httpx.get(
        GOOGLE_USERINFO_URL,
        headers={
            "Authorization": (
                f"Bearer {access_token}"
            )
        },
        timeout=10.0,
    )

    if not userinfo_response.is_success:
        raise ValueError(
            "Unable to retrieve Google account"
        )

    userinfo = userinfo_response.json()

    provider_user_id = userinfo.get("sub")
    email = userinfo.get("email")
    email_verified = userinfo.get(
        "email_verified",
        False
    )
    name = userinfo.get("name")

    if not provider_user_id:
        raise ValueError(
            "Google account ID is missing"
        )

    if not email or not email_verified:
        raise ValueError(
            "Google account does not have a verified email"
        )

    if not name:
        name = email.split("@")[0]

    return OAuthIdentity(
        provider="google",
        provider_user_id=str(provider_user_id),
        email=email.lower().strip(),
        name=name[:100],
    )


def exchange_github_code(
    code: str
) -> OAuthIdentity:

    token_response = httpx.post(
        GITHUB_TOKEN_URL,
        data={
            "client_id": settings.github_client_id,
            "client_secret": settings.github_client_secret,
            "code": code,
            "redirect_uri": (
                "http://127.0.0.1:8000"
                "/v1/auth/github/callback"
            ),
        },
        headers={
            "Accept": "application/json",
        },
        timeout=10.0,
    )

    if not token_response.is_success:
        raise ValueError(
            "GitHub authorization failed"
        )

    token_data = token_response.json()

    access_token = token_data.get("access_token")

    if not access_token:
        raise ValueError(
            "GitHub did not return an access token"
        )

    api_headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": (
            f"Bearer {access_token}"
        ),
        "X-GitHub-Api-Version": "2022-11-28",
    }

    user_response = httpx.get(
        GITHUB_USER_URL,
        headers=api_headers,
        timeout=10.0,
    )

    if not user_response.is_success:
        raise ValueError(
            "Unable to retrieve GitHub account"
        )

    github_user = user_response.json()

    provider_user_id = github_user.get("id")

    if not provider_user_id:
        raise ValueError(
            "GitHub account ID is missing"
        )

    email = github_user.get("email")

    if not email:
        emails_response = httpx.get(
            GITHUB_EMAILS_URL,
            headers=api_headers,
            timeout=10.0,
        )

        if not emails_response.is_success:
            raise ValueError(
                "Unable to retrieve GitHub email"
            )

        emails = emails_response.json()

        verified_primary = next(
            (
                item
                for item in emails
                if item.get("primary")
                and item.get("verified")
                and item.get("email")
            ),
            None,
        )

        if verified_primary:
            email = verified_primary["email"]

    if not email:
        raise ValueError(
            "GitHub account does not have "
            "a usable email address"
        )

    name = (
        github_user.get("name")
        or github_user.get("login")
        or email.split("@")[0]
    )

    return OAuthIdentity(
        provider="github",
        provider_user_id=str(provider_user_id),
        email=email.lower().strip(),
        name=name[:100],
    )