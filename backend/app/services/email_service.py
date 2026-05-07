import os
import smtplib
from email.message import EmailMessage


def send_email(to_email: str, subject: str, body: str):
    email_host = os.getenv("EMAIL_HOST")
    email_port = int(os.getenv("EMAIL_PORT", "587"))
    email_username = os.getenv("EMAIL_USERNAME")
    email_password = os.getenv("EMAIL_PASSWORD")
    email_from = os.getenv("EMAIL_FROM", email_username)

    if not email_host or not email_username or not email_password:
        raise Exception(
            "Email service is not configured. Please set EMAIL_HOST, EMAIL_USERNAME, and EMAIL_PASSWORD."
        )

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = email_from
    message["To"] = to_email
    message.set_content(body)

    with smtplib.SMTP(email_host, email_port) as smtp:
        smtp.starttls()
        smtp.login(email_username, email_password)
        smtp.send_message(message)


def send_registration_verification_email(to_email: str, full_name: str, otp: str):
    subject = "MedInsight AI Email Verification Code"

    body = f"""
Hello {full_name},

Welcome to MedInsight AI.

Your email verification code is:

{otp}

This code will expire in 10 minutes.

Please enter this code in the verification page to activate your account.

If you did not create this account, please ignore this email.

Regards,
MedInsight AI Team
"""

    send_email(to_email=to_email, subject=subject, body=body)


def send_password_reset_email(to_email: str, full_name: str, reset_link: str):
    subject = "MedInsight AI Password Reset Link"

    body = f"""
Hello {full_name},

We received a request to reset your MedInsight AI account password.

Please click the link below to reset your password:

{reset_link}

This link will expire in 15 minutes.

If you did not request a password reset, please ignore this email.

Regards,
MedInsight AI Team
"""

    send_email(to_email=to_email, subject=subject, body=body)