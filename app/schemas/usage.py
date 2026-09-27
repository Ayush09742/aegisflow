from pydantic import BaseModel


class UsageResponse(BaseModel):
    total_requests: int
    successful_requests: int
    failed_requests: int

    cache_hits: int
    cache_hit_rate: float

    average_latency_ms: float | None

    total_prompt_tokens: int
    total_completion_tokens: int
    total_tokens: int
    total_cost_usd: float