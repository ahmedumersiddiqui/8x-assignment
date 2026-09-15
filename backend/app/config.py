from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "sqlite:///./amazon.db"
    redis_url: str = "redis://localhost:6379/0"
    jwt_secret: str = "dev-only-insecure-secret-do-not-ship-me"
    jwt_ttl_hours: int = 24 * 7
    cors_origins: list[str] = ["http://localhost:3000"]
    cookie_secure: bool = False
    cache_ttl: int = 60
    max_page_size: int = 48

    r2_account_id: str = ""
    r2_access_key_id: str = ""
    r2_secret_access_key: str = ""
    r2_bucket: str = ""
    r2_public_base_url: str = ""

    @property
    def r2_configured(self) -> bool:
        return all(
            (
                self.r2_account_id,
                self.r2_access_key_id,
                self.r2_secret_access_key,
                self.r2_bucket,
                self.r2_public_base_url,
            )
        )


settings = Settings()
