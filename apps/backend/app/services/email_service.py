import structlog
from app.config import settings

logger = structlog.get_logger(__name__)

class EmailService:
    @staticmethod
    def send_verification_email(email: str, token: str) -> None:
        """
        Mocks sending an email by logging to the console.
        In Phase 5, this will be integrated with SendGrid or AWS SES.
        """
        verify_link = f"{settings.FRONTEND_URL}/verify-email?token={token}"
        
        logger.info(
            "email.send_verification",
            to=email,
            subject="Verify your email address - Studio.ai",
            link=verify_link
        )
        # Mock actual send here
        print(f"\n[{email}] Verify Email Link: {verify_link}\n")

    @staticmethod
    def send_password_reset_email(email: str, token: str) -> None:
        """
        Mocks sending a password reset email by logging to the console.
        """
        reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        
        logger.info(
            "email.send_password_reset",
            to=email,
            subject="Reset your password - Studio.ai",
            link=reset_link
        )
        # Mock actual send here
        print(f"\n[{email}] Password Reset Link: {reset_link}\n")
