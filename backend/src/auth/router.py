"""Auth HTTP routes.

Mounted at `/auth`. All endpoints return JSON. Session is carried in an
HTTP-only cookie set by `/auth/login` and cleared by `/auth/logout`.
"""

from fastapi import APIRouter, Cookie, Depends, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import settings
from ..deps import get_current_user, get_db
from ..users.models import User
from ..users.schemas import UserPublic
from . import service, sessions
from .schemas import (
    ChangeEmailRequest,
    ChangePasswordRequest,
    ConfirmEmailChangeRequest,
    ForgotPasswordRequest,
    LoginRequest,
    MessageResponse,
    RegisterRequest,
    ResetPasswordRequest,
)

router = APIRouter()


@router.post(
    "/login",
    response_model=UserPublic,
    status_code=status.HTTP_200_OK,
    summary="Sign in with email + password",
)
async def login(
    payload: LoginRequest,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> UserPublic:
    """Return the full user payload so the frontend does not need a follow-up
    GET /me round-trip immediately after sign-in."""
    user = await service.authenticate(db, email=payload.email, password=payload.password)
    session = await sessions.create_session(db, user_id=user.user_id, request=request)
    await db.commit()
    sessions.set_session_cookie(response, session.session_id)
    return UserPublic.model_validate(user)


@router.post(
    "/register",
    response_model=UserPublic,
    status_code=status.HTTP_201_CREATED,
    summary="Create a portal account linked to an existing booking",
)
async def register(
    payload: RegisterRequest,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> UserPublic:
    """Register a new portal account.

    Requires a valid booking reference. The new account is linked to that
    booking on success and the user is signed in (session cookie set) so the
    frontend can drop them straight into the portal without a second round
    trip to /auth/login.
    """
    user = await service.register(
        db,
        email=payload.email,
        password=payload.password,
        booking_reference=payload.booking_reference,
        first_name=payload.first_name,
        last_name=payload.last_name,
    )
    session = await sessions.create_session(db, user_id=user.user_id, request=request)
    await db.commit()
    sessions.set_session_cookie(response, session.session_id)
    return UserPublic.model_validate(user)


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Sign out — invalidates the current session",
)
async def logout(
    response: Response,
    db: AsyncSession = Depends(get_db),
    session_cookie: str | None = Cookie(default=None, alias=settings.session_cookie_name),
) -> Response:
    if session_cookie:
        await sessions.delete_session(db, session_cookie)
        await db.commit()
    sessions.clear_session_cookie(response)
    response.status_code = status.HTTP_204_NO_CONTENT
    return response


@router.post(
    "/forgot-password",
    response_model=MessageResponse,
    summary="Send a password reset link to the given email (if it exists)",
)
async def forgot_password(
    payload: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    await service.issue_password_reset(db, email=payload.email)
    await db.commit()
    # Always the same response — never reveal whether the email matched.
    return MessageResponse(
        message="If the email is registered, a reset link has been sent."
    )


@router.post(
    "/reset-password",
    response_model=MessageResponse,
    summary="Set a new password using a reset token",
)
async def reset_password(
    payload: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    await service.consume_password_reset(
        db, token=payload.token, new_password=payload.new_password
    )
    await db.commit()
    return MessageResponse(message="Password updated. Please sign in.")


@router.post(
    "/change-password",
    response_model=MessageResponse,
    summary="Change the signed-in user's password",
)
async def change_password(
    payload: ChangePasswordRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    await service.change_password(
        db,
        user=current_user,
        current_password=payload.current_password,
        new_password=payload.new_password,
    )
    await db.commit()
    return MessageResponse(message="Password changed.")


@router.post(
    "/change-email",
    response_model=MessageResponse,
    summary="Request an email change. Confirmation link is sent to the new address.",
)
async def change_email(
    payload: ChangeEmailRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    await service.issue_email_change(db, user=current_user, new_email=payload.new_email)
    await db.commit()
    return MessageResponse(
        message="Confirmation link sent. Click the link in the new email to apply the change."
    )


@router.post(
    "/confirm-email-change",
    response_model=MessageResponse,
    summary="Apply a pending email change using the token from the confirmation email",
)
async def confirm_email_change(
    payload: ConfirmEmailChangeRequest,
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    await service.confirm_email_change(db, token=payload.token)
    await db.commit()
    return MessageResponse(message="Email address updated.")


@router.post(
    "/logout-others",
    response_model=MessageResponse,
    summary="Sign out every other device for the current user",
)
async def logout_others(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    session_cookie: str | None = Cookie(default=None, alias=settings.session_cookie_name),
) -> MessageResponse:
    keep = session_cookie or ""
    removed = await sessions.delete_other_sessions(
        db, user_id=current_user.user_id, keep_session_id=keep
    )
    await db.commit()
    return MessageResponse(
        message=f"Signed out {removed} other session{'s' if removed != 1 else ''}."
    )
