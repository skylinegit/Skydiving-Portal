"""Session token generation, persistence, and cookie handling.

The session id is an opaque URL-safe random string (256 bits of entropy).
It is stored in the `sessions` table and returned to the client as an
HTTP-only Secure SameSite=Lax cookie. JavaScript on the frontend can never
read or write it.
"""

import secrets
from datetime import datetime, timedelta, timezone

from fastapi import Request, Response
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import settings
from .models import Session as SessionRow


def _new_session_id() -> str:
    """Return a fresh 256-bit URL-safe random token."""
    return secrets.token_urlsafe(32)


async def create_session(
    db: AsyncSession,
    *,
    user_id: int,
    request: Request,
) -> SessionRow:
    """Create a new session row for the user. Caller commits and sets cookie."""
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.session_ttl_days)
    row = SessionRow(
        session_id=_new_session_id(),
        user_id=user_id,
        expires_at=expires_at,
        ip_address=_client_ip(request),
        user_agent=_user_agent(request),
    )
    db.add(row)
    await db.flush()
    return row


def set_session_cookie(response: Response, session_id: str) -> None:
    """Write the session cookie onto the outgoing response."""
    response.set_cookie(
        key=settings.session_cookie_name,
        value=session_id,
        max_age=settings.session_ttl_days * 24 * 60 * 60,
        httponly=True,
        secure=settings.session_cookie_secure,
        samesite=settings.session_cookie_samesite,
        domain=settings.session_cookie_domain,
        path="/",
    )


def clear_session_cookie(response: Response) -> None:
    """Tell the browser to drop the session cookie."""
    response.delete_cookie(
        key=settings.session_cookie_name,
        domain=settings.session_cookie_domain,
        path="/",
    )


async def delete_session(db: AsyncSession, session_id: str) -> None:
    """Hard-delete a session row (logout)."""
    await db.execute(delete(SessionRow).where(SessionRow.session_id == session_id))


async def delete_other_sessions(
    db: AsyncSession, *, user_id: int, keep_session_id: str
) -> int:
    """Delete every session for `user_id` except the one we are currently using.

    Returns the number of sessions removed.
    """
    result = await db.execute(
        delete(SessionRow)
        .where(SessionRow.user_id == user_id)
        .where(SessionRow.session_id != keep_session_id)
        .returning(SessionRow.session_id)
    )
    return len(result.scalars().all())


def _client_ip(request: Request) -> str | None:
    """Best-effort client IP. Honours X-Forwarded-For when behind a proxy."""
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    return request.client.host if request.client else None


def _user_agent(request: Request) -> str | None:
    return request.headers.get("user-agent")
