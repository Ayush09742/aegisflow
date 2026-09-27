from datetime import datetime, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.ai_request import AIRequest
from app.models.api_key import APIKey


def get_current_month_cost(
    db: Session,
    api_key_id: int
) -> float:

    now = datetime.now(timezone.utc)

    month_start = now.replace(
        day=1,
        hour=0,
        minute=0,
        second=0,
        microsecond=0
    )

    total_cost = (
        db.query(
            func.sum(AIRequest.cost_usd)
        )
        .filter(
            AIRequest.api_key_id == api_key_id,
            AIRequest.created_at >= month_start,
            AIRequest.status == "success"
        )
        .scalar()
    )

    return float(total_cost or 0.0)


def check_budget(
    db: Session,
    api_key: APIKey
) -> None:

    if api_key.monthly_budget_usd is None:
        return

    current_cost = get_current_month_cost(
        db,
        api_key.id
    )

    if current_cost >= api_key.monthly_budget_usd:
        raise ValueError(
            "Monthly AI budget exceeded"
        )