from openai import OpenAI

from app.core.config import settings
from app.providers.base import AIProvider, AIResponse


class OpenRouterProvider(AIProvider):

    def __init__(
        self,
        api_key: str | None = None
    ):
        self.api_key = (
            api_key
            if api_key is not None
            else settings.openrouter_api_key
        )

        self.client = OpenAI(
            api_key=self.api_key,
            base_url="https://openrouter.ai/api/v1",
            timeout=15.0,
            max_retries=0,
        )
    def test_connection(self) -> bool:
        self.client.models.list()
        return True
    def test_connection(self) -> bool:
        self.client.models.list()
        return True

    def generate_response(
        self,
        prompt: str,
        model: str | None = None
    ) -> AIResponse:

        selected_model = model or "openrouter/free"

        response = self.client.chat.completions.create(
            model=selected_model,
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            extra_body={
                "usage": {
                    "include": True
                }
            },
        )

        usage = response.usage

        return AIResponse(
            content=response.choices[0].message.content,
            prompt_tokens=(
                usage.prompt_tokens
                if usage is not None
                else None
            ),
            completion_tokens=(
                usage.completion_tokens
                if usage is not None
                else None
            ),
            total_tokens=(
                usage.total_tokens
                if usage is not None
                else None
            ),
            cost_usd=(
                float(usage.cost)
                if usage is not None
                and getattr(usage, "cost", None) is not None
                else None
            ),
        )