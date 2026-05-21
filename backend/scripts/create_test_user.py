"""Create or update the development test user, plus all the related rows
the portal needs to show a meaningful dashboard:

- a venue (Headcorn)
- a charity (Skyline — the in-house placeholder used for self-funded jumps)
- a charity_code (SKYLINE-SELF) with deposit £70, sponsorship target £0
- a booking that matches `MOCK_BOOKING` in frontend/src/lib/mock-data.ts so the
  authed dashboard renders identical data to the old mock mode

The portal is post-booking, so a user without a booking has nothing to do.
This script is the canonical way to seed a usable test account.

Usage:
    poetry run python -m scripts.create_test_user

Idempotent — re-running updates the existing rows in place.
"""

import asyncio
from datetime import date, datetime, timezone
from decimal import Decimal

from sqlalchemy import select, text

from src.auth.password import hash_password
from src.bookings.models import Booking, Charity, CharityCode, Venue
from src.db import AsyncSessionLocal
from src.users.models import User

TEST_EMAIL = "test@skylineevents.co.uk"
TEST_PASSWORD = "Skydive2025!"

# Mirrors MOCK_BOOKING in frontend/src/lib/mock-data.ts.
MOCK_BOOKING_NUMBER = 24087482
MOCK_BOOKING_DATE = date(2025, 11, 12)
MOCK_EVENT_DATE_1 = date(2026, 6, 2)
MOCK_EVENT_DATE_2 = date(2026, 6, 24)
MOCK_BOOKING_STATUS = "confirmed"
MOCK_VENUE_NAME = "Headcorn"
MOCK_VENUE_PRICE = Decimal("299.00")


async def main() -> None:
    async with AsyncSessionLocal() as db:
        # ----- User -----
        result = await db.execute(select(User).where(User.email == TEST_EMAIL))
        user = result.scalar_one_or_none()
        if user is None:
            user = User(
                email=TEST_EMAIL,
                password_hash=hash_password(TEST_PASSWORD),
                hash_algorithm="bcrypt",
                first_name="Test",
                last_name="Jumper",
                dob=date(1995, 3, 14),
                gender="male",
                phone_number="07700 900000",
                address_1="1 Sample Lane",
                town="Maidstone",
                county="Kent",
                postcode="ME17 1SP",
                height_cm=Decimal("183.00"),
                weight_kg=Decimal("78.00"),
                terms_agreed_at=datetime.now(timezone.utc),
            )
            db.add(user)
            await db.flush()
            print(f"Created user: {TEST_EMAIL}")
        else:
            user.password_hash = hash_password(TEST_PASSWORD)
            user.hash_algorithm = "bcrypt"
            print(f"Updated existing user: {TEST_EMAIL}")

        # ----- Venue (Headcorn) -----
        result = await db.execute(select(Venue).where(Venue.venue_name == MOCK_VENUE_NAME))
        venue = result.scalar_one_or_none()
        if venue is None:
            venue = Venue(
                venue_name=MOCK_VENUE_NAME,
                venue_price=MOCK_VENUE_PRICE,
                address_1="Headcorn Aerodrome",
                address_2="Shenley Road",
                town="Ashford",
                county="Kent",
                postcode="TN27 9HX",
            )
            db.add(venue)
            await db.flush()
            print(f"Created venue: Headcorn (venue_id={venue.venue_id})")
        else:
            venue.venue_price = MOCK_VENUE_PRICE  # keep price in sync with mock

        # ----- Charity (Skyline placeholder for self-funded) -----
        result = await db.execute(select(Charity).where(Charity.charity_name == "Skyline"))
        charity = result.scalar_one_or_none()
        if charity is None:
            charity = Charity(
                charity_name="Skyline",
                address_1="Skyline Skydiving Ltd",
                town="London",
                county="Greater London",
            )
            db.add(charity)
            await db.flush()
            print(f"Created charity: Skyline (charity_id={charity.charity_id})")

        # ----- Charity code (self-funded variant) -----
        result = await db.execute(
            select(CharityCode).where(CharityCode.charity_code == "SKYLINE-SELF")
        )
        code = result.scalar_one_or_none()
        if code is None:
            code = CharityCode(
                charity_code="SKYLINE-SELF",
                charity_id=charity.charity_id,
                deposit=Decimal("70.00"),
                sponsorship_target=Decimal("0.00"),
                valid_from=date(2024, 1, 1),
                valid_to=None,
            )
            db.add(code)
            await db.flush()
            print("Created charity_code: SKYLINE-SELF (self-funded variant)")

        # ----- Booking (matches MOCK_BOOKING) -----
        # Look up by the well-known mock booking number so re-runs hit the same row.
        result = await db.execute(
            select(Booking).where(Booking.booking_number == MOCK_BOOKING_NUMBER)
        )
        booking = result.scalar_one_or_none()

        if booking is None:
            booking = Booking(
                booking_number=MOCK_BOOKING_NUMBER,
                user_id=user.user_id,
                venue_id=venue.venue_id,
                charity_id=charity.charity_id,
                charity_code=code.charity_code,
                booking_date=MOCK_BOOKING_DATE,
                event_date=MOCK_EVENT_DATE_1,
                booking_status=MOCK_BOOKING_STATUS,
                original_date_request_1=MOCK_EVENT_DATE_1,
                original_date_request_2=MOCK_EVENT_DATE_2,
                date_change_pending=False,
                venue_change_pending=False,
                phone_at_booking=user.phone_number,
                address_1_at_booking=user.address_1,
                town_at_booking=user.town,
                county_at_booking=user.county,
                postcode_at_booking=user.postcode,
                height_cm_at_booking=user.height_cm,
                weight_kg_at_booking=user.weight_kg,
                price_paid=Decimal("0.00"),
                marketing_source="seed",
                notes="Auto-generated by scripts/create_test_user.py — matches MOCK_BOOKING",
                terms_agreed_at=user.terms_agreed_at,
            )
            db.add(booking)
            await db.flush()
            print(
                f"Created booking #{booking.booking_number} at {venue.venue_name} on {booking.event_date}"
            )

            # Advance the IDENTITY sequence so future auto-generated booking_numbers
            # don't collide with the explicit one we just inserted.
            await db.execute(
                text(
                    "SELECT setval("
                    "  pg_get_serial_sequence('bookings', 'booking_number'),"
                    f"  {MOCK_BOOKING_NUMBER},"
                    "  true"
                    ")"
                )
            )
        else:
            # Re-run: keep fields in sync with the mock in case anything drifted.
            booking.user_id = user.user_id
            booking.venue_id = venue.venue_id
            booking.charity_id = charity.charity_id
            booking.charity_code = code.charity_code
            booking.booking_date = MOCK_BOOKING_DATE
            booking.event_date = MOCK_EVENT_DATE_1
            booking.booking_status = MOCK_BOOKING_STATUS
            booking.original_date_request_1 = MOCK_EVENT_DATE_1
            booking.original_date_request_2 = MOCK_EVENT_DATE_2
            booking.new_date_request_1 = None
            booking.new_date_request_2 = None
            booking.new_venue_request = None
            booking.date_change_pending = False
            booking.venue_change_pending = False
            print(f"Updated booking #{booking.booking_number} to match MOCK_BOOKING")

        await db.commit()

        print()
        print("--- Seed complete ---")
        print(f"  Email:       {TEST_EMAIL}")
        print(f"  Password:    {TEST_PASSWORD}")
        print(f"  Venue:       {venue.venue_name} (id={venue.venue_id})")
        print(f"  Charity:     {charity.charity_name} ({code.charity_code})")
        print(f"  Booking ref: {booking.booking_number}")
        print(f"  Booked on:   {booking.booking_date}")
        print(f"  Jump dates:  {booking.original_date_request_1} / {booking.original_date_request_2}")
        print(f"  Status:      {booking.booking_status}")
        print(f"  Jump cost:   £{venue.venue_price}")
        print()
        print("Sign in at http://localhost:3000/login")


if __name__ == "__main__":
    asyncio.run(main())
