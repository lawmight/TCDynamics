"""
Deployment script for TCDynamics project
Handles both local testing and production deployment
"""
import subprocess
import sys
import os
from pathlib import Path

def install_dependencies():
    """Install required dependencies"""
    print("📦 Installing dependencies...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], 
                      check=True, capture_output=True, text=True)
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        print(f"Error output: {e.stderr}")
        return False

def run_tests():
    """Run the test suite"""
    print("🧪 Running tests...")
    try:
        result = subprocess.run([sys.executable, "-m", "pytest", "tests/", "-v"], 
                               check=True, capture_output=True, text=True)
        print("✅ All tests passed!")
        print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Tests failed: {e}")
        print(f"Test output: {e.stdout}")
        print(f"Error output: {e.stderr}")
        return False

def validate_environment():
    """Check if required environment variables are set"""
    print("🔍 Validating environment...")
    required_vars = ["ZOHO_EMAIL", "ZOHO_PASSWORD"]
    
    # Check for .env file
    env_file = Path(".env")
    if not env_file.exists():
        print("⚠️  No .env file found. Copy env.example to .env and fill in your credentials.")
        return False
    
    # Load and check variables
    missing_vars = []
    with open(env_file) as f:
        env_content = f.read()
        for var in required_vars:
            if f"{var}=" not in env_content or f"{var}=your-" in env_content:
                missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Missing or unconfigured environment variables: {', '.join(missing_vars)}")
        print("Please update your .env file with actual values.")
        return False
    
    print("✅ Environment validation passed")
    return True

def start_local_server():
    """Start the Azure Functions local server"""
    print("🚀 Starting local development server...")
    try:
        subprocess.run(["func", "start", "--python"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start server: {e}")
        return False
    except FileNotFoundError:
        print("❌ Azure Functions Core Tools not found. Please install 'func' command.")
        return False

def main():
    """Main deployment workflow"""
    print("🚀 TCDynamics Deployment Script")
    print("=" * 40)
    
    # Change to script directory
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    # Run deployment steps
    steps = [
        ("Installing dependencies", install_dependencies),
        ("Validating environment", validate_environment),
        ("Running tests", run_tests),
    ]
    
    for step_name, step_func in steps:
        print(f"\n{step_name}...")
        if not step_func():
            print(f"\n❌ Deployment failed at: {step_name}")
            sys.exit(1)
    
    print("\n✅ All checks passed! Ready for deployment.")
    print("\n🔧 Next steps:")
    print("1. Run 'python deploy.py --local' to start local server")
    print("2. Run 'func azure functionapp publish <app-name>' to deploy to Azure")
    print("3. Upload frontend files to OVHcloud hosting")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--local":
        start_local_server()
    else:
        main()
