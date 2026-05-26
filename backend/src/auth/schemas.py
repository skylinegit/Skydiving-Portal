"""Pydantic request and response schemas for the auth endpoints."""

from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


class RegisterRequest(BaseModel):
    """Body for POST /auth/register.

    A booking reference is required: a portal account is only ever created
    for someone who has already booked a skydive. The reference is the
    `booking_number` integer printed on the customer's confirmation email.
    """

    email: EmailStr
    password: str = Field(min_length=8, max_length=200)
    booking_reference: str = Field(min_length=1, max_length=64)
    first_name: str = Field(min_length=1, max_length=80)
    last_name: str = Field(min_length=1, max_length=80)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=10)
    new_password: str = Field(min_length=8, max_length=200)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1)
    new_password: str = Field(min_length=8, max_length=200)


class ChangeEmailRequest(BaseModel):
    new_email: EmailStr


class ConfirmEmailChangeRequest(BaseModel):
    token: str = Field(min_length=10)


class LoginResponse(BaseModel):
    user_id: int
    email: EmailStr
    first_name: str | None = None
    last_name: str | None = None


class MessageResponse(BaseModel):
    message: str


class SessionInfo(BaseModel):
    user_id: int
    email: EmailStr
