"""
Test suite for contact form functionality
"""
import pytest
import json
from unittest.mock import patch, MagicMock
from azure.functions import HttpRequest
import sys
import os

# Add the parent directory to the path to import function_app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from function_app import ContactForm, validate_email_address, sanitize_input, is_rate_limited


class TestContactForm:
    """Test cases for contact form endpoint"""
    
    def test_valid_contact_form_submission(self):
        """Test successful contact form submission"""
        # Mock request data
        req_data = {
            "name": "John Doe",
            "email": "john@example.com", 
            "message": "Test message"
        }
        
        # Create mock request
        req = HttpRequest(
            method='POST',
            url='http://localhost:7071/api/ContactForm',
            headers={'content-type': 'application/json'},
            body=json.dumps(req_data).encode()
        )
        
        # Mock email sending to avoid actual SMTP calls
        with patch('function_app.send_email_notification', return_value=True):
            response = ContactForm(req)
        
        # Verify response
        assert response.status_code == 200
        response_data = json.loads(response.get_body().decode())
        assert response_data['success'] is True
        assert "Merci" in response_data['message']
    
    def test_missing_required_fields(self):
        """Test validation with missing fields"""
        req_data = {
            "name": "John Doe",
            "email": "",  # Missing email
            "message": "Test message"
        }
        
        req = HttpRequest(
            method='POST',
            url='http://localhost:7071/api/ContactForm',
            headers={'content-type': 'application/json'},
            body=json.dumps(req_data).encode()
        )
        
        response = ContactForm(req)
        
        assert response.status_code == 400
        response_data = json.loads(response.get_body().decode())
        assert response_data['success'] is False
        assert "requis" in response_data['message']
    
    def test_invalid_email_format(self):
        """Test email validation"""
        req_data = {
            "name": "John Doe",
            "email": "invalid-email",
            "message": "Test message"
        }
        
        req = HttpRequest(
            method='POST',
            url='http://localhost:7071/api/ContactForm',
            headers={'content-type': 'application/json'},
            body=json.dumps(req_data).encode()
        )
        
        response = ContactForm(req)
        
        assert response.status_code == 400
        response_data = json.loads(response.get_body().decode())
        assert response_data['success'] is False
        assert "valide" in response_data['message']


class TestValidationFunctions:
    """Test validation utility functions"""
    
    def test_email_validation(self):
        """Test email validation function"""
        # Valid emails
        assert validate_email_address("test@example.com") is True
        assert validate_email_address("user.name@domain.co.uk") is True
        
        # Invalid emails
        assert validate_email_address("invalid-email") is False
        assert validate_email_address("@domain.com") is False
        assert validate_email_address("user@") is False
        assert validate_email_address("") is False
    
    def test_input_sanitization(self):
        """Test input sanitization"""
        # Test XSS prevention
        dangerous_input = "<script>alert('xss')</script>Hello"
        sanitized = sanitize_input(dangerous_input)
        assert "<script>" not in sanitized
        assert "Hello" in sanitized
        
        # Test whitespace trimming
        assert sanitize_input("  test  ") == "test"
        
        # Test empty input
        assert sanitize_input("") == ""
        assert sanitize_input(None) == ""
    
    def test_rate_limiting(self):
        """Test rate limiting functionality"""
        test_ip = "192.168.1.1"
        
        # Should allow first few requests
        for i in range(5):
            assert is_rate_limited(test_ip) is False
        
        # Should block after limit exceeded
        assert is_rate_limited(test_ip) is True


class TestIntegration:
    """Integration tests"""
    
    @patch('function_app.send_email_notification')
    def test_complete_workflow(self, mock_email):
        """Test complete contact form workflow"""
        mock_email.return_value = True
        
        req_data = {
            "name": "Alice Smith",
            "email": "alice@example.com",
            "message": "I love your Python learning journey!"
        }
        
        req = HttpRequest(
            method='POST',
            url='http://localhost:7071/api/ContactForm',
            headers={'content-type': 'application/json'},
            body=json.dumps(req_data).encode()
        )
        
        response = ContactForm(req)
        
        # Verify successful response
        assert response.status_code == 200
        
        # Verify email function was called
        mock_email.assert_called_once_with("Alice Smith", "alice@example.com", "I love your Python learning journey!")
