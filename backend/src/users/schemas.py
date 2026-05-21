"""Pydantic schemas for the user endpoints.

`UserPublic` is the response shape (GET /me). `UserProfileUpdate` is the
request body for PATCH /me/profile — it accepts camelCase keys via Pydantic's
alias generator so the frontend can post its `UserProfile` shape directly.

Heights and weights are exposed in METRIC. Conversion to imperial happens
in the frontend (per the handoff).
"""

from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr
from pydantic.alias_generators import to_camel


class UserPublic(BaseModel):
    """User profile returned by GET /me. Never includes the password hash."""

    model_config = ConfigDict(from_attributes=True)

    user_id: int
    email: EmailStr
    first_name: str | None = None
    last_name: str | None = None
    dob: date | None = None
    gender: str | None = None
    phone_number: str | None = None
    address_1: str | None = None
    address_2: str | None = None
    town: str | None = None
    county: str | None = None
    postcode: str | None = None
    height_cm: Decimal | None = None
    weight_kg: Decimal | None = None
    fundraising_url: str | None = None
    terms_agreed_at: datetime | None = None


class UserProfileUpdate(BaseModel):
    """Request body for PATCH /me/profile.

    All fields optional — only the ones the user actually changed are sent.
    The alias generator lets the frontend send camelCase (`phoneNumber`,
    `fundraisingUrl`, `heightCm`, `weightKg`, `termsAccepted`) while the
    internal Python names stay snake_case.
    """

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        extra="forbid",
    )

    phone: str | None = None
    dob: date | None = None
    sex: str | None = None
    fundraising_url: str | None = None
    height_cm: Decimal | None = None
    weight_kg: Decimal | None = None
    terms_accepted: bool | None = None
