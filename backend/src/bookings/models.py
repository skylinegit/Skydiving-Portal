"""SQLAlchemy models for bookings and their related lookup tables.

Mirrors the handoff data model — bookings carry FKs to venues, charities and
charity_codes, plus the change-request fields and the snapshot of personal
data captured at booking time.
"""

from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from ..db import Base


class Venue(Base):
    __tablename__ = "venues"

    venue_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    venue_name: Mapped[str] = mapped_column(Text, nullable=False)
    venue_price: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    address_1: Mapped[str | None] = mapped_column(Text, nullable=True)
    address_2: Mapped[str | None] = mapped_column(Text, nullable=True)
    town: Mapped[str | None] = mapped_column(Text, nullable=True)
    county: Mapped[str | None] = mapped_column(Text, nullable=True)
    postcode: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class Charity(Base):
    __tablename__ = "charities"

    charity_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    charity_name: Mapped[str] = mapped_column(Text, nullable=False)
    address_1: Mapped[str | None] = mapped_column(Text, nullable=True)
    address_2: Mapped[str | None] = mapped_column(Text, nullable=True)
    town: Mapped[str | None] = mapped_column(Text, nullable=True)
    county: Mapped[str | None] = mapped_column(Text, nullable=True)
    postcode: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class CharityCode(Base):
    __tablename__ = "charity_codes"

    charity_code: Mapped[str] = mapped_column(Text, primary_key=True)
    charity_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("charities.charity_id"), nullable=False
    )
    deposit: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    sponsorship_target: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    valid_from: Mapped[date] = mapped_column(Date, nullable=False)
    valid_to: Mapped[date | None] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class Booking(Base):
    __tablename__ = "bookings"

    booking_number: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.user_id"), nullable=False
    )
    venue_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("venues.venue_id"), nullable=True
    )
    charity_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("charities.charity_id"), nullable=True
    )
    charity_code: Mapped[str | None] = mapped_column(
        Text, ForeignKey("charity_codes.charity_code"), nullable=True
    )

    booking_date: Mapped[date] = mapped_column(Date, nullable=False)
    event_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    booking_status: Mapped[str] = mapped_column(Text, nullable=False, default="active")

    # ----- Change-request flow (independent date + venue flags) -----
    original_date_request_1: Mapped[date | None] = mapped_column(Date, nullable=True)
    original_date_request_2: Mapped[date | None] = mapped_column(Date, nullable=True)
    new_date_request_1: Mapped[date | None] = mapped_column(Date, nullable=True)
    new_date_request_2: Mapped[date | None] = mapped_column(Date, nullable=True)
    new_venue_request: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("venues.venue_id"), nullable=True
    )
    date_change_pending: Mapped[bool | None] = mapped_column(
        Boolean, nullable=True, default=False
    )
    venue_change_pending: Mapped[bool | None] = mapped_column(
        Boolean, nullable=True, default=False
    )

    # ----- Snapshot of user data at booking time (audit/safety) -----
    phone_at_booking: Mapped[str | None] = mapped_column(Text, nullable=True)
    address_1_at_booking: Mapped[str | None] = mapped_column(Text, nullable=True)
    address_2_at_booking: Mapped[str | None] = mapped_column(Text, nullable=True)
    town_at_booking: Mapped[str | None] = mapped_column(Text, nullable=True)
    county_at_booking: Mapped[str | None] = mapped_column(Text, nullable=True)
    postcode_at_booking: Mapped[str | None] = mapped_column(Text, nullable=True)
    height_cm_at_booking: Mapped[Decimal | None] = mapped_column(Numeric, nullable=True)
    weight_kg_at_booking: Mapped[Decimal | None] = mapped_column(Numeric, nullable=True)

    price_paid: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    marketing_source: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    terms_agreed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
