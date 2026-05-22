"""Booking business logic.

Reads the current user's booking (joined with venue, charity, charity_code),
aggregates payments and sponsorship, and submits change requests.
"""

import logging
from datetime import date
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..users.models import User
from .models import Booking, Charity, CharityCode, Venue
from .schemas import (
    BookingResponse,
    DatesChangeRequest,
    VenueChangeRequest,
    VenueSummary,
)

log = logging.getLogger(__name__)


def venue_slug(name: str) -> str:
    """Derive a stable slug from a venue name so the frontend can match
    against its `content/airfields/{slug}.ts` files."""
    return name.lower().replace(" ", "-")


async def list_venues(db: AsyncSession) -> list[VenueSummary]:
    """Return every venue, sorted by name, for the change-request picker."""
    result = await db.execute(select(Venue).order_by(Venue.venue_name))
    venues = result.scalars().all()
    return [
        VenueSummary(
            id=v.venue_id,
            name=v.venue_name,
            slug=venue_slug(v.venue_name),
            region=v.county,
        )
        for v in venues
    ]


async def get_my_booking(db: AsyncSession, *, user: User) -> BookingResponse:
    """Return the most recent booking for the signed-in user, with the
    related venue, charity, charity_code, and aggregated totals folded in.

    Raises 404 if the user has no booking yet.
    """
    result = await db.execute(
        select(Booking)
        .where(Booking.user_id == user.user_id)
        .order_by(Booking.booking_number.desc())
    )
    booking = result.scalars().first()
    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No booking found for this user",
        )

    venue = (
        await db.get(Venue, booking.venue_id) if booking.venue_id is not None else None
    )
    charity = (
        await db.get(Charity, booking.charity_id)
        if booking.charity_id is not None
        else None
    )
    code = (
        await db.get(CharityCode, booking.charity_code)
        if booking.charity_code is not None
        else None
    )

    # Aggregations (skipped for now — payments and sponsorship_collected
    # tables exist but are not yet written to by the portal).
    paid_total: Decimal = Decimal("0")
    raised_total: Decimal = Decimal("0")

    # Pending venue change → look up the requested venue name
    requested_venue_name: str | None = None
    requested_venue_id: str | None = None
    if booking.venue_change_pending and booking.new_venue_request is not None:
        new_venue = await db.get(Venue, booking.new_venue_request)
        if new_venue is not None:
            requested_venue_name = new_venue.venue_name
            requested_venue_id = venue_slug(new_venue.venue_name)

    venue_change = VenueChangeRequest(
        status="pending" if booking.venue_change_pending else "editable",
        requested=(
            {"venueId": requested_venue_id, "venueName": requested_venue_name}
            if booking.venue_change_pending and requested_venue_id
            else None
        ),
    )

    dates_change = DatesChangeRequest(
        status="pending" if booking.date_change_pending else "editable",
        requested=(
            {
                "date1": _iso(booking.new_date_request_1),
                "date2": _iso(booking.new_date_request_2),
            }
            if booking.date_change_pending
            else None
        ),
    )

    is_charity_jump = bool(code and code.sponsorship_target and code.sponsorship_target > 0)
    jump_cost = venue.venue_price if venue and venue.venue_price else Decimal("0")
    fundraising_minimum = (
        code.sponsorship_target if is_charity_jump and code is not None else None
    )
    has_paid = paid_total >= (jump_cost if jump_cost else Decimal("0")) if jump_cost else False

    return BookingResponse(
        bookingDate=_iso(booking.booking_date) or "",
        bookingRef=str(booking.booking_number),
        charity=charity.charity_name if charity is not None else "Skyline",
        status=booking.booking_status or "active",
        venueId=venue_slug(venue.venue_name) if venue else "",
        venueName=venue.venue_name if venue else "",
        date1=_iso(booking.event_date or booking.original_date_request_1) or "",
        date2=_iso(booking.original_date_request_2),
        jumpCost=jump_cost,
        fundraisingMinimum=fundraising_minimum,
        amountRaised=raised_total,
        isCharityJump=is_charity_jump,
        hasPaid=has_paid,
        venueChangeRequest=venue_change,
        datesChangeRequest=dates_change,
    )


async def submit_venue_change(
    db: AsyncSession, *, user: User, new_venue_id: int
) -> BookingResponse:
    """Set the pending venue-change flag and the requested new venue.

    The frontend immediately shows the field as locked. In production this
    is where we'd also call N8N to write the request to the CRM.
    """
    booking = await _load_current_booking(db, user_id=user.user_id)
    if booking.venue_change_pending:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A venue change is already pending",
        )

    # Verify the target venue exists
    new_venue = await db.get(Venue, new_venue_id)
    if new_venue is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requested venue not found",
        )

    booking.new_venue_request = new_venue_id
    booking.venue_change_pending = True
    # TODO: integrations/n8n.py — POST to the CRM webhook with the change.
    log.info(
        "venue change requested by user_id=%s booking=%s → venue_id=%s",
        user.user_id,
        booking.booking_number,
        new_venue_id,
    )
    return await get_my_booking(db, user=user)


async def submit_dates_change(
    db: AsyncSession,
    *,
    user: User,
    date1: date,
    date2: date | None,
) -> BookingResponse:
    """Set the pending dates-change flag and the requested new dates."""
    booking = await _load_current_booking(db, user_id=user.user_id)
    if booking.date_change_pending:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A dates change is already pending",
        )

    booking.new_date_request_1 = date1
    booking.new_date_request_2 = date2
    booking.date_change_pending = True
    # TODO: integrations/n8n.py — POST to the CRM webhook with the change.
    log.info(
        "dates change requested by user_id=%s booking=%s → %s / %s",
        user.user_id,
        booking.booking_number,
        date1,
        date2,
    )
    return await get_my_booking(db, user=user)


async def _load_current_booking(db: AsyncSession, *, user_id: int) -> Booking:
    result = await db.execute(
        select(Booking)
        .where(Booking.user_id == user_id)
        .order_by(Booking.booking_number.desc())
    )
    booking = result.scalars().first()
    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No booking found for this user",
        )
    return booking


def _iso(d: date | None) -> str | None:
    return d.isoformat() if d is not None else None
