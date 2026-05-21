"""Transactional email integration.

This is a stub. In production, swap the body of `_send` for an SMTP client
or a transactional provider (Postmark, SendGrid, AWS SES, …). The public
functions in this module are the only API the rest of the app should
consume — that way the provider can change without touching call sites.
"""

import logging
from textwrap import dedent

from ..config import settings

log = logging.getLogger(__name__)


async def send_password_reset(*, to: str, reset_url: str) -> None:
    """Send the password-reset link."""
    body = dedent(
        f"""
        Hi,

        Someone (hopefully you) asked to reset your Skyline Skydiving portal
        password. Click the link below to set a new one. The link expires
        in {settings.password_reset_ttl_minutes} minutes.

            {reset_url}

        If you did not ask for this, you can safely ignore this email.

        Thanks,
        The Skyline team
        """
    ).strip()
    await _send(to=to, subject="Reset your Skyline portal password", body=body)


async def send_email_change_confirmation(*, to: str, confirm_url: str) -> None:
    """Send the email-change confirmation link to the NEW address."""
    body = dedent(
        f"""
        Hi,

        We received a request to change the email on your Skyline Skydiving
        portal account to this address. Click the link below to confirm.
        The link expires in {settings.email_change_ttl_minutes} minutes.

            {confirm_url}

        If you did not ask for this, you can safely ignore this email.

        Thanks,
        The Skyline team
        """
    ).strip()
    await _send(to=to, subject="Confirm your new Skyline portal email", body=body)


async def _send(*, to: str, subject: str, body: str) -> None:
    """Real provider call goes here. For now: log to stdout."""
    # In production, replace with an SMTP / Postmark / SES call.
    if settings.is_development or not settings.smtp_host:
        log.info(
            "[email-stub] to=%s subject=%r body=\n%s",
            to,
            subject,
            body,
        )
        return

    # TODO: real provider integration. Keep this single function as the
    # boundary so call sites never change.
    raise NotImplementedError(
        "Transactional email provider not yet configured. "
        "Set SMTP_* in .env or wire a provider in integrations/email.py."
    )
