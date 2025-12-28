"""
Azure Functions comprehensive test suite for TCDynamics
Tests all functions with proper mocking and environment setup
"""

import pytest
import json
import asyncio
from unittest.mock import Mock, patch, MagicMock
import azure.functions as func
import os


@pytest.fixture(autouse=True)
def cleanup_env_vars(monkeypatch):
    """Automatically clean up environment variables before each test"""
    # Collect all keys to clean up
    keys_to_remove = [
        key
        for key in os.environ.keys()
        if key.startswith(("AZURE_", "ZOHO_", "COSMOS_", "STRIPE_"))
    ]
    # Remove each key using monkeypatch for safe cleanup
    for key in keys_to_remove:
        monkeypatch.delenv(key, raising=False)


class TestAzureFunctions:
    """Test suite for all Azure Functions"""

    @pytest.mark.asyncio
    async def test_health_check(self):
        """Test health check endpoint"""
        from function_app import health_check

        # Mock request
        mock_req = Mock(spec=func.HttpRequest)
        mock_req.method = "GET"

        # Call function
        response = await health_check(mock_req)

        # Assertions
        assert response.status_code == 200
        body = json.loads(response.get_body())
        assert body["status"] == "healthy"
        assert "timestamp" in body
        assert "python_version" in body

    @pytest.mark.asyncio
    async def test_contact_form_success(self):
        """Test contact form with valid data"""
        from function_app import contact_form

        # Mock request with valid data
        mock_req = Mock(spec=func.HttpRequest)
        mock_req.method = "POST"
        mock_req.get_json.return_value = {
            "name": "Test User",
            "email": "test@example.com",
            "phone": "1234567890",
            "company": "Test Company",
            "message": "Test message",
            "consent": True,
        }

        # Mock environment variables
        with patch.dict(
            "os.environ",
            {
                "COSMOS_CONNECTION_STRING": "test-connection-string",
                "COSMOS_DATABASE": "test-db",
                "COSMOS_CONTAINER_CONTACTS": "test-contacts",
            },
        ):
            # Mock cosmos client
            with patch("azure.cosmos.CosmosClient") as mock_cosmos:
                mock_container = Mock()
                mock_container.create_item = Mock()
                mock_cosmos.return_value.get_database_client.return_value.get_container_client.return_value = (
                    mock_container
                )

                # Mock email sending
                with patch(
                    "function_app.send_email_smtp", return_value=True
                ) as mock_send:
                    response = await contact_form(mock_req)

                    assert response.status_code == 200
                    body = json.loads(response.get_body())
                    assert body["success"] is True
                    assert "messageId" in body

                    # Verify Cosmos DB save was attempted
                    mock_container.create_item.assert_called_once()

                    # Verify email send was attempted
                    mock_send.assert_called_once()

    @pytest.mark.asyncio
    async def test_contact_form_missing_fields(self):
        """Test contact form with missing required fields"""
        from function_app import contact_form

        # Mock request with missing fields
        mock_req = Mock(spec=func.HttpRequest)
        mock_req.method = "POST"
        mock_req.get_json.return_value = {
            "email": "test@example.com",
            "message": "Test message",
        }

        response = await contact_form(mock_req)

        assert response.status_code == 400
        body = json.loads(response.get_body())
        assert body["success"] is False
        assert "Tous les champs sont requis" in body["message"]

    @pytest.mark.asyncio
    async def test_demo_form_success(self):
        """Test demo form with valid data"""
        from function_app import demo_form

        # Mock request with valid data
        mock_req = Mock(spec=func.HttpRequest)
        mock_req.method = "POST"
        mock_req.get_json.return_value = {
            "name": "Test User",
            "email": "test@example.com",
            "company": "Test Company",
            "businessNeeds": "Need demo of features",
        }

        # Mock environment variables
        with patch.dict(
            "os.environ",
            {
                "COSMOS_CONNECTION_STRING": "test-connection-string",
                "COSMOS_DATABASE": "test-db",
                "COSMOS_CONTAINER_DEMOS": "test-demos",
            },
        ):
            # Mock cosmos client
            with patch("azure.cosmos.CosmosClient") as mock_cosmos:
                mock_container = Mock()
                mock_container.create_item = Mock()
                mock_cosmos.return_value.get_database_client.return_value.get_container_client.return_value = (
                    mock_container
                )

                # Mock email sending
                with patch("function_app.send_email_smtp", return_value=True):
                    response = await demo_form(mock_req)

                    assert response.status_code == 200
                    body = json.loads(response.get_body())
                    assert body["success"] is True

    @pytest.mark.asyncio
    async def test_ai_chat_success(self):
        """Test AI chat with valid message"""
        from function_app import ai_chat

        # Mock request
        mock_req = Mock(spec=func.HttpRequest)
        mock_req.method = "POST"
        mock_req.get_json.return_value = {
            "message": "Hello, how are you?",
            "sessionId": "test-session-123",
        }

        # Mock OpenAI client and Cosmos
        with patch.dict(
            "os.environ",
            {
                "AZURE_OPENAI_ENDPOINT": "https://test.openai.azure.com",
                "AZURE_OPENAI_API_KEY": "test-key",
                "AZURE_OPENAI_DEPLOYMENT": "gpt-4",
                "COSMOS_CONNECTION_STRING": "test-connection-string",
                "COSMOS_CONTAINER_CONVERSATIONS": "test-conversations",
            },
        ):
            # Mock OpenAI response
            mock_response = Mock()
            mock_response.choices = [Mock()]
            mock_response.choices[0].message.content = "I'm doing well, thank you!"

            with patch("openai.AzureOpenAI") as mock_openai_class:
                mock_openai = Mock()
                mock_openai.chat.completions.create = Mock(return_value=mock_response)
                mock_openai_class.return_value = mock_openai

                # Mock cosmos for conversation saving
                with patch("azure.cosmos.CosmosClient") as mock_cosmos:
                    mock_container = Mock()
                    mock_cosmos.return_value.get_database_client.return_value.get_container_client.return_value = (
                        mock_container
                    )

                    response = await ai_chat(mock_req)

                    assert response.status_code == 200
                    body = json.loads(response.get_body())
                    assert body["success"] is True
                    assert "message" in body
                    assert "conversationId" in body

    @pytest.mark.asyncio
    async def test_ai_chat_no_openai(self):
        """Test AI chat when OpenAI is not configured"""
        from function_app import ai_chat

        # Mock request
        mock_req = Mock(spec=func.HttpRequest)
        mock_req.method = "POST"
        mock_req.get_json.return_value = {
            "message": "Hello",
            "sessionId": "test-session",
        }

        # No OpenAI environment variables
        response = await ai_chat(mock_req)

        assert response.status_code == 503
        body = json.loads(response.get_body())
        assert body["success"] is False
        assert "Service IA non configuré" in body["message"]

    @pytest.mark.asyncio
    async def test_ai_vision_success(self):
        """Test AI vision with valid image URL"""
        from function_app import ai_vision

        # Mock request
        mock_req = Mock(spec=func.HttpRequest)
        mock_req.method = "POST"
        mock_req.get_json.return_value = {"imageUrl": "https://example.com/image.jpg"}

        # Mock Vision client
        with patch.dict(
            "os.environ",
            {
                "AZURE_VISION_ENDPOINT": "https://test.vision.azure.com",
                "AZURE_VISION_API_KEY": "test-key",
            },
        ):
            # Mock vision response
            mock_result = Mock()
            mock_result.caption = Mock()
            mock_result.caption.content = "A test image"
            mock_result.read = Mock()
            mock_result.read.blocks = [Mock()]
            mock_result.read.blocks[0].lines = [Mock()]
            mock_result.read.blocks[0].lines[0].text = "Extracted text"

            with patch(
                "azure.ai.vision.imageanalysis.ImageAnalysisClient"
            ) as mock_vision_class:
                mock_vision = Mock()
                mock_vision.analyze = Mock(return_value=mock_result)
                mock_vision_class.return_value = mock_vision

                response = await ai_vision(mock_req)

                assert response.status_code == 200
                body = json.loads(response.get_body())
                assert body["success"] is True
                assert "caption" in body
                assert "text" in body

    @pytest.mark.asyncio
    async def test_ai_vision_invalid_url(self):
        """Test AI vision with invalid URL"""
        from function_app import ai_vision

        # Mock request with invalid URL
        mock_req = Mock(spec=func.HttpRequest)
        mock_req.method = "POST"
        mock_req.get_json.return_value = {"imageUrl": "invalid-url"}

        response = await ai_vision(mock_req)

        assert response.status_code == 400
        body = json.loads(response.get_body())
        assert body["success"] is False
        assert "URL d'image invalide" in body["message"]

    @pytest.mark.asyncio
    async def test_stripe_payment_intent(self):
        """Test Stripe payment intent creation"""
        from function_app import create_payment_intent

        # Mock request
        mock_req = Mock(spec=func.HttpRequest)
        mock_req.method = "POST"
        mock_req.get_json.return_value = {
            "amount": 1000,  # 10 EUR in cents
            "currency": "eur",
        }

        # Mock Stripe
        with patch.dict(
            "os.environ",
            {
                "STRIPE_SECRET_KEY": "sk_test_123",
            },
        ):
            # Mock Stripe response
            mock_payment_intent = Mock()
            mock_payment_intent.client_secret = "pi_123_secret_456"
            mock_payment_intent.id = "pi_123"

            with patch("stripe.PaymentIntent.create", return_value=mock_payment_intent):
                response = await create_payment_intent(mock_req)

                assert response.status_code == 200
                body = json.loads(response.get_body())
                assert body["success"] is True
                assert body["clientSecret"] == "pi_123_secret_456"
                assert body["paymentIntentId"] == "pi_123"

    @pytest.mark.asyncio
    async def test_stripe_subscription(self):
        """Test Stripe subscription creation"""
        from function_app import create_subscription

        # Mock request
        mock_req = Mock(spec=func.HttpRequest)
        mock_req.method = "POST"
        mock_req.get_json.return_value = {
            "email": "test@example.com",
            "priceId": "price_123",
        }

        # Mock Stripe
        with patch.dict(
            "os.environ",
            {
                "STRIPE_SECRET_KEY": "sk_test_123",
            },
        ):
            # Mock customer list
            mock_customer = Mock()
            mock_customer.id = "cus_123"

            # Mock subscription
            mock_subscription = Mock()
            mock_subscription.id = "sub_123"
            mock_subscription.latest_invoice = Mock()
            mock_subscription.latest_invoice.payment_intent = Mock()
            mock_subscription.latest_invoice.payment_intent.client_secret = (
                "pi_456_secret_789"
            )

            with patch(
                "stripe.Customer.list", return_value=Mock(data=[mock_customer])
            ), patch("stripe.Subscription.create", return_value=mock_subscription):

                response = await create_subscription(mock_req)

                assert response.status_code == 200
                body = json.loads(response.get_body())
                assert body["success"] is True
                assert body["subscriptionId"] == "sub_123"
                assert body["clientSecret"] == "pi_456_secret_789"

    @pytest.mark.asyncio
    async def test_environment_validation(self):
        """Test that required environment variables are properly handled"""
        from function_app import contact_form

        # Mock request
        mock_req = Mock(spec=func.HttpRequest)
        mock_req.method = "POST"
        mock_req.get_json.return_value = {
            "name": "Test User",
            "email": "test@example.com",
            "phone": "1234567890",
            "company": "Test Company",
            "message": "Test message",
            "consent": True,
        }

        # Test without Cosmos DB configured
        response = await contact_form(mock_req)

        # Should return 503 Service Unavailable when Cosmos DB is not configured
        # (contact_form calls ResponseBuilder.service_unavailable() which returns 503)
        assert response.status_code == 503
        body = json.loads(response.get_body())
        assert body["success"] is False

    @pytest.mark.asyncio
    async def test_cors_headers(self):
        """Test CORS headers are properly set"""
        from function_app import contact_form

        # Mock request
        mock_req = Mock(spec=func.HttpRequest)
        mock_req.method = "OPTIONS"

        response = await contact_form(mock_req)

        # Should handle OPTIONS request and include CORS headers
        assert (
            response.status_code == 204
        )  # CORS preflight should return 204 No Content
        assert "Access-Control-Allow-Origin" in response.headers
        assert "Access-Control-Allow-Methods" in response.headers

    def test_imports(self):
        """Test that all imports work correctly"""
        # This test ensures all Azure SDK imports are available
        import azure.functions
        import openai
        from azure.ai.vision.imageanalysis import ImageAnalysisClient
        from azure.core.credentials import AzureKeyCredential
        import azure.cosmos
        import stripe

        assert azure.functions is not None
        assert openai is not None
        assert ImageAnalysisClient is not None
        assert AzureKeyCredential is not None
        assert azure.cosmos is not None
        assert stripe is not None


class TestValidators:
    """Test suite for validation functions"""

    def test_validate_email_valid_addresses(self):
        """Test validate_email with valid email addresses"""
        from services.validators import validate_email

        # Standard valid emails
        assert validate_email("user@example.com") is True
        assert validate_email("test.user@example.com") is True
        assert validate_email("user+tag@example.co.uk") is True
        assert validate_email("user_name@example-domain.com") is True
        assert validate_email("user123@example123.com") is True
        assert validate_email("a@b.co") is True  # Minimal valid email

    def test_validate_email_invalid_addresses(self):
        """Test validate_email with invalid email addresses"""
        from services.validators import validate_email

        # Invalid formats
        assert validate_email("invalid") is False
        assert validate_email("invalid@") is False
        assert validate_email("@example.com") is False
        assert validate_email("user@") is False
        assert validate_email("user@example") is False  # Missing TLD
        assert validate_email("user @example.com") is False  # Space in local part
        assert validate_email("user@ex ample.com") is False  # Space in domain
        assert validate_email("user@@example.com") is False  # Double @
        assert validate_email("user@example..com") is False  # Double dot
        assert validate_email(".user@example.com") is False  # Leading dot
        assert validate_email("user.@example.com") is False  # Trailing dot

    def test_validate_email_edge_cases(self):
        """Test validate_email with edge cases"""
        from services.validators import validate_email

        # None and empty values
        assert validate_email(None) is False
        assert validate_email("") is False
        assert validate_email("   ") is False  # Whitespace only

        # Special characters (some valid, some invalid)
        assert validate_email("user+tag@example.com") is True  # Plus is valid
        assert validate_email("user_name@example.com") is True  # Underscore is valid
        assert validate_email("user%tag@example.com") is True  # Percent is valid

    def test_validate_email_unicode(self):
        """Test validate_email with Unicode characters"""
        from services.validators import validate_email

        # Unicode in local part (valid per RFC 6531)
        assert validate_email("tëst@example.com") is True
        assert validate_email("测试@example.com") is True

        # Unicode in domain (IDN - Internationalized Domain Names)
        assert validate_email("user@münchen.de") is True
        assert validate_email("user@例子.测试") is True

    def test_validate_email_long_addresses(self):
        """Test validate_email with long email addresses"""
        from services.validators import validate_email

        # Long but valid email
        long_local = "a" * 64  # Max local part length
        assert validate_email(f"{long_local}@example.com") is True

        # Very long domain
        long_domain = "a" * 63 + ".com"
        assert validate_email(f"user@{long_domain}") is True


# Run tests if executed directly
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
