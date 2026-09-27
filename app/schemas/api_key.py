from pydantic import BaseModel, Field


class APIKeyCreate(BaseModel):
    name: str = Field(
        min_length=1,
        max_length=100
    )

    rate_limit: int = Field(
        default=10,
        gt=0
    )

    monthly_budget_usd: float | None = Field(
        default=None,
        gt=0
    )


class APIKeyCreateResponse(BaseModel):
    id: int
    name: str
    api_key: str
    rate_limit: int
    monthly_budget_usd: float | None
    is_active: bool


class APIKeyListResponse(BaseModel):
    id: int
    name: str
    rate_limit: int
    monthly_budget_usd: float | None
    is_active: bool
    is_admin: bool