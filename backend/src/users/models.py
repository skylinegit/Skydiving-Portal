"""User ORM model.

Maps directly to the `users` table from the schema migration. Profile fields
live inline on this row per the handoff data model (no separate
`user_profiles` table).
"""

from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, Integer, Numeric, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from ..db import Base


class User(Base):
    __tablename__ = "users"

    user_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    # Identity / auth
    email: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    # `phpass` for WordPress-imported users until first successful login, then
    # silently re-hashed to `bcrypt`. See auth/password.py.
    hash_algorithm: Mapped[str] = mapped_column(Text, nullable=False)

    # Personal
    first_name: Mapped[str | None] = mapped_column(Text, nullable=True)
    last_name: Mapped[str | None] = mapped_column(Text, nullable=True)
    dob: Mapped[date | None] = mapped_column(Date, nullable=True)
    gender: Mapped[str | None] = mapped_column(Text, nullable=True)
    phone_number: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Address (UK)
    address_1: Mapped[str | None] = mapped_column(Text, nullable=True)
    address_2: Mapped[str | None] = mapped_column(Text, nullable=True)
    town: Mapped[str | None] = mapped_column(Text, nullable=True)
    county: Mapped[str | None] = mapped_column(Text, nullable=True)
    postcode: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Stored metric. Frontend displays imperial.
    height_cm: Mapped[Decimal | None] = mapped_column(Numeric, nullable=True)
    weight_kg: Mapped[Decimal | None] = mapped_column(Numeric, nullable=True)

    fundraising_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    terms_agreed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
