from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    openrouter_api_key: str
    database_url: str
    jwt_secret: str

    redis_host: str = "localhost"
    redis_port: int = 6379

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()