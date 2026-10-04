from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    openrouter_api_key: str

    database_url: str

    jwt_secret: str

    provider_credential_encryption_key: str

    google_client_id: str

    google_client_secret: str

    github_client_id: str

    github_client_secret: str

    oauth_frontend_url: str = "http://127.0.0.1:5173"

    redis_host: str = "localhost"

    redis_port: int = 6379

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()