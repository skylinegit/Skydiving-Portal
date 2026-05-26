"""User HTTP routes.

The participant's profile is exposed at GET /me and editable at PATCH /me/profile.
Account changes (email, password) live under /auth/* on the auth router.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..deps import get_current_user, get_db
from . import service
from .models import User
from .schemas import UserProfileUpdate, UserPublic

router = APIRouter()


@router.get(
    "/me",
    response_model=UserPublic,
    status_code=status.HTTP_200_OK,
    summary="Return the current authenticated user's profile",
)
async def get_me(current_user: User = Depends(get_current_user)) -> UserPublic:
    return UserPublic.model_validate(current_user)


@router.patch(
    "/me/profile",
    response_model=UserPublic,
    status_code=status.HTTP_200_OK,
    summary="Update the current user's profile fields (partial update)",
)
async def update_me_profile(
    payload: UserProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserPublic:
    updated = await service.update_profile(db, user=current_user, patch=payload)
    await db.commit()
    await db.refresh(updated)
    return UserPublic.model_validate(updated)
