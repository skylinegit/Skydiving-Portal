"""Skyline Portal — FastAPI application entry point.

Run with:
    uvicorn src.main:app --reload --port 8000
"""

import logging
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .auth.router import router as auth_router
from .bookings.router import router as bookings_router
from .config import settings
from .db import engine
from .users.router import router as users_router

logging.basicConfig(
    level=logging.DEBUG if settings.is_development else logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)
log = logging.getLogger("skyline.api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup + shutdown hooks."""
    log.info("Starting %s (%s)", settings.app_name, settings.app_env)
    yield
    log.info("Shutting down — disposing DB engine")
    await engine.dispose()


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.is_development else None,
    redoc_url=None,
    openapi_url="/openapi.json" if settings.is_development else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.get("/health", tags=["meta"])
async def health() -> dict[str, Any]:
    """Liveness probe. Used by uptime monitors and the droplet's healthcheck."""
    return {"status": "ok", "env": settings.app_env}


app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(users_router, prefix="", tags=["users"])
app.include_router(bookings_router)


@app.exception_handler(Exception)
async def unhandled_exception_handler(_request, exc: Exception) -> JSONResponse:
    """Catch-all so unexpected errors never leak internals to the client."""
    log.exception("Unhandled exception")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )
