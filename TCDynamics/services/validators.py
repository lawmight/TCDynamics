"""
Validators - Input validation helpers for Azure Functions
Provides reusable validation functions with consistent error messages
"""

import re
from typing import Dict, List, Optional, Any


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
        value = data.get(field, "").strip()
        if not value:
            missing_fields.append(field)

    if missing_fields:
        return "Tous les champs sont requis"

    return None


def validate_email(email: str) -> bool:
    """
    Validate email format

    Args:
        email: Email address to validate

    Returns:
        True if valid, False otherwise

    Example:
        >>> validate_email("user@example.com")
        True
        >>> validate_email("invalid")
        False
    """
    if not email:
        return False

    # Basic email regex pattern
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email))


def validate_url(url: str) -> bool:
    """
    Validate URL format

    Args:
        url: URL to validate

    Returns:
        True if valid, False otherwise

    Example:
        >>> validate_url("https://example.com/image.jpg")
        True
        >>> validate_url("not-a-url")
        False
    """
    if not url:
        return False

    # Basic URL regex pattern
    pattern = r"^https?://.+"
    return bool(re.match(pattern, url))


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
    if amount < min_amount:
        return "Montant invalide"

    if amount > max_amount:
        return "Montant trop élevé"

    return None


def sanitize_string(value: str, max_length: Optional[int] = None) -> str:
    """
    Sanitize string input by trimming and limiting length

    Args:
        value: String to sanitize
        max_length: Optional maximum length

    Returns:
        Sanitized string

    Example:
        >>> sanitize_string("  Hello World  ", max_length=5)
        "Hello"
    """
    if not value:
        return ""

    # Trim whitespace
    sanitized = value.strip()

    # Limit length if specified
    if max_length and len(sanitized) > max_length:
        sanitized = sanitized[:max_length]

    return sanitized
