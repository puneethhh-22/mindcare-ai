"""
Email service for sending medication reminders and notifications.
Uses aiosmtplib for async email delivery.
"""
import logging
from typing import Optional
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.core.config import settings

logger = logging.getLogger(__name__)


async def send_email(
    to_email: str,
    subject: str,
    html_body: str,
    text_body: Optional[str] = None,
) -> bool:
    """
    Send an email asynchronously.
    Returns True on success, False on failure.
    """
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.warning("Email not configured – skipping send to %s", to_email)
        return False

    try:
        import aiosmtplib

        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = settings.EMAIL_FROM
        message["To"] = to_email

        if text_body:
            message.attach(MIMEText(text_body, "plain"))
        message.attach(MIMEText(html_body, "html"))

        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            start_tls=True,
        )
        logger.info("Email sent to %s: %s", to_email, subject)
        return True

    except Exception as e:
        logger.error("Failed to send email to %s: %s", to_email, e)
        return False


async def send_medication_reminder(
    to_email: str,
    user_name: str,
    medication_name: str,
    dosage: str,
    scheduled_time: str,
) -> bool:
    """Send a medication reminder email."""
    subject = f"💊 Medication Reminder: {medication_name}"
    html_body = f"""
    <div style="font-family: Inter, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
      <div style="background: #6366f1; color: white; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
        <h2 style="margin: 0;">💊 Medication Reminder</h2>
      </div>
      <div style="background: #f8fafc; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;">
        <p>Hi <strong>{user_name}</strong>,</p>
        <p>This is a reminder to take your medication:</p>
        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1e293b;">{medication_name}</p>
          <p style="margin: 4px 0 0; color: #64748b;">{dosage} · Scheduled at {scheduled_time}</p>
        </div>
        <p style="color: #64748b; font-size: 14px;">
          Log in to <a href="#" style="color: #6366f1;">MindCare AI</a> to mark this as taken.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;">
        <p style="color: #94a3b8; font-size: 12px;">
          ⚠️ This is an automated reminder. MindCare AI is not a replacement for
          professional medical advice. Always follow your doctor's instructions.
        </p>
      </div>
    </div>
    """
    return await send_email(to_email, subject, html_body)


async def send_welcome_email(to_email: str, user_name: str) -> bool:
    """Send a welcome email to new users."""
    subject = "Welcome to MindCare AI 🌟"
    html_body = f"""
    <div style="font-family: Inter, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
      <div style="background: linear-gradient(135deg, #6366f1, #14b8a6); color: white; padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">Welcome to MindCare AI</h1>
        <p style="margin: 8px 0 0; opacity: 0.9;">Your intelligent healthcare & wellness companion</p>
      </div>
      <div style="background: #f8fafc; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;">
        <p>Hi <strong>{user_name}</strong>! 👋</p>
        <p>We're so glad you're here. MindCare AI is here to support your mental and physical wellbeing.</p>
        <p><strong>Here's what you can do:</strong></p>
        <ul style="color: #475569; line-height: 1.8;">
          <li>🧠 Chat with our AI for mental health support</li>
          <li>🩺 Check symptoms and get urgency guidance</li>
          <li>💊 Set up medication reminders</li>
          <li>📊 Track your daily wellness metrics</li>
        </ul>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">
          ⚠️ MindCare AI is not a replacement for professional medical advice.
          Always consult a qualified healthcare professional for medical concerns.
        </p>
      </div>
    </div>
    """
    return await send_email(to_email, subject, html_body)
