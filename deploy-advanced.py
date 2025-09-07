#!/usr/bin/env python3
"""
Advanced Deployment Script for TCDynamics
Handles deployment of all advanced features
"""

import os
import sys
import subprocess
import json
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class TCDynamicsDeployer:
    """Advanced deployment manager for TCDynamics"""
    
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.venv_path = self.project_root / "venv"
        self.requirements_file = self.project_root / "requirements.txt"
        
    def check_prerequisites(self):
        """Check if all prerequisites are met"""
        logger.info("Checking prerequisites...")
        
        # Check Python version
        python_version = sys.version_info
        if python_version < (3, 8):
            logger.error("Python 3.8+ is required")
            return False
        
        # Check if virtual environment exists
        if not self.venv_path.exists():
            logger.info("Creating virtual environment...")
            subprocess.run([sys.executable, "-m", "venv", str(self.venv_path)], check=True)
        
        # Check if requirements file exists
        if not self.requirements_file.exists():
            logger.error("requirements.txt not found")
            return False
        
        logger.info("Prerequisites check passed")
        return True
    
    def install_dependencies(self):
        """Install all dependencies"""
        logger.info("Installing dependencies...")
        
        pip_path = self.venv_path / "bin" / "pip"
        if not pip_path.exists():
            pip_path = self.venv_path / "Scripts" / "pip.exe"
        
        try:
            subprocess.run([str(pip_path), "install", "-r", str(self.requirements_file)], 
                         check=True, capture_output=True, text=True)
            logger.info("Dependencies installed successfully")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to install dependencies: {e}")
            logger.error(f"Error output: {e.stderr}")
            return False
    
    def run_tests(self):
        """Run all tests"""
        logger.info("Running tests...")
        
        python_path = self.venv_path / "bin" / "python"
        if not python_path.exists():
            python_path = self.venv_path / "Scripts" / "python.exe"
        
        try:
            result = subprocess.run([str(python_path), "-m", "pytest", "tests/", "-v"], 
                                  check=True, capture_output=True, text=True)
            logger.info("All tests passed!")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Tests failed: {e}")
            logger.error(f"Error output: {e.stderr}")
            return False
    
    def validate_files(self):
        """Validate all required files exist"""
        logger.info("Validating files...")
        
        required_files = [
            "function_app.py",
            "database.py",
            "gamification.py",
            "code_executor.py",
            "realtime_service.py",
            "advanced-features.js",
            "style.css",
            "index.html",
            "manifest.json",
            "sw.js"
        ]
        
        missing_files = []
        for file in required_files:
            if not (self.project_root / file).exists():
                missing_files.append(file)
        
        if missing_files:
            logger.error(f"Missing required files: {missing_files}")
            return False
        
        logger.info("All required files present")
        return True
    
    def create_deployment_package(self):
        """Create deployment package"""
        logger.info("Creating deployment package...")
        
        # Create deployment directory
        deploy_dir = self.project_root / "deployment"
        deploy_dir.mkdir(exist_ok=True)
        
        # Copy essential files
        essential_files = [
            "function_app.py",
            "database.py",
            "gamification.py",
            "code_executor.py",
            "realtime_service.py",
            "requirements.txt",
            "host.json",
            "index.html",
            "style.css",
            "script.js",
            "advanced-features.js",
            "manifest.json",
            "sw.js"
        ]
        
        for file in essential_files:
            src = self.project_root / file
            dst = deploy_dir / file
            if src.exists():
                import shutil
                shutil.copy2(src, dst)
                logger.info(f"Copied {file}")
        
        # Create deployment info
        from datetime import datetime
        deployment_info = {
            "version": "1.0.0",
            "timestamp": datetime.now().isoformat(),
            "features": [
                "Gamification System",
                "Code Playground",
                "Real-time Updates",
                "PWA Support",
                "Dark Mode",
                "Achievement System",
                "Progress Tracking",
                "Advanced UI/UX"
            ],
            "api_endpoints": [
                "/api/ContactForm",
                "/api/execute-code",
                "/api/code-examples",
                "/api/progress",
                "/api/achievements",
                "/api/leaderboard",
                "/api/health",
                "/api/admin/dashboard"
            ]
        }
        
        with open(deploy_dir / "deployment-info.json", "w") as f:
            json.dump(deployment_info, f, indent=2)
        
        logger.info("Deployment package created successfully")
        return True
    
    def generate_documentation(self):
        """Generate deployment documentation"""
        logger.info("Generating documentation...")
        
        doc_content = """# TCDynamics Advanced Features Deployment Guide

## Overview
This deployment includes all advanced features for the TCDynamics Python learning platform.

## Features Included

### 🎮 Gamification System
- Achievement tracking
- Points and levels
- Streak counting
- Leaderboard

### 💻 Code Playground
- Safe Python code execution
- Code examples
- Execution history
- Sandboxed environment

### 🔄 Real-time Features
- WebSocket connections
- Live progress updates
- Community notifications
- Event broadcasting

### 📱 Progressive Web App (PWA)
- Offline functionality
- Service worker
- App manifest
- Installable app

### 🎨 Advanced UI/UX
- Dark mode toggle
- Accessibility features
- Responsive design
- Smooth animations

## API Endpoints

### Core Endpoints
- `POST /api/ContactForm` - Contact form submission
- `GET /api/health` - Health check
- `GET /api/admin/dashboard` - Admin dashboard

### Advanced Endpoints
- `POST /api/execute-code` - Execute Python code
- `GET /api/code-examples` - Get code examples
- `GET/POST /api/progress` - User progress management
- `GET /api/achievements` - Available achievements
- `GET /api/leaderboard` - Leaderboard data

## Deployment Steps

1. **Prerequisites**
   ```bash
   python --version  # Should be 3.8+
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run Tests**
   ```bash
   python -m pytest tests/ -v
   ```

4. **Deploy to Azure Functions**
   ```bash
   func azure functionapp publish <your-function-app-name>
   ```

## Configuration

### Environment Variables
- `ZOHO_EMAIL` - Zoho email for notifications
- `ZOHO_PASSWORD` - Zoho app password
- `COSMOS_CONNECTION_STRING` - Azure Cosmos DB connection
- `AZURE_STORAGE_CONNECTION_STRING` - Azure Storage connection
- `ADMIN_KEY` - Admin dashboard access key

### Optional Configuration
- `REDIS_CONNECTION_STRING` - Redis for caching
- `WEBSOCKET_PORT` - WebSocket server port (default: 8765)

## Testing

Run the comprehensive test suite:
```bash
python -m pytest tests/ -v
```

Test coverage includes:
- Contact form functionality
- Gamification system
- Code execution
- Real-time features
- Integration tests

## Monitoring

The platform includes built-in monitoring:
- Performance metrics
- Error tracking
- User analytics
- System health checks

## Support

For issues or questions:
1. Check the logs in Azure Functions
2. Review the test suite
3. Check environment variables
4. Verify API endpoints

## Version History

- v1.0.0 - Initial advanced features release
  - Gamification system
  - Code playground
  - PWA support
  - Real-time features
  - Advanced UI/UX
"""
        
        with open(self.project_root / "DEPLOYMENT.md", "w") as f:
            f.write(doc_content)
        
        logger.info("Documentation generated")
        return True
    
    def deploy(self):
        """Main deployment process"""
        logger.info("Starting TCDynamics advanced deployment...")
        
        steps = [
            ("Checking prerequisites", self.check_prerequisites),
            ("Validating files", self.validate_files),
            ("Installing dependencies", self.install_dependencies),
            ("Running tests", self.run_tests),
            ("Creating deployment package", self.create_deployment_package),
            ("Generating documentation", self.generate_documentation)
        ]
        
        for step_name, step_func in steps:
            logger.info(f"Step: {step_name}")
            if not step_func():
                logger.error(f"Deployment failed at step: {step_name}")
                return False
        
        logger.info("🎉 TCDynamics advanced deployment completed successfully!")
        logger.info("All features are ready for production deployment.")
        return True

def main():
    """Main entry point"""
    deployer = TCDynamicsDeployer()
    
    if len(sys.argv) > 1 and sys.argv[1] == "--help":
        print("""
TCDynamics Advanced Deployment Script

Usage:
    python deploy-advanced.py [--help]

This script will:
1. Check prerequisites
2. Validate all files
3. Install dependencies
4. Run comprehensive tests
5. Create deployment package
6. Generate documentation

All advanced features will be ready for deployment.
        """)
        return
    
    success = deployer.deploy()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
