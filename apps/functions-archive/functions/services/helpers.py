"""
Helper functions for common operations
Email sending and database operations
"""

import logging
import os
import smtplib
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from email.mime.text import MIMEText
import azure.cosmos as cosmos
from azure.cosmos import ContainerProxy


def send_email_smtp(
    zoho_email: str,
    zoho_password: str,
    to_email: str,
    subject: str,
    body: str,
    smtp_server: Optional[str] = None,
) -> bool:
    """
    Send email via SMTP server (defaults to Zoho SMTP)

    Args:
        zoho_email: Sender email address
        zoho_password: SMTP password
        to_email: Recipient email
        subject: Email subject
        body: Email body (plain text)
        smtp_server: SMTP server hostname (optional).
            If not provided, reads from ZOHO_SMTP_SERVER environment variable.
            Defaults to "smtp.zoho.eu" if neither is set.

    Returns:
        True if email sent successfully, False otherwise
    """
    if not zoho_email or not zoho_password:
        logging.error("zoho_email and zoho_password must be provided")
        return False

    # Determine SMTP server: parameter > environment variable > default
    if smtp_server is None:
        smtp_server = os.environ.get("ZOHO_SMTP_SERVER", "smtp.zoho.eu")

    try:
        msg = MIMEText(body, "plain")
        msg["From"] = zoho_email
        msg["To"] = to_email
        msg["Subject"] = subject

        # Use context manager to ensure SMTP connection is always closed
        with smtplib.SMTP(smtp_server, 587, timeout=30) as server:
            server.starttls()
            server.login(zoho_email, zoho_password)
            text = msg.as_string()
            server.sendmail(zoho_email, to_email, text)

        logging.info("Email sent successfully")
        return True

    except (smtplib.SMTPException, OSError) as e:
        logging.error(f"Failed to send email: {e}")
        return False


def save_to_cosmos(
    container_client: ContainerProxy, data: Dict[str, Any]
) -> Optional[str]:
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
        document = data.copy()

        # Check for existing id and timestamp keys
        if "id" not in document:
            document["id"] = str(uuid.uuid4())

        if "timestamp" not in document:
            document["timestamp"] = datetime.now(timezone.utc).isoformat()

        # Log if preserving existing keys
        existing_keys = [k for k in ["id", "timestamp"] if k in data]
        if existing_keys:
            logging.warning(
                f"Preserving existing keys in data: {', '.join(existing_keys)}"
            )

        # Save to Cosmos
        container_client.create_item(body=document)

        logging.info(f"Data saved to Cosmos DB with ID: {document['id']}")
        return document["id"]

    except (cosmos.exceptions.CosmosHttpResponseError, OSError) as e:
        logging.error(f"Failed to save to Cosmos DB: {e}")
        return None
