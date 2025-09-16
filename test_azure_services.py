#!/usr/bin/env python3
"""
Azure Services Integration Test Script
Tests connectivity and functionality of Azure OpenAI, Vision, and Functions
"""

import os
import sys
import json
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_environment_variables():
    """Test that required environment variables are set"""
    print("🔍 Testing Environment Variables...")

    required_vars = [
        'AZURE_OPENAI_ENDPOINT',
        'AZURE_OPENAI_KEY',
        'AZURE_OPENAI_DEPLOYMENT',
        'AZURE_VISION_ENDPOINT',
        'AZURE_VISION_KEY',
        'COSMOS_DB_CONNECTION_STRING',
        'ZOHO_EMAIL',
        'ZOHO_PASSWORD'
    ]

    missing_vars = []
    for var in required_vars:
        value = os.environ.get(var)
        if not value or value.startswith('your-'):
            missing_vars.append(var)
            print(f"❌ {var}: Not configured")
        else:
            print(f"✅ {var}: Configured")

    if missing_vars:
        print(f"\n⚠️  Missing {len(missing_vars)} environment variables")
        return False

    print("✅ All required environment variables are configured")
    return True

async def test_openai_connection():
    """Test Azure OpenAI connectivity"""
    print("\n🤖 Testing Azure OpenAI Connection...")

    try:
        import aiohttp

        endpoint = os.environ.get('AZURE_OPENAI_ENDPOINT')
        key = os.environ.get('AZURE_OPENAI_KEY')
        deployment = os.environ.get('AZURE_OPENAI_DEPLOYMENT')

        if not all([endpoint, key, deployment]):
            print("❌ Azure OpenAI configuration incomplete")
            return False

        url = f"{endpoint}/openai/deployments/{deployment}/chat/completions?api-version=2024-02-01"

        headers = {
            'Content-Type': 'application/json',
            'api-key': key
        }

        data = {
            "messages": [
                {
                    "role": "user",
                    "content": "Hello, this is a test message. Please respond with 'Azure OpenAI test successful'."
                }
            ],
            "max_tokens": 50,
            "temperature": 0.7
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, json=data) as response:
                if response.status == 200:
                    result = await response.json()
                    content = result['choices'][0]['message']['content']
                    print(f"✅ Azure OpenAI: {content.strip()}")
                    return True
                else:
                    error_text = await response.text()
                    print(f"❌ Azure OpenAI Error ({response.status}): {error_text}")
                    return False

    except ImportError:
        print("❌ aiohttp not installed. Install with: pip install aiohttp")
        return False
    except Exception as e:
        print(f"❌ Azure OpenAI test failed: {str(e)}")
        return False

async def test_vision_connection():
    """Test Azure Vision connectivity"""
    print("\n👁️  Testing Azure Vision Connection...")

    try:
        import aiohttp
        import base64

        endpoint = os.environ.get('AZURE_VISION_ENDPOINT')
        key = os.environ.get('AZURE_VISION_KEY')

        if not all([endpoint, key]):
            print("❌ Azure Vision configuration incomplete")
            return False

        # Create a simple test image (1x1 pixel PNG)
        test_image_data = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jzyr5gAAAABJRU5ErkJggg=="
        image_bytes = base64.b64decode(test_image_data)

        url = f"{endpoint}/vision/v3.2/analyze?visualFeatures=Tags"

        headers = {
            'Content-Type': 'application/octet-stream',
            'Ocp-Apim-Subscription-Key': key
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, data=image_bytes) as response:
                if response.status == 200:
                    result = await response.json()
                    print("✅ Azure Vision: Analysis successful")
                    return True
                else:
                    error_text = await response.text()
                    print(f"❌ Azure Vision Error ({response.status}): {error_text}")
                    return False

    except ImportError:
        print("❌ aiohttp not installed. Install with: pip install aiohttp")
        return False
    except Exception as e:
        print(f"❌ Azure Vision test failed: {str(e)}")
        return False

def test_cosmos_connection():
    """Test Cosmos DB connectivity"""
    print("\n☁️  Testing Cosmos DB Connection...")

    try:
        from azure.cosmos import CosmosClient, exceptions

        connection_string = os.environ.get('COSMOS_DB_CONNECTION_STRING')
        database_name = os.environ.get('COSMOS_DB_DATABASE', 'workflowai-data')

        if not connection_string:
            print("❌ Cosmos DB connection string not configured")
            return False

        client = CosmosClient.from_connection_string(connection_string)

        # Try to list databases
        databases = list(client.list_databases())
        print(f"✅ Cosmos DB: Connected, found {len(databases)} databases")

        # Check if our database exists
        db_names = [db['id'] for db in databases]
        if database_name in db_names:
            print(f"✅ Database '{database_name}' exists")
        else:
            print(f"⚠️  Database '{database_name}' does not exist (will be created on first use)")

        return True

    except ImportError:
        print("❌ azure-cosmos not installed. Install with: pip install azure-cosmos")
        return False
    except Exception as e:
        print(f"❌ Cosmos DB test failed: {str(e)}")
        return False

def test_zoho_email():
    """Test Zoho email configuration"""
    print("\n📧 Testing Zoho Email Configuration...")

    email = os.environ.get('ZOHO_EMAIL')
    password = os.environ.get('ZOHO_PASSWORD')

    if not email or not password:
        print("❌ Zoho email credentials not configured")
        return False

    if email == 'your-email@zoho.com' or password == 'your-app-password-here':
        print("❌ Zoho email credentials are placeholder values")
        return False

    print("✅ Zoho email credentials configured")
    print("   Note: Actual email sending will be tested when forms are submitted")
    return True

async def main():
    """Run all tests"""
    print("🚀 WorkFlowAI Azure Services Integration Test")
    print("=" * 50)

    results = []

    # Test environment variables
    results.append(("Environment Variables", test_environment_variables()))

    # Test Azure OpenAI
    results.append(("Azure OpenAI", await test_openai_connection()))

    # Test Azure Vision
    results.append(("Azure Vision", await test_vision_connection()))

    # Test Cosmos DB
    results.append(("Cosmos DB", test_cosmos_connection()))

    # Test Zoho Email
    results.append(("Zoho Email", test_zoho_email()))

    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    passed = 0
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {test_name}: {status}")
        if result:
            passed += 1

    print(f"\n🎯 Overall: {passed}/{len(results)} tests passed")

    if passed == len(results):
        print("🎉 All Azure services are properly configured!")
        return 0
    else:
        print("⚠️  Some services need configuration. Check the output above.")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
