import json
from typing import Annotated, Literal

from pydantic import field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "sqlite:///./amazon.db"
    redis_url: str = "redis://localhost:6379/0"
    jwt_secret: str = "dev-only-insecure-secret-do-not-ship-me"
    jwt_ttl_hours: int = 24 * 7
    # NoDecode: without it pydantic-settings insists the env var is JSON and dies on a
    # bare "https://app.vercel.app" before any validator runs. Both forms are accepted.
    cors_origins: Annotated[list[str], NoDecode] = ["http://localhost:3000"]
    cookie_secure: bool = False
    # A split deploy is cross-site, and a Lax cookie is dropped on every XHR there.
    cookie_samesite: Literal["lax", "strict", "none"] = "lax"
    cache_ttl: int = 60
    max_page_size: int = 48

    r2_account_id: str = ""
    r2_access_key_id: str = ""
    r2_secret_access_key: str = ""
    r2_bucket: str = ""
    r2_public_base_url: str = ""

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_origins(cls, value: object) -> object:
        """Accept a JSON array or a plain comma-separated list of origins.

        Trailing slashes are stripped: a browser's Origin header is scheme + host + port
        and never carries one, so "https://app.vercel.app/" in the allowlist matches
        nothing and every request fails preflight.
        """
        if isinstance(value, str):
            text = value.strip()
            value = json.loads(text) if text.startswith("[") else text.split(",")
        if not isinstance(value, list):
            return value
        return [origin.strip().rstrip("/") for origin in value if origin.strip()]

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
