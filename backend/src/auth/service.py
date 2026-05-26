"""Auth business logic.

Route handlers in `router.py` stay thin and delegate here. This module owns
password verification, session lifecycle, and the WordPress hash migration.
"""

import logging
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..bookings.models import Booking
from ..config import settings
from ..integrations import email as email_service
from ..users.models import User
from .models import EmailChangeConfirmation, PasswordReset
from .password import hash_password, needs_rehash, verify_password

log = logging.getLogger(__name__)

# A generic message returned for any failed login. Never reveal whether the
# email exists or whether the password was wrong — both look identical from
# outside.
INVALID_CREDENTIALS = "Invalid email or password"


async def authenticate(db: AsyncSession, *, email: str, password: str) -> User:
    """Verify credentials and (silently) upgrade phpass hashes to bcrypt.

    Raises 401 on any failure. On success, returns the User row.
    """
    result = await db.execute(select(User).where(User.email == email.lower()))
    user = result.scalar_one_or_none()
    if user is None:
        # Constant-time-ish: still run a hash verify against a dummy so the
        # response time is similar for "user not found" and "wrong password".
        _dummy_verify()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=INVALID_CREDENTIALS
        )

    if not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=INVALID_CREDENTIALS
        )

    # WordPress migration: re-hash phpass to bcrypt on first successful login.
    if needs_rehash(user.password_hash):
        user.password_hash = hash_password(password)
        user.hash_algorithm = "bcrypt"
        log.info("Upgraded password hash for user_id=%s to bcrypt", user.user_id)

    return user


def _dummy_verify() -> None:
    """Run a dummy hash compare to keep timing similar for unknown emails."""
    verify_password("dummy", "$2b$12$abcdefghijklmnopqrstuv.cR4nDz0qH0lYpY3HnVxv4LqGmYhO/eIm")


# ---------------------------------------------------------------------------
# Registration
# ---------------------------------------------------------------------------


async def register(
    db: AsyncSession,
    *,
    email: str,
    password: str,
    booking_reference: str,
    first_name: str,
    last_name: str,
) -> User:
    """Create a new portal account and link it to an existing booking.

    The booking must:
      - exist (looked up by `booking_number`)
      - not already be linked to a user

    The email must not already be in use.

    On success the booking is updated with `user_id` so future portal logins
    can look up the booking by user.
    """
    normalised_email = email.lower().strip()

    try:
        booking_number = int(booking_reference.strip())
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking reference must be the number from your confirmation email.",
        )

    booking = await db.get(Booking, booking_number)
    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="We could not find a booking with that reference.",
        )
    if booking.user_id is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This booking is already linked to a portal account. Please sign in instead.",
        )

    existing = await db.execute(select(User).where(User.email == normalised_email))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account already exists for that email.",
        )

    user = User(
        email=normalised_email,
        password_hash=hash_password(password),
        hash_algorithm="bcrypt",
        first_name=first_name.strip(),
        last_name=last_name.strip(),
    )
    db.add(user)
    await db.flush()  # populate user.user_id before we link the booking

    booking.user_id = user.user_id
    log.info(
        "New portal account registered user_id=%s booking=%s", user.user_id, booking_number
    )
    return user


# ---------------------------------------------------------------------------
# Password reset
# ---------------------------------------------------------------------------


async def issue_password_reset(db: AsyncSession, *, email: str) -> None:
    """Create a password reset token for the given email if it exists.

    Always returns silently. Never reveal whether the email matched a user —
    enumeration prevention.
    """
    result = await db.execute(select(User).where(User.email == email.lower()))
    user = result.scalar_one_or_none()
    if user is None:
        log.info("Password reset requested for unknown email: %s", _redact_email(email))
        return

    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.password_reset_ttl_minutes
    )
    db.add(
        PasswordReset(
            user_id=user.user_id,
            token=token,
            expires_at=expires_at,
        )
    )

    reset_url = f"{settings.frontend_url}/reset-password?token={token}"
    await email_service.send_password_reset(to=user.email, reset_url=reset_url)


async def consume_password_reset(
    db: AsyncSession, *, token: str, new_password: str
) -> User:
    """Mark the token used and set the user's new password."""
    result = await db.execute(select(PasswordReset).where(PasswordReset.token == token))
    reset = result.scalar_one_or_none()
    if reset is None or reset.used_at is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset link",
        )
    if reset.expires_at <= datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset link",
        )

    user = await db.get(User, reset.user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset link",
        )

    user.password_hash = hash_password(new_password)
    user.hash_algorithm = "bcrypt"
    reset.used_at = datetime.now(timezone.utc)
    return user


# ---------------------------------------------------------------------------
# Change password
# ---------------------------------------------------------------------------


async def change_password(
    db: AsyncSession,
    *,
    user: User,
    current_password: str,
    new_password: str,
) -> None:
    """Verify current password, then set new hash. Raises 401 if mismatch."""
    if not verify_password(current_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect",
        )
    user.password_hash = hash_password(new_password)
    user.hash_algorithm = "bcrypt"


# ---------------------------------------------------------------------------
# Change email
# ---------------------------------------------------------------------------


async def issue_email_change(
    db: AsyncSession, *, user: User, new_email: str
) -> None:
    """Create a pending email-change row and send a confirmation link.

    Per the handoff: the link is sent to the NEW email. The change only
    applies when the link is clicked.
    """
    new_email = new_email.lower()

    existing = await db.execute(select(User).where(User.email == new_email))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="That email is already in use",
        )

    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.email_change_ttl_minutes
    )
    db.add(
        EmailChangeConfirmation(
            user_id=user.user_id,
            new_email=new_email,
            token=token,
            expires_at=expires_at,
        )
    )

    confirm_url = f"{settings.frontend_url}/confirm-email?token={token}"
    await email_service.send_email_change_confirmation(
        to=new_email, confirm_url=confirm_url
    )


async def confirm_email_change(db: AsyncSession, *, token: str) -> User:
    """Apply a pending email change."""
    result = await db.execute(
        select(EmailChangeConfirmation).where(EmailChangeConfirmation.token == token)
    )
    pending = result.scalar_one_or_none()
    if pending is None or pending.confirmed_at is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired confirmation link",
        )
    if pending.expires_at <= datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired confirmation link",
        )

    user = await db.get(User, pending.user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired confirmation link",
        )

    user.email = pending.new_email
    pending.confirmed_at = datetime.now(timezone.utc)
    return user


def _redact_email(email: str) -> str:
    """Return a masked email suitable for logs."""
    if "@" not in email:
        return "***"
    local, domain = email.split("@", 1)
    masked = local[0] + "***" if local else "***"
    return f"{masked}@{domain}"
