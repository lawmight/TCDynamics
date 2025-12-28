"""
Response Builder - Utility for creating standardized HTTP responses
Ensures consistent response format across all Azure Functions
"""

import json
import logging
from typing import Any, Dict, List, Optional
import azure.functions as func


class ResponseBuilder:
    """
    Utility class for building standardized HTTP responses

    Provides consistent response formatting, error handling,
    and logging across all Azure Functions endpoints.
    """

    @staticmethod
    def _safe_json_dumps(data: Dict[str, Any]) -> str:
        """
        Safely serialize data to JSON string with error handling

        Attempts to serialize with default=str fallback for common types
        (e.g., datetime objects). If serialization still fails, logs error
        and raises an exception that should be caught by the caller.

        Args:
            data: Dictionary to serialize

        Returns:
            JSON string representation of data

        Raises:
            TypeError: If data contains non-serializable values that
                      cannot be handled by default=str
        """
        try:
            return json.dumps(data, default=str)
        except (TypeError, ValueError) as e:
            data_type = type(data).__name__
            data_size = len(data) if hasattr(data, "__len__") else None
            size_info = f", size={data_size}" if data_size is not None else ""
            logging.error(
                f"JSON serialization error: {type(e).__name__}: {str(e)}: data type={data_type}{size_info}"
            )
            raise

    @staticmethod
    def _serialization_fallback() -> func.HttpResponse:
        """
        Returns a standard fallback response for serialization failures

        This method provides a centralized fallback response when JSON
        serialization fails. The error is already logged by _safe_json_dumps,
        so no additional logging is performed here.

        Returns:
            HTTP response with 500 status and generic error message
        """
        return func.HttpResponse(
            json.dumps(
                {
                    "success": False,
                    "message": "Erreur lors de la sérialisation de la réponse",
                }
            ),
            status_code=500,
            mimetype="application/json",
        )

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
            response_data["data"] = data

        try:
            json_str = ResponseBuilder._safe_json_dumps(response_data)
        except (TypeError, ValueError):
            return ResponseBuilder._serialization_fallback()

        return func.HttpResponse(
            json_str,
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

        response_data = {"success": False, "message": message}
        try:
            json_str = ResponseBuilder._safe_json_dumps(response_data)
        except (TypeError, ValueError):
            return ResponseBuilder._serialization_fallback()

        return func.HttpResponse(
            json_str,
            status_code=status_code,
            mimetype="application/json",
        )

    @staticmethod
    def validation_error(
        message: str, fields: Optional[List[str]] = None
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
        status_code = 400
        response_data = {"success": False, "message": message}

        if fields:
            response_data["invalidFields"] = fields

        try:
            json_str = ResponseBuilder._safe_json_dumps(response_data)
        except (TypeError, ValueError):
            return ResponseBuilder._serialization_fallback()

        return func.HttpResponse(
            json_str,
            status_code=status_code,
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

        response_data = {"success": False, "message": message}
        try:
            json_str = ResponseBuilder._safe_json_dumps(response_data)
        except (TypeError, ValueError):
            return ResponseBuilder._serialization_fallback()

        return func.HttpResponse(
            json_str,
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

        Security Note:
            This method logs full exception details (class name and message) internally
            for debugging purposes, but deliberately returns only the non-sensitive
            default_message to the client to prevent information disclosure. This
            prevents leaking sensitive internal error details that could aid attackers.

        Args:
            exception: The exception that occurred
            default_message: Generic message to return to client (default: "Erreur serveur").
                           Full exception details are logged but not returned to prevent
                           information disclosure.
            status_code: HTTP status code (default: 500)

        Returns:
            HTTP response with generic error message (not the actual exception message)

        Example:
            >>> try:
            ...     # some operation
            ... except Exception as e:
            ...     return ResponseBuilder.from_exception(e)
        """
        logging.error(
            f"Exception handled: {exception.__class__.__name__}: {str(exception) or default_message}"
        )

        response_data = {"success": False, "message": default_message}
        try:
            json_str = ResponseBuilder._safe_json_dumps(response_data)
        except (TypeError, ValueError):
            return ResponseBuilder._serialization_fallback()

        return func.HttpResponse(
            json_str,
            status_code=status_code,
            mimetype="application/json",
        )
