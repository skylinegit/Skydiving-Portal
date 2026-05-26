"""SQLAlchemy models for session and token tables.

User-related profile fields live on `User` in `users.models` per the handoff
data model. These tables are auth-flow infrastructure.
"""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from ..db import Base


class Session(Base):
    """Active server-side session.

    `session_id` is the random token that the client stores in an HTTP-only
    cookie. On each request the dependency looks the session up by id,
    verifies expiry, and refreshes `last_active_at`.
    """

    __tablename__ = "sessions"

    session_id: Mapped[str] = mapped_column(Text, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    last_active_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ip_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    user_agent: Mapped[str | None] = mapped_column(Text, nullable=True)


class PasswordReset(Base):
    """One-time token used by the forgot-password flow.

    `token` is stored as a random URL-safe string; the link sent to the user
    contains the same string. Single-use, short TTL.
    """

    __tablename__ = "password_resets"

    reset_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False,
    )
    token: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class EmailChangeConfirmation(Base):
    """Pending email-change request.

    The confirmation link is sent to the NEW email address. The change is
    only applied to `users.email` when the link is clicked and the token is
    consumed.
    """

    __tablename__ = "email_change_confirmations"

    confirmation_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False,
    )
    new_email: Mapped[str] = mapped_column(Text, nullable=False)
    token: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
