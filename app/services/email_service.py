import requests

from app.core.config import settings


BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"


def send_password_reset_email(
    recipient_email: str,
    reset_url: str,
) -> None:
    if not settings.brevo_api_key:
        raise RuntimeError("BREVO_API_KEY is not configured")

    if not settings.brevo_sender_email:
        raise RuntimeError("BREVO_SENDER_EMAIL is not configured")

    payload = {
        "sender": {
            "name": settings.brevo_sender_name,
            "email": settings.brevo_sender_email,
        },
        "to": [
            {
                "email": recipient_email,
            }
        ],
        "subject": "Reset your AegisFlow password",
        "textContent": (
            "You requested a password reset for your AegisFlow account.\n\n"
            "Click the link below to reset your password:\n\n"
            f"{reset_url}\n\n"
            "This link expires in 15 minutes and can only be used once.\n\n"
            "If you did not request this password reset, you can safely ignore "
            "this email."
        ),
    }

    response = requests.post(
        BREVO_API_URL,
        headers={
            "accept": "application/json",
            "api-key": settings.brevo_api_key,
            "content-type": "application/json",
        },
        json=payload,
        timeout=15,
    )

    if not response.ok:
        raise RuntimeError(
            f"Brevo email failed: {response.status_code} {response.text}"
        )