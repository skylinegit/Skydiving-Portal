"""Booking HTTP routes.

GET /bookings/me — the current user's booking (most recent if many).
POST /bookings/me/venue-change-request — submit a venue change (sets pending flag).
POST /bookings/me/dates-change-request — submit a dates change (sets pending flag).

In production the change-request endpoints also call the N8N webhook to
write into the MS SQL CRM. That's not wired yet; the TODO lives in
`bookings.service`.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..deps import get_current_user, get_db
from ..users.models import User
from . import service
from .schemas import (
    BookingResponse,
    DatesChangeRequestBody,
    VenueChangeRequestBody,
    VenueSummary,
)

router = APIRouter(prefix="/bookings/me", tags=["bookings"])
venues_router = APIRouter(prefix="/venues", tags=["venues"])


@venues_router.get(
    "",
    response_model=list[VenueSummary],
    status_code=status.HTTP_200_OK,
    summary="List every venue (used by the venue change picker)",
)
async def list_venues(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[VenueSummary]:
    return await service.list_venues(db)


@router.get(
    "",
    response_model=BookingResponse,
    status_code=status.HTTP_200_OK,
    summary="Get the current user's booking",
)
async def get_my_booking(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BookingResponse:
    return await service.get_my_booking(db, user=current_user)


@router.post(
    "/venue-change-request",
    response_model=BookingResponse,
    summary="Request a venue change (sets venue_change_pending=true)",
)
async def request_venue_change(
    payload: VenueChangeRequestBody,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BookingResponse:
    result = await service.submit_venue_change(
        db, user=current_user, new_venue_id=payload.new_venue_id
    )
    await db.commit()
    return result


@router.post(
    "/dates-change-request",
    response_model=BookingResponse,
    summary="Request a dates change (sets date_change_pending=true)",
)
async def request_dates_change(
    payload: DatesChangeRequestBody,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BookingResponse:
    result = await service.submit_dates_change(
        db, user=current_user, date1=payload.date1, date2=payload.date2
    )
    await db.commit()
    return result
