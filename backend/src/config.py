"""Application settings loaded from environment variables.

All secrets and per-environment values live in `.env`. Never hard-code them.
"""

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Settings for the Skyline portal backend.

    Loaded from environment variables; see `.env.example` for the full list.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ----- App -----
    app_env: str = Field(default="development")
    app_name: str = Field(default="Skyline Portal API")

    # ----- Database -----
    database_url: str = Field(
        description="Async Postgres URL, e.g. postgresql+asyncpg://user:pass@host:25060/db?ssl=require"
    )

    # ----- Sessions / cookies -----
    session_cookie_name: str = Field(default="skyline_session")
    session_ttl_days: int = Field(default=30)
    session_cookie_secure: bool = Field(
        default=True,
        description="Set False only for local HTTP testing. Production must be True.",
    )
    session_cookie_samesite: str = Field(default="lax")
    session_cookie_domain: str | None = Field(default=None)

    # ----- Token TTLs -----
    password_reset_ttl_minutes: int = Field(default=30)
    email_change_ttl_minutes: int = Field(default=60)

    # ----- URLs / CORS -----
    frontend_url: str = Field(default="http://localhost:3000")
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:3000"])

    # ----- N8N (CRM bridge) -----
    n8n_base_url: str = Field(default="https://n8n.skylineevents.co.uk")
    n8n_webhook_token: str = Field(default="")

    # ----- Email -----
    smtp_host: str = Field(default="")
    smtp_port: int = Field(default=587)
    smtp_username: str = Field(default="")
    smtp_password: str = Field(default="")
    smtp_from: str = Field(default="myskydive@skylineevents.co.uk")
    # STARTTLS on the chosen port (typical for 587). Most providers expect this.
    smtp_use_tls: bool = Field(default=True)
    # Implicit TLS from the start of the connection (typical for 465).
    # Only set one of `smtp_use_tls` and `smtp_use_ssl` to true.
    smtp_use_ssl: bool = Field(default=False)

    @property
    def is_production(self) -> bool:
        return self.app_env.lower() == "production"

    @property
    def is_development(self) -> bool:
        return self.app_env.lower() == "development"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Cached settings accessor. Use this instead of instantiating Settings directly."""
    return Settings()  # type: ignore[call-arg]


settings = get_settings()
