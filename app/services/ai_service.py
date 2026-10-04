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

logger = get_logger("aegisflow.ai")

# Default provider.
# Kept at module level for existing tests and
# the current platform-managed OpenRouter flow.
provider = OpenRouterProvider()


def generate_response(
    prompt: str,
    model: str = "openrouter/free",
    provider_api_key: str | None = None
) -> AIResponse:

    active_provider = (
        provider
        if provider_api_key is None
        else OpenRouterProvider(
            api_key=provider_api_key
        )
    )

    for attempt in range(1, MAX_ATTEMPTS + 1):

        try:

            logger.info(
                "AI request attempt=%s/%s",
                attempt,
                MAX_ATTEMPTS
            )

            # Preserve the existing provider call signature
            # for the default OpenRouter flow.
            if (
                provider_api_key is None
                and model == "openrouter/free"
            ):
                response = active_provider.generate_response(
                    prompt
                )
            else:
                response = active_provider.generate_response(
                    prompt,
                    model
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