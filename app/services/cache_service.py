import hashlib

from app.core.redis import redis_client


CACHE_TTL_SECONDS = 300


def build_cache_key(
    prompt: str,
    model: str,
    cache_scope: str | None = None
) -> str:
    normalized_prompt = prompt.strip()

    scope = cache_scope or "global"

    raw_key = (
        f"{scope}:{model}:{normalized_prompt}"
    )

    hashed_key = hashlib.sha256(
        raw_key.encode("utf-8")
    ).hexdigest()

    return f"aegisflow:cache:{hashed_key}"


def get_cached_response(
    prompt: str,
    model: str,
    cache_scope: str | None = None
) -> str | None:
    key = build_cache_key(
        prompt,
        model,
        cache_scope
    )

    return redis_client.get(key)


def cache_response(
    prompt: str,
    model: str,
    response: str,
    cache_scope: str | None = None
) -> None:
    key = build_cache_key(
        prompt,
        model,
        cache_scope
    )

    redis_client.setex(
        key,
        CACHE_TTL_SECONDS,
        response
    )