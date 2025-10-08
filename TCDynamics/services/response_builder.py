"""
Response Builder - Utility for creating standardized HTTP responses
Ensures consistent response format across all Azure Functions
"""

import json
import logging
from typing import Any, Dict, Optional
import azure.functions as func


class ResponseBuilder:
    """
    Utility class for building standardized HTTP responses

    Provides consistent response formatting, error handling,
    and logging across all Azure Functions endpoints.
    """

    @staticmethod
    def success(
        message: str,
        data: Optional[Dict[str, Any]] = None,
        status_code: int = 200,
    ) -> func.HttpResponse:
        """
        Create a success response

        Args:
            message: Success message
            data: Optional additional data to include
            status_code: HTTP status code (default: 200)

        Returns:
            HTTP response with success=True

        Example:
            >>> ResponseBuilder.success("Data saved", {"id": "123"})
        """
        response_data = {"success": True, "message": message}

        if data:
            response_data.update(data)

        return func.HttpResponse(
            json.dumps(response_data),
            status_code=status_code,
            mimetype="application/json",
        )

    @staticmethod
    def error(
        message: str,
        status_code: int = 500,
        error_details: Optional[str] = None,
        log_error: bool = True,
    ) -> func.HttpResponse:
        """
        Create an error response

        Args:
            message: Error message to return to client
            status_code: HTTP status code (default: 500)
            error_details: Optional detailed error for logging
            log_error: Whether to log the error (default: True)

        Returns:
            HTTP response with success=False

        Example:
            >>> ResponseBuilder.error("Invalid input", status_code=400)
        """
        if log_error:
            log_message = f"Error response: {message}"
            if error_details:
                log_message += f" | Details: {error_details}"
            logging.error(log_message)

        return func.HttpResponse(
            json.dumps({"success": False, "message": message}),
            status_code=status_code,
            mimetype="application/json",
        )

    @staticmethod
    def validation_error(
        message: str, fields: Optional[list] = None
    ) -> func.HttpResponse:
        """
        Create a validation error response

        Args:
            message: Validation error message
            fields: Optional list of invalid field names

        Returns:
            HTTP response with 400 status code

        Example:
            >>> ResponseBuilder.validation_error(
            ...     "Missing required fields",
            ...     ["name", "email"]
            ... )
        """
        response_data = {"success": False, "message": message}

        if fields:
            response_data["invalidFields"] = fields

        return func.HttpResponse(
            json.dumps(response_data),
            status_code=400,
            mimetype="application/json",
        )

    @staticmethod
    def service_unavailable(service_name: str) -> func.HttpResponse:
        """
        Create a service unavailable response

        Args:
            service_name: Name of the unavailable service

        Returns:
            HTTP response with 503 status code

        Example:
            >>> ResponseBuilder.service_unavailable("OpenAI")
        """
        message = f"Service {service_name} non configuré"
        logging.warning(f"Service unavailable: {service_name}")

        return func.HttpResponse(
            json.dumps({"success": False, "message": message}),
            status_code=503,
            mimetype="application/json",
        )

    @staticmethod
    def from_exception(
        exception: Exception,
        default_message: str = "Erreur serveur",
        status_code: int = 500,
    ) -> func.HttpResponse:
        """
        Create an error response from an exception

        Args:
            exception: The exception that occurred
            default_message: Default message if exception has no message
            status_code: HTTP status code (default: 500)

        Returns:
            HTTP response with error details

        Example:
            >>> try:
            ...     # some operation
            ... except Exception as e:
            ...     return ResponseBuilder.from_exception(e)
        """
        error_message = str(exception) if str(exception) else default_message
        logging.error(
            f"Exception handled: {exception.__class__.__name__}: {error_message}"
        )

        return func.HttpResponse(
            json.dumps({"success": False, "message": default_message}),
            status_code=status_code,
            mimetype="application/json",
        )
