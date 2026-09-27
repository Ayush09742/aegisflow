from unittest.mock import Mock, patch

from app.api.routes.usage import get_usage


def test_get_usage():

    db = Mock()

    db.query.return_value.filter.return_value.scalar.side_effect = [
        10,       # total_requests
        8,        # successful_requests
        2,        # failed_requests
        4,        # cache_hits
        3500.0,   # average_latency_ms

        1000,     # total_prompt_tokens
        2000,     # total_completion_tokens
        3000,     # total_tokens
        0.123456  # total_cost_usd
    ]

    api_key = Mock()
    api_key.id = 1

    with patch(
        "app.api.routes.usage.func.avg"
    ) as mock_avg:

        mock_avg.return_value = Mock()

        result = get_usage(
            db=db,
            api_key=api_key
        )

    assert result["total_requests"] == 10

    assert result["successful_requests"] == 8

    assert result["failed_requests"] == 2

    assert result["cache_hits"] == 4

    assert result["cache_hit_rate"] == 40.0

    assert result["average_latency_ms"] == 3500.0

    assert result["total_prompt_tokens"] == 1000

    assert result["total_completion_tokens"] == 2000

    assert result["total_tokens"] == 3000

    assert result["total_cost_usd"] == 0.123456