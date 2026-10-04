from datetime import datetime

from pydantic import BaseModel, Field, SecretStr


class ProviderConnectionTestRequest(BaseModel):
    provider: str = Field(
        min_length=1,
        max_length=50
    )
    api_key: SecretStr = Field(
        min_length=1
    )


class ProviderConnectionTestResponse(BaseModel):
    provider: str
    connected: bool
    message: str


class ProviderCredentialCreateRequest(BaseModel):
    provider: str = Field(
        min_length=1,
        max_length=50
    )
    api_key: SecretStr = Field(
        min_length=1
    )


class ProviderCredentialResponse(BaseModel):
    id: int
    provider: str
    is_active: bool
    created_at: datetime
    updated_at: datetime