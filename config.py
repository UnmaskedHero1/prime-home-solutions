from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT = Path(__file__).resolve().parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_dir: Path = Path("databases")
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    @property
    def resolved_database_dir(self) -> Path:
        if self.database_dir.is_absolute():
            return self.database_dir
        return ROOT / self.database_dir

    @property
    def database_path(self) -> Path:
        return self.resolved_database_dir / "prime.db"

    @property
    def sqlalchemy_url(self) -> str:
        return "sqlite:///" + self.database_path.resolve().as_posix()

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
