from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.dependencies.auth import authenticate_api_key
from app.core.database import get_db
from app.models.ai_request import AIRequest
from app.models.api_key import APIKey
from app.schemas.usage import UsageResponse


router = APIRouter(
    prefix="/v1",
    tags=["Usage"]
)


@router.get(
    "/usage",
    response_model=UsageResponse
)
def get_usage(
    db: Session = Depends(get_db),
    api_key: APIKey = Depends(authenticate_api_key)
):

    total_requests = (
        db.query(func.count(AIRequest.id))
        .filter(
            AIRequest.api_key_id == api_key.id
        )
        .scalar()
    )

    successful_requests = (
        db.query(func.count(AIRequest.id))
        .filter(
            AIRequest.api_key_id == api_key.id,
            AIRequest.status == "success"
        )
        .scalar()
    )

    failed_requests = (
        db.query(func.count(AIRequest.id))
        .filter(
            AIRequest.api_key_id == api_key.id,
            AIRequest.status == "failed"
        )
        .scalar()
    )

    cache_hits = (
        db.query(func.count(AIRequest.id))
        .filter(
            AIRequest.api_key_id == api_key.id,
            AIRequest.cache_hit == True
        )
        .scalar()
    )

    average_latency = (
        db.query(func.avg(AIRequest.latency_ms))
        .filter(
            AIRequest.api_key_id == api_key.id
        )
        .scalar()
    )

    total_prompt_tokens = (
        db.query(
            func.sum(AIRequest.prompt_tokens)
        )
        .filter(
            AIRequest.api_key_id == api_key.id
        )
        .scalar()
    )

    total_completion_tokens = (
        db.query(
            func.sum(AIRequest.completion_tokens)
        )
        .filter(
            AIRequest.api_key_id == api_key.id
        )
        .scalar()
    )

    total_tokens = (
        db.query(
            func.sum(AIRequest.total_tokens)
        )
        .filter(
            AIRequest.api_key_id == api_key.id
        )
        .scalar()
    )

    total_cost_usd = (
        db.query(
            func.sum(AIRequest.cost_usd)
        )
        .filter(
            AIRequest.api_key_id == api_key.id
        )
        .scalar()
    )

    total = total_requests or 0
    hits = cache_hits or 0

    cache_hit_rate = (
        (hits / total) * 100
        if total > 0
        else 0.0
    )

    return {
        "total_requests": total,
        "successful_requests": successful_requests or 0,
        "failed_requests": failed_requests or 0,

        "cache_hits": hits,
        "cache_hit_rate": round(
            cache_hit_rate,
            2
        ),

        "average_latency_ms": (
            round(
                float(average_latency),
                2
            )
            if average_latency is not None
            else None
        ),

        "total_prompt_tokens": (
            total_prompt_tokens or 0
        ),

        "total_completion_tokens": (
            total_completion_tokens or 0
        ),

        "total_tokens": (
            total_tokens or 0
        ),

        "total_cost_usd": (
            round(
                float(total_cost_usd),
                8
            )
            if total_cost_usd is not None
            else 0.0
        )
    }