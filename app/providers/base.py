from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class AIResponse:
    content: str
    prompt_tokens: int | None = None
    completion_tokens: int | None = None
    total_tokens: int | None = None
    cost_usd: float | None = None


class AIProvider(ABC):

    @abstractmethod
    def generate_response(
        self,
        prompt: str,
        model: str | None = None
    ) -> AIResponse:
        pass