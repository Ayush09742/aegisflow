from openai import OpenAI

from app.core.config import settings
from app.providers.base import AIProvider, AIResponse


class OpenRouterProvider(AIProvider):

    def __init__(self):
        self.client = OpenAI(
            api_key=settings.openrouter_api_key,
            base_url="https://openrouter.ai/api/v1",
            timeout=15.0,
            max_retries=0,
        )

    def generate_response(self, prompt: str) -> AIResponse:

        response = self.client.chat.completions.create(
            model="openrouter/free",
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