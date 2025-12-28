"""
Validators - Input validation helpers for Azure Functions
Provides reusable validation functions with consistent error messages
"""

from typing import Dict, List, Optional, Any
from urllib.parse import urlparse
import logging

from email_validator import validate_email as validate_email_lib, EmailNotValidError


def validate_required_fields(
    data: Dict[str, Any], required_fields: List[str]
) -> Optional[str]:
    """
    Validate that required fields are present and non-empty

    Args:
        data: Dictionary of form data
        required_fields: List of required field names

    Returns:
        Error message if validation fails, None if valid

    Example:
        >>> data = {"name": "John", "email": ""}
        >>> error = validate_required_fields(data, ["name", "email"])
        >>> # Returns: "Tous les champs sont requis"
    """
    missing_fields = []

    for field in required_fields:
        raw_value = data.get(field)  # No default, returns None if missing

        # Handle None explicitly as missing
        if raw_value is None:
            missing_fields.append(field)
        # For strings: trim whitespace and mark as missing if empty after trimming
        elif isinstance(raw_value, str):
            if not raw_value.strip():
                missing_fields.append(field)
        # Non-string values (ints, bools, lists, dicts) are treated as present
        # e.g., numeric 0 and boolean False are valid values, not missing
        # If you need to reject non-strings, add: else: missing_fields.append(field)

    if missing_fields:
        return "Tous les champs sont requis"

    return None


def validate_email(email: Optional[str]) -> bool:
    """
    Validate email format using email-validator library

    Args:
        email: Email address to validate (can be None or empty)

    Returns:
        True if valid, False otherwise

    Example:
        >>> validate_email("user@example.com")
        True
        >>> validate_email("invalid")
        False
        >>> validate_email(None)
        False
        >>> validate_email("")
        False
    """
    if not email:
        return False

    try:
        # Use email-validator library for robust validation
        validate_email_lib(email, check_deliverability=False)
        return True
    except EmailNotValidError:
        return False


def validate_url(url: Optional[str]) -> bool:
    """
    Validate URL format

    Args:
        url: URL to validate (can be None or empty)

    Returns:
        True if valid, False otherwise

    Example:
        >>> validate_url("https://example.com/image.jpg")
        True
        >>> validate_url("not-a-url")
        False
        >>> validate_url(None)
        False
        >>> validate_url("")
        False
    """
    if not url:
        return False

    try:
        result = urlparse(url)
        return all([result.scheme in ("http", "https"), result.netloc])
    except Exception:
        logging.exception("Unexpected error validating URL format")
        return False


def validate_amount(
    amount: int, min_amount: int = 1, max_amount: int = 10000000
) -> Optional[str]:
    """
    Validate payment amount

    Args:
        amount: Amount in cents
        min_amount: Minimum allowed amount (default: 1 cent)
        max_amount: Maximum allowed amount (default: 100k EUR)

    Returns:
        Error message if validation fails, None if valid

    Example:
        >>> validate_amount(5000)  # 50 EUR
        None
        >>> validate_amount(0)
        "Montant invalide"
    """
    # Runtime type validation: must be int, not bool (bool is a subclass of int)
    if not isinstance(amount, int) or isinstance(amount, bool):
        return "Montant invalide"

    if amount < min_amount:
        return "Montant invalide"

    if amount > max_amount:
        return "Montant trop élevé"

    return None


def normalize_string(value: Optional[str], max_length: Optional[int] = None) -> str:
    """
    Normalize string input by trimming whitespace and optionally limiting length

    Note: This function does NOT perform security-related sanitization (e.g., XSS prevention,
    SQL injection prevention). It only handles formatting normalization (trimming and truncation).

    Args:
        value: String to normalize (can be None, returns empty string if None)
        max_length: Optional maximum length (must be a positive integer if provided, truncates if exceeded)

    Returns:
        Normalized string (trimmed and optionally truncated), or empty string if value is None

    Raises:
        ValueError: If max_length is provided and is not a positive integer (> 0)

    Example:
        >>> normalize_string("  Hello World  ", max_length=5)
        "Hello"
        >>> normalize_string(None)
        ""
        >>> normalize_string("  Hello  ", max_length=0)
        ValueError: max_length must be a positive integer (> 0), got 0
    """
    # Handle None explicitly
    if value is None:
        return ""

    # Validate max_length if provided
    if max_length is not None:
        if (
            not isinstance(max_length, int)
            or isinstance(max_length, bool)
            or max_length <= 0
        ):
            raise ValueError(
                f"max_length must be a positive integer (> 0), got {max_length}"
            )

    # Trim whitespace
    normalized = value.strip()

    # Limit length if a valid max_length is specified
    if max_length is not None and len(normalized) > max_length:
        normalized = normalized[:max_length]

    return normalized
