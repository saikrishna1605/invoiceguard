import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    ANTHROPIC_API_KEY: str | None = os.getenv("ANTHROPIC_API_KEY") or None
    ANOMALY_MULTIPLIER: float = float(os.getenv("ANOMALY_MULTIPLIER", "2.5"))
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./invoiceguard.db")

    # Comma-separated list of frontend origins allowed to call the API.
    # Local development works by default; production should provide the
    # deployed frontend URL through CORS_ORIGINS.
    CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        ).split(",")
        if origin.strip()
    ]

    # Notification channels for high-risk alerts — all optional. If none are
    # configured, alerts still land in the audit trail and GET /dashboard/alerts;
    # these just add a push on top of that.
    SLACK_WEBHOOK_URL: str | None = os.getenv("SLACK_WEBHOOK_URL") or None

    SMTP_HOST: str | None = os.getenv("SMTP_HOST") or None
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str | None = os.getenv("SMTP_USER") or None
    SMTP_PASSWORD: str | None = os.getenv("SMTP_PASSWORD") or None
    ALERT_EMAIL_FROM: str | None = os.getenv("ALERT_EMAIL_FROM") or None
    ALERT_EMAIL_TO: str | None = os.getenv("ALERT_EMAIL_TO") or None


settings = Settings()
