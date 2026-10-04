import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from config import settings
from database import Base, engine
from routes import router

DIST = Path(__file__).resolve().parent / "frontend" / "dist"
log = logging.getLogger("prime")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    logging.basicConfig(level=logging.INFO)
    settings.resolved_database_dir.mkdir(parents=True, exist_ok=True)
    import models  # noqa: F401  (register tables)

    Base.metadata.create_all(bind=engine)
    log.info("Database ready at %s", settings.database_path.resolve())
    yield


app = FastAPI(title="Prime Home Solutions LLC", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)
app.include_router(router, prefix="/api")


@app.get("/{full_path:path}")
def frontend(full_path: str):
    if full_path == "api" or full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="Not found")

    dist = DIST.resolve()
    if not dist.is_dir():
        raise HTTPException(status_code=404, detail="Frontend has not been built yet.")

    candidate = (dist / full_path).resolve()
    try:
        candidate.relative_to(dist)
    except ValueError:
        raise HTTPException(status_code=404, detail="Not found") from None

    if candidate.is_file():
        return FileResponse(candidate)

    index = dist / "index.html"
    if index.is_file():
        return FileResponse(index)
    raise HTTPException(status_code=404, detail="Frontend has not been built yet.")
