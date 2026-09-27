import time

from openai import (
    APITimeoutError,
    APIConnectionError,
    RateLimitError,
    InternalServerError,
)

from app.providers.openrouter import OpenRouterProvider
from app.providers.base import AIResponse
from app.core.logger import get_logger


MAX_ATTEMPTS = 3


provider = OpenRouterProvider()

logger = get_logger("aegisflow.ai")


def generate_response(prompt: str) -> AIResponse:

    for attempt in range(1, MAX_ATTEMPTS + 1):

        try:

            logger.info(
                "AI request attempt=%s/%s",
                attempt,
                MAX_ATTEMPTS
            )

            response = provider.generate_response(
                prompt
            )

            logger.info(
                "AI request completed attempt=%s",
                attempt
            )

            return response

        except (
            APITimeoutError,
            APIConnectionError,
            RateLimitError,
            InternalServerError,
        ) as error:

            if attempt == MAX_ATTEMPTS:

                logger.error(
                    "AI request failed after %s attempts: %s",
                    MAX_ATTEMPTS,
                    error
                )

                raise error

            wait_seconds = 2 ** (attempt - 1)

            logger.warning(
                "AI provider error. "
                "retry=%s/%s wait=%ss error=%s",
                attempt,
                MAX_ATTEMPTS - 1,
                wait_seconds,
                error
            )

            time.sleep(wait_seconds)