from unittest.mock import patch

import pytest
from openai import APIConnectionError

from app.providers.base import AIResponse
from app.services import ai_service


def test_generate_response_success():

    expected_response = AIResponse(
        content="AI response",
        prompt_tokens=10,
        completion_tokens=20,
        total_tokens=30,
        cost_usd=0.001
    )

    with patch.object(
        ai_service.provider,
        "generate_response"
    ) as mock_provider:

        mock_provider.return_value = expected_response

        result = ai_service.generate_response(
            "Hello"
        )

    assert result == expected_response

    assert result.content == "AI response"
    assert result.prompt_tokens == 10
    assert result.completion_tokens == 20
    assert result.total_tokens == 30
    assert result.cost_usd == 0.001

    mock_provider.assert_called_once_with(
        "Hello"
    )


def test_generate_response_retry_success():

    expected_response = AIResponse(
        content="AI response",
        prompt_tokens=10,
        completion_tokens=20,
        total_tokens=30,
        cost_usd=0.001
    )

    with patch.object(
        ai_service.provider,
        "generate_response"
    ) as mock_provider:

        mock_provider.side_effect = [
            APIConnectionError(
                request=object()
            ),
            expected_response
        ]

        with patch(
            "app.services.ai_service.time.sleep"
        ) as mock_sleep:

            result = ai_service.generate_response(
                "Hello"
            )

    assert result == expected_response

    assert result.content == "AI response"
    assert result.total_tokens == 30

    assert mock_provider.call_count == 2

    mock_sleep.assert_called_once_with(1)


def test_generate_response_all_retries_fail():

    with patch.object(
        ai_service.provider,
        "generate_response"
    ) as mock_provider:

        mock_provider.side_effect = (
            APIConnectionError(
                request=object()
            )
        )

        with patch(
            "app.services.ai_service.time.sleep"
        ) as mock_sleep:

            with pytest.raises(
                APIConnectionError
            ):

                ai_service.generate_response(
                    "Hello"
                )

    assert mock_provider.call_count == 3

    assert mock_sleep.call_count == 2

    mock_sleep.assert_any_call(1)
    mock_sleep.assert_any_call(2)