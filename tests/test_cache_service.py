from unittest.mock import Mock, patch

from app.services.cache_service import (
    CACHE_TTL_SECONDS,
    build_cache_key,
    get_cached_response,
    cache_response,
)


def test_build_cache_key_is_deterministic():

    key1 = build_cache_key(
        "Hello",
        "openrouter/free"
    )

    key2 = build_cache_key(
        "Hello",
        "openrouter/free"
    )

    assert key1 == key2


def test_get_cached_response():

    mock_redis = Mock()

    mock_redis.get.return_value = "Cached response"

    with patch(
        "app.services.cache_service.redis_client",
        mock_redis
    ):

        result = get_cached_response(
            "Hello",
            "openrouter/free"
        )

    assert result == "Cached response"

    mock_redis.get.assert_called_once()


def test_cache_response():

    mock_redis = Mock()

    with patch(
        "app.services.cache_service.redis_client",
        mock_redis
    ):

        cache_response(
            "Hello",
            "openrouter/free",
            "Hello from cache"
        )

    mock_redis.setex.assert_called_once()

    args = mock_redis.setex.call_args.args

    assert args[0].startswith("aegisflow:cache:")
    assert args[1] == CACHE_TTL_SECONDS
    assert args[2] == "Hello from cache"