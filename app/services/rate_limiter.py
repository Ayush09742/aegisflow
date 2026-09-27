from fastapi import HTTPException, status

from app.core.redis import redis_client


WINDOW_SECONDS = 60


def check_rate_limit(
    api_key_id: int,
    rate_limit: int
) -> None:

    key = f"rate_limit:{api_key_id}"

    current_count = redis_client.incr(key)

    if current_count == 1:
        redis_client.expire(
            key,
            WINDOW_SECONDS
        )

    if current_count > rate_limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Try again later."
        )