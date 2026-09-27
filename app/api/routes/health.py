from fastapi import APIRouter
from sqlalchemy import text

from app.core.database import engine
from app.core.redis import redis_client


router = APIRouter(
    tags=["Health"]
)


@router.get("/health")
def health_check():

    return {
        "status": "ok"
    }


@router.get("/ready")
def readiness_check():

    database_status = "ok"
    redis_status = "ok"

    try:

        with engine.connect() as connection:
            connection.execute(
                text("SELECT 1")
            )

    except Exception:

        database_status = "error"

    try:

        redis_client.ping()

    except Exception:

        redis_status = "error"

    is_ready = (
        database_status == "ok"
        and redis_status == "ok"
    )

    return {
        "status": (
            "ready"
            if is_ready
            else "not_ready"
        ),
        "database": database_status,
        "redis": redis_status
    }