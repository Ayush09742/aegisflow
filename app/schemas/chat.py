from pydantic import BaseModel


class ChatRequest(BaseModel):
    prompt: str


class ChatResponse(BaseModel):
    request_id: str
    response: str
    model: str
    provider: str
    latency_ms: int