from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Identitas aplikasi
    APP_NAME: str = "Masa Plus API"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://masa_user:masa_pass@localhost:5432/masa_plus"

    # Auth
    SECRET_KEY: str = "ganti-ini-dengan-random-string-panjang"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 hari

    # AI (diisi nanti waktu masuk fase RAG)
    ANTHROPIC_API_KEY: str = ""

    # CORS - alamat frontend yang boleh akses API ini
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]

    class Config:
        env_file = ".env"


settings = Settings()
