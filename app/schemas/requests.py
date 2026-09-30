from datetime import datetime

from pydantic import BaseModel, ConfigDict


class RequestResponse(BaseModel):
    id: int
    request_id: str
    prompt: str
    model: str
    provider: str
    response: str | None
    status: str
    cache_hit: bool
    latency_ms: int | None
    error_message: str | None
    prompt_tokens: int | None
    completion_tokens: int | None
    total_tokens: int | None
    cost_usd: float | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)