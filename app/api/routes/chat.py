import time

from uuid import uuid4

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from sqlalchemy.orm import Session

from app.core.logger import get_logger
from app.core.database import get_db

from app.schemas.chat import ChatRequest, ChatResponse

from app.services.budget_service import check_budget

from app.services.ai_service import generate_response

from app.services.cache_service import (
    get_cached_response,
    cache_response
)

from app.services.provider_credential_service import (
    get_provider_credential,
    get_decrypted_provider_api_key
)

from app.models.ai_request import AIRequest

from app.api.dependencies.auth import authenticate_api_key


router = APIRouter(
    prefix="/v1",
    tags=["AI"]
)


logger = get_logger("aegisflow.chat")


@router.post(
    "/chat",
    response_model=ChatResponse
)
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    api_key=Depends(authenticate_api_key)
):
    request_id = str(uuid4())

    logger.info(
        "Chat request started request_id=%s",
        request_id
    )

    start_time = time.perf_counter()

    model = "openrouter/free"
    provider = "openrouter"

    try:
        check_budget(
            db,
            api_key
        )

    except ValueError:
        logger.warning(
            "Chat request blocked "
            "request_id=%s reason=monthly_budget_exceeded",
            request_id
        )

        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Monthly AI budget exceeded"
        )

    # ---------------------------------------------------------
    # Resolve user's provider credential
    # ---------------------------------------------------------

    provider_credential = None
    provider_api_key = None

    if api_key.user_id is not None:
        provider_credential = get_provider_credential(
            db,
            user_id=api_key.user_id,
            provider=provider
        )

        if provider_credential is not None:
            try:
                provider_api_key = (
                    get_decrypted_provider_api_key(
                        db,
                        user_id=api_key.user_id,
                        provider=provider
                    )
                )

            except Exception as error:
                logger.error(
                    "Provider credential decryption failed "
                    "request_id=%s error=%s",
                    request_id,
                    error
                )

                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Unable to load provider credentials"
                )

    # ---------------------------------------------------------
    # Build cache scope
    # ---------------------------------------------------------
    #
    # BYOK users receive an isolated cache namespace.
    #
    # The credential ID + updated_at ensures that replacing
    # the provider key creates a new cache namespace.
    #
    # No secret/API key is included in the cache key.
    # ---------------------------------------------------------

    if provider_credential is not None:
        cache_scope = (
            f"user:{api_key.user_id}:"
            f"provider:{provider}:"
            f"credential:{provider_credential.id}:"
            f"version:{provider_credential.updated_at.isoformat()}"
        )

    elif api_key.user_id is not None:
        cache_scope = (
            f"user:{api_key.user_id}:"
            f"provider:{provider}:"
            f"platform"
        )

    else:
        cache_scope = "platform"

    # ---------------------------------------------------------
    # Check Redis cache
    # ---------------------------------------------------------

    cached_response = get_cached_response(
        request.prompt,
        model,
        cache_scope
    )

    if cached_response is not None:
        latency_ms = int(
            (time.perf_counter() - start_time) * 1000
        )

        logger.info(
            "Chat request completed request_id=%s "
            "cache_hit=true latency_ms=%s",
            request_id,
            latency_ms
        )

        ai_request = AIRequest(
            api_key_id=api_key.id,
            request_id=request_id,
            prompt=request.prompt,
            model=model,
            provider=provider,
            response=cached_response,
            status="success",
            cache_hit=True,
            latency_ms=latency_ms,
            prompt_tokens=None,
            completion_tokens=None,
            total_tokens=None,
            cost_usd=None
        )

        db.add(ai_request)
        db.commit()
        db.refresh(ai_request)

        return {
            "request_id": ai_request.request_id,
            "response": cached_response,
            "model": model,
            "provider": provider,
            "latency_ms": latency_ms
        }

    # ---------------------------------------------------------
    # Cache miss → call provider
    # ---------------------------------------------------------

    try:

        # Preserve the existing platform-managed call
        # when the user has no BYOK credential.
        if provider_api_key is None:
            ai_response = generate_response(
                request.prompt
            )

        else:
            logger.info(
                "Using user provider credential "
                "request_id=%s user_id=%s provider=%s",
                request_id,
                api_key.user_id,
                provider
            )

            ai_response = generate_response(
                request.prompt,
                model,
                provider_api_key
            )

        latency_ms = int(
            (time.perf_counter() - start_time) * 1000
        )

        logger.info(
            "Chat request completed request_id=%s "
            "cache_hit=false latency_ms=%s",
            request_id,
            latency_ms
        )

        # -----------------------------------------------------
        # Save response to Redis
        # -----------------------------------------------------

        cache_response(
            request.prompt,
            model,
            ai_response.content,
            cache_scope
        )

        # -----------------------------------------------------
        # Save request + usage to DB
        # -----------------------------------------------------

        ai_request = AIRequest(
            api_key_id=api_key.id,
            request_id=request_id,
            prompt=request.prompt,
            model=model,
            provider=provider,
            response=ai_response.content,
            status="success",
            cache_hit=False,
            latency_ms=latency_ms,
            prompt_tokens=ai_response.prompt_tokens,
            completion_tokens=ai_response.completion_tokens,
            total_tokens=ai_response.total_tokens,
            cost_usd=ai_response.cost_usd
        )

        db.add(ai_request)
        db.commit()
        db.refresh(ai_request)

        return {
            "request_id": ai_request.request_id,
            "response": ai_response.content,
            "model": model,
            "provider": provider,
            "latency_ms": latency_ms
        }

    except Exception as error:

        latency_ms = int(
            (time.perf_counter() - start_time) * 1000
        )

        logger.error(
            "Chat request failed request_id=%s "
            "latency_ms=%s error=%s",
            request_id,
            latency_ms,
            error
        )

        ai_request = AIRequest(
            api_key_id=api_key.id,
            request_id=request_id,
            prompt=request.prompt,
            model=model,
            provider=provider,
            response=None,
            status="failed",
            cache_hit=False,
            latency_ms=latency_ms,
            error_message=str(error),
            prompt_tokens=None,
            completion_tokens=None,
            total_tokens=None,
            cost_usd=None
        )

        db.add(ai_request)
        db.commit()
        db.refresh(ai_request)

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI provider request failed"
        )