import time

from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status

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

    # -----------------------------
    # Check Redis cache
    # -----------------------------

    cached_response = get_cached_response(
        request.prompt,
        model
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

            # Cached responses did not make
            # a new provider request.
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

    # -----------------------------
    # Cache miss → call provider
    # -----------------------------

    try:

        ai_response = generate_response(
            request.prompt
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

        # -----------------------------
        # Save response to Redis
        # -----------------------------

        cache_response(
            request.prompt,
            model,
            ai_response.content
        )

        # -----------------------------
        # Save request + usage to DB
        # -----------------------------

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