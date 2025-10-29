"""
Helper functions for common operations
Email sending and database operations
"""

import logging
import smtplib
import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import azure.cosmos as cosmos


def send_email_smtp(
    zoho_email: str, zoho_password: str, to_email: str, subject: str, body: str
) -> bool:
    """
    Send email via Zoho SMTP

    Args:
        zoho_email: Zoho sender email
        zoho_password: Zoho password
        to_email: Recipient email
        subject: Email subject
        body: Email body (plain text)

    Returns:
        True if email sent successfully, False otherwise
    """
    if not zoho_email or not zoho_password:
        logging.error("ZOHO_EMAIL and ZOHO_PASSWORD must be configured")
        return False

    try:
        msg = MIMEMultipart()
        msg["From"] = zoho_email
        msg["To"] = to_email
        msg["Subject"] = subject

        msg.attach(MIMEText(body, "plain"))

        # Use context manager to ensure SMTP connection is always closed
        with smtplib.SMTP("smtp.zoho.eu", 587) as server:
            server.starttls()
            server.login(zoho_email, zoho_password)
            text = msg.as_string()
            server.sendmail(zoho_email, to_email, text)

        logging.info(f"Email sent successfully to {to_email}")
        return True

    except (smtplib.SMTPAuthenticationError, smtplib.SMTPConnectError, OSError) as e:
        logging.error(f"Failed to send email: {e}")
        return False


def save_to_cosmos(container_client, data: Dict[str, Any]) -> Optional[str]:
    """
    Save data to Cosmos DB with auto-generated ID and timestamp

    Args:
        container_client: Cosmos DB container client
        data: Data dictionary to save

    Returns:
        Document ID if successful, None if failed
    """
    try:
        # Add metadata
        data["id"] = str(uuid.uuid4())
        data["timestamp"] = datetime.utcnow().isoformat()

        # Save to Cosmos
        container_client.create_item(body=data)

        logging.info(f"Data saved to Cosmos DB with ID: {data['id']}")
        return data["id"]

    except (cosmos.exceptions.CosmosHttpResponseError, OSError, ValueError) as e:
        logging.error(f"Failed to save to Cosmos DB: {e}")
        return None
