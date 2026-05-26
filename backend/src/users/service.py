"""User profile update logic.

The frontend posts a partial UserProfile (camelCase). Pydantic has already
mapped that to a `UserProfileUpdate` instance with snake_case fields. This
service applies the diff onto the user row.

Special handling:
- `phone` (frontend) → `phone_number` (DB)
- `sex` (frontend) → `gender` (DB)
- `terms_accepted` (frontend boolean) → `terms_agreed_at` (DB timestamp):
    True  → set to now() if not already set, otherwise leave alone
    False → clear (set to null)
"""

import logging
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from .models import User
from .schemas import UserProfileUpdate

log = logging.getLogger(__name__)


async def update_profile(
    db: AsyncSession, *, user: User, patch: UserProfileUpdate
) -> User:
    """Apply the patch to the user row in place. Caller commits."""
    data = patch.model_dump(exclude_unset=True)

    if "phone" in data:
        user.phone_number = data["phone"]
    if "dob" in data:
        user.dob = data["dob"]
    if "sex" in data:
        user.gender = data["sex"]
    if "fundraising_url" in data:
        user.fundraising_url = data["fundraising_url"]
    if "height_cm" in data:
        user.height_cm = data["height_cm"]
    if "weight_kg" in data:
        user.weight_kg = data["weight_kg"]
    if "terms_accepted" in data:
        if data["terms_accepted"]:
            # Only stamp once — preserve the original timestamp on re-saves.
            if user.terms_agreed_at is None:
                user.terms_agreed_at = datetime.now(timezone.utc)
        else:
            user.terms_agreed_at = None

    log.info(
        "Profile updated for user_id=%s fields=%s",
        user.user_id,
        list(data.keys()),
    )
    return user
