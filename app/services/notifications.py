"""
Push notifications for high-risk invoices. Both channels are optional and
best-effort: if nothing is configured, this quietly no-ops and the alert
still shows up in the audit trail and GET /dashboard/alerts. If a channel
IS configured but the send fails (bad webhook, unreachable SMTP host, no
network), we catch it and move on — a notification failure must never take
down the invoice pipeline.
"""
import logging
import smtplib
from email.mime.text import MIMEText

from app.config import settings

logger = logging.getLogger("invoiceguard.notifications")


def _send_slack(message: str) -> bool:
    if not settings.SLACK_WEBHOOK_URL:
        return False
    try:
        import requests

        resp = requests.post(settings.SLACK_WEBHOOK_URL, json={"text": message}, timeout=5)
        resp.raise_for_status()
        return True
    except Exception as e:
        logger.warning("Slack alert failed: %s", e)
        return False


def _send_email(subject: str, message: str) -> bool:
    if not (settings.SMTP_HOST and settings.ALERT_EMAIL_TO):
        return False
    try:
        msg = MIMEText(message)
        msg["Subject"] = subject
        msg["From"] = settings.ALERT_EMAIL_FROM or "invoiceguard@example.com"
        msg["To"] = settings.ALERT_EMAIL_TO

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=5) as server:
            server.starttls()
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(msg["From"], [settings.ALERT_EMAIL_TO], msg.as_string())
        return True
    except Exception as e:
        logger.warning("Email alert failed: %s", e)
        return False


def notify_high_risk_invoice(
    invoice_number: str,
    vendor_name: str | None,
    amount: float | None,
    flags: list[str],
) -> dict:
    """Fires whichever channels are configured. Returns what actually sent,
    so callers/tests can tell "not configured" apart from "configured but
    failed" without raising in either case.
    """
    flag_text = "; ".join(flags) if flags else "no specific flags"
    amount_text = f"${amount:,.2f}" if amount is not None else "unknown amount"
    message = (
        f"High-risk invoice {invoice_number} ({vendor_name or 'unknown vendor'}, {amount_text})\n"
        f"Flags: {flag_text}"
    )

    sent_slack = _send_slack(message)
    sent_email = _send_email(f"[InvoiceGuard] High-risk invoice {invoice_number}", message)

    return {
        "slack_configured": bool(settings.SLACK_WEBHOOK_URL),
        "slack_sent": sent_slack,
        "email_configured": bool(settings.SMTP_HOST and settings.ALERT_EMAIL_TO),
        "email_sent": sent_email,
    }
