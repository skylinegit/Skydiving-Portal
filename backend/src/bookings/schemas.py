"""Pydantic schemas for the bookings API.

Response shape matches the frontend's `BookingDetails` TypeScript interface
in `frontend/src/types/index.ts` so the typed API client maps cleanly.
"""

from datetime import date
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field


ChangeRequestStatus = Literal["editable", "pending"]
BookingStatus = Literal["confirmed", "pending", "cancelled", "completed", "active"]


class VenueChangeRequest(BaseModel):
    status: ChangeRequestStatus
    requested: dict[str, str] | None = None  # { venueId, venueName } when pending


class DatesChangeRequest(BaseModel):
    status: ChangeRequestStatus
    requested: dict[str, str | None] | None = None  # { date1, date2 } when pending


class BookingResponse(BaseModel):
    """Booking detail payload returned by GET /bookings/me."""

    bookingDate: str
    bookingRef: str
    charity: str
    status: str
    venueId: str
    venueName: str
    date1: str
    date2: str | None = None
    jumpCost: Decimal
    fundraisingMinimum: Decimal | None = None
    amountRaised: Decimal
    isCharityJump: bool
    hasPaid: bool
    venueChangeRequest: VenueChangeRequest
    datesChangeRequest: DatesChangeRequest


# ---- Change-request request bodies ----


class VenueChangeRequestBody(BaseModel):
    new_venue_id: int = Field(gt=0)


class DatesChangeRequestBody(BaseModel):
    date1: date
    date2: date | None = None


# ---- Venue list ----


class VenueSummary(BaseModel):
    """Lightweight venue record used by the venue picker on the portal.

    `slug` is the kebab-cased venue name and matches the file name in
    `frontend/src/content/airfields/{slug}.ts` so the frontend can cross-link
    to the matching airfield content. The numeric `id` is what the backend
    expects when the user submits a venue change.
    """

    id: int
    name: str
    slug: str
    region: str | None = None
