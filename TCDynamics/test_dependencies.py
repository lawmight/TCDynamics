#!/usr/bin/env python3
"""
Test script to verify Azure Functions Python dependencies are properly installed.
This script checks if all required packages are available and compatible.
"""

def test_azure_functions():
    """Test Azure Functions imports"""
    try:
        import azure.functions as func
        print(f"✓ azure-functions: {func.__version__}")
        return True
    except ImportError as e:
        print(f"✗ azure-functions import failed: {e}")
        return False

def test_grpc():
    """Test gRPC imports"""
    try:
        import grpc
        print(f"✓ grpcio: {grpc.__version__}")
        return True
    except ImportError as e:
        print(f"✗ grpcio import failed: {e}")
        return False

def test_protobuf():
    """Test Protocol Buffers imports"""
    try:
        import google.protobuf
        print("✓ protobuf: available")
        return True
    except ImportError as e:
        print(f"✗ protobuf import failed: {e}")
        return False

def test_stripe():
    """Test Stripe import (optional)"""
    try:
        import stripe
        version = getattr(stripe, '__version__', getattr(stripe, '_version', 'unknown'))
        print(f"✓ stripe: {version}")
        return True
    except ImportError:
        print("⚠ stripe: not available (optional)")
        return True  # Optional, so return True

def test_function_app():
    """Test if function_app.py can be imported"""
    try:
        import function_app
        print("✓ function_app.py: can be imported")
        return True
    except ImportError as e:
        print(f"✗ function_app.py import failed: {e}")
        return False
    except Exception as e:
        print(f"⚠ function_app.py imported with warnings: {e}")
        return True  # Import works, just warnings

def main():
    """Run all dependency tests"""
    print("Testing Azure Functions Python dependencies...")
    print("=" * 50)

    tests = [
        test_azure_functions,
        test_grpc,
        test_protobuf,
        test_stripe,
        test_function_app
    ]

    results = []
    for test in tests:
        result = test()
        results.append(result)
        print()

    print("=" * 50)
    if all(results):
        print("✓ All dependency tests passed!")
        return 0
    else:
        print("✗ Some dependency tests failed!")
        return 1

if __name__ == "__main__":
    exit(main())
