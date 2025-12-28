"""
Service layer for Azure Functions
Provides centralized client management, response building, and validation
"""

from .client_manager import ClientManager
from .response_builder import ResponseBuilder
from .validators import (
    validate_required_fields,
    validate_email,
    validate_url,
    validate_amount,
    normalize_string,
)
from .helpers import send_email_smtp, save_to_cosmos

__all__ = [
    "ClientManager",
    "ResponseBuilder",
    "validate_required_fields",
    "validate_email",
    "validate_url",
    "validate_amount",
    "normalize_string",
    "send_email_smtp",
    "save_to_cosmos",
]
