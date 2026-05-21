"""FastAPI dependencies: DB session, current user.

Auth dependency reads the session cookie, looks up the row in `sessions`,
verifies expiry, refreshes `last_active_at`, and returns the user.
"""

from collections.abc import AsyncIterator
from datetime import datetime, timezone

from fastapi import Cookie, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .auth.models import Session as SessionRow
from .config import settings
from .db import get_session
from .users.models import User


async def get_db() -> AsyncIterator[AsyncSession]:
    """Yield a database session for the duration of the request."""
    async for session in get_session():
        yield session


async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> User:
    """Resolve the current user from the session cookie.

    Raises 401 if no cookie, expired session, or unknown session id.
    """
    cookie_name = settings.session_cookie_name
    token = request.cookies.get(cookie_name)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    result = await db.execute(
        select(SessionRow).where(SessionRow.session_id == token)
    )
    row = result.scalar_one_or_none()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session",
        )

    now = datetime.now(timezone.utc)
    if row.expires_at <= now:
        await db.delete(row)
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired",
        )

    user = await db.get(User, row.user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists",
        )

    row.last_active_at = now
    await db.commit()

    return user


async def get_optional_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> User | None:
    """Resolve the current user, returning None if not authenticated."""
    try:
        return await get_current_user(request, db)
    except HTTPException:
        return None
