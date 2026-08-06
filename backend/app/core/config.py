import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Best Friend Challenge API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "bf-challenge-secret-key-super-secure-2026")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./bf_challenge.db")
    ALLOWED_ORIGINS: list[str] = ["*"]

settings = Settings()
