"""Transactional email integration.

Sends mail via plain SMTP using Python's stdlib `smtplib`, wrapped in
`asyncio.to_thread` so the FastAPI event loop is never blocked. Transactional
volumes for this portal are tiny (a handful per day) so a dedicated async
SMTP library would be over-engineering.

Configuration is read from `settings`:

  SMTP_HOST       — e.g. smtp.gmail.com / smtp.office365.com / mail.your-host.com
  SMTP_PORT       — 587 for STARTTLS, 465 for implicit TLS
  SMTP_USERNAME   — usually the full mailbox address (myskydive@skylineevents.co.uk)
  SMTP_PASSWORD   — provider password or app password
  SMTP_FROM       — the From: header on outgoing mail
  SMTP_USE_TLS    — STARTTLS (default true, pair with port 587)
  SMTP_USE_SSL    — implicit TLS (set true with port 465 instead)

If `SMTP_HOST` is left blank the integration logs the message to stdout
instead of sending. That keeps local development friction-free.
"""

import asyncio
import logging
import smtplib
import ssl
from email.message import EmailMessage
from email.utils import formataddr
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


# ---------------------------------------------------------------------------
# Transport
# ---------------------------------------------------------------------------


def _build_message(*, to: str, subject: str, body: str) -> EmailMessage:
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = formataddr((settings.smtp_from_name, settings.smtp_from))
    msg["To"] = to
    if settings.smtp_reply_to:
        msg["Reply-To"] = settings.smtp_reply_to
    msg.set_content(body)
    return msg


def _send_smtp_sync(msg: EmailMessage) -> None:
    """Blocking SMTP send. Runs inside `asyncio.to_thread`."""
    context = ssl.create_default_context()

    if settings.smtp_use_ssl:
        # Implicit TLS (e.g. port 465).
        with smtplib.SMTP_SSL(
            settings.smtp_host, settings.smtp_port, context=context, timeout=30
        ) as client:
            if settings.smtp_username:
                client.login(settings.smtp_username, settings.smtp_password)
            client.send_message(msg)
        return

    # STARTTLS path (e.g. port 587), or plain SMTP if smtp_use_tls is false
    # (only suitable for a local relay).
    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=30) as client:
        client.ehlo()
        if settings.smtp_use_tls:
            client.starttls(context=context)
            client.ehlo()
        if settings.smtp_username:
            client.login(settings.smtp_username, settings.smtp_password)
        client.send_message(msg)


async def _send(*, to: str, subject: str, body: str) -> None:
    """Send a transactional email.

    Falls back to logging the message when `SMTP_HOST` is empty so local
    development does not need a real mail server.
    """
    if not settings.smtp_host:
        log.info(
            "[email-stub] to=%s from=%s subject=%r body=\n%s",
            to,
            settings.smtp_from,
            subject,
            body,
        )
        return

    msg = _build_message(to=to, subject=subject, body=body)
    try:
        await asyncio.to_thread(_send_smtp_sync, msg)
    except Exception:
        # Never leak SMTP internals to the caller. Log and re-raise so the
        # route handler can return a generic 500 if it chooses to.
        log.exception(
            "Failed to send email to=%s from=%s subject=%r",
            to,
            settings.smtp_from,
            subject,
        )
        raise
    log.info(
        "Sent transactional email to=%s from=%s subject=%r",
        to,
        settings.smtp_from,
        subject,
    )
