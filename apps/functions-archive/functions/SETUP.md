# Azure Functions Python Setup Guide

This guide covers virtual environment setup, dependency management, local development, and CI/CD processes for the TCDynamics Azure Functions.

## Table of Contents

- [Virtual Environment Setup](#virtual-environment-setup)
- [Dependency Management](#dependency-management)
- [Local Development](#local-development)
- [CI/CD Process](#cicd-process)
- [Azure Deployment](#azure-deployment)
- [Troubleshooting](#troubleshooting)

## Virtual Environment Setup

> **Note:** This guide targets the function app located at `apps/functions-archive/functions/`. Throughout this document, `<function-app-root>` refers to this directory.

### Initial Setup

The virtual environment **must** be located in the function app root (`<function-app-root>/.venv/`) where `host.json` is located. Azure Functions Core Tools auto-detects this location.

**Windows:**

```bash
cd <function-app-root>
python -m venv .venv
.venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt -c constraints.txt
```

**Linux/Mac:**

```bash
cd <function-app-root>
python -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt -c constraints.txt
```

### Important Notes

- ⚠️ **DO NOT move an existing virtual environment** - it will break activation scripts due to hard-coded paths
- ✅ Always create a **new** virtual environment in the correct location
- ✅ The `.venv/` folder is gitignored and should not be committed
- ✅ Azure Functions Core Tools expects `.venv` in the function app root (where `host.json` is)

### Activating the Virtual Environment

**Windows:**

```bash
cd <function-app-root>
.venv\Scripts\activate
```

**Linux/Mac:**

```bash
cd <function-app-root>
source .venv/bin/activate
```

### Deactivating

```bash
deactivate
```

## Dependency Management

### File Structure

- `requirements.txt` - Deployment manifest (used by Azure Functions)
- `constraints.txt` - Version constraints for reproducible local installs
- `.venv/` - Local virtual environment (gitignored)

### Adding a New Dependency

1. **Add to requirements.txt:**

   ```bash
   # Add the package with version
   echo "package-name==1.2.3" >> requirements.txt
   ```

2. **Update constraints.txt:**

   ```bash
   # Install with constraints to update constraints.txt
   pip install -r requirements.txt -c constraints.txt
   ```

3. **Install locally:**
   ```bash
   source .venv/bin/activate  # or .venv\Scripts\activate on Windows
   pip install -r requirements.txt -c constraints.txt
   ```

### Updating Dependencies

1. **Update a specific package:**

   ```bash
   source .venv/bin/activate
   pip install --upgrade package-name
   pip freeze > requirements.txt.new
   # Review and update requirements.txt manually
   pip install -r requirements.txt -c constraints.txt
   ```

2. **Update all packages (use with caution):**
   ```bash
   source .venv/bin/activate
   pip install --upgrade -r requirements.txt
   pip freeze > requirements.txt.new
   # Review changes before updating requirements.txt
   ```

### Dependency Files Explained

- **requirements.txt**: Used by Azure Functions for deployment. Contains pinned versions.
- **constraints.txt**: Ensures reproducible installs locally. May not be used by Azure remote build.

## Local Development

### Running Functions Locally

1. **Activate virtual environment:**

   ```bash
   cd <function-app-root>
   source .venv/bin/activate  # or .venv\Scripts\activate on Windows
   ```

2. **Start Azure Functions Core Tools:**

   ```bash
   func start
   ```

3. **Functions will be available at:**
   - Health: `http://localhost:7071/api/health`
   - Contact: `http://localhost:7071/api/contactform`
   - Chat: `http://localhost:7071/api/chat`
   - Vision: `http://localhost:7071/api/vision`

### Running Tests

**Note:** `pytest` and `pytest-asyncio` are not included in `requirements.txt` as they are development dependencies only. They must be installed separately for local testing.

```bash
cd <function-app-root>
source .venv/bin/activate
pip install pytest pytest-asyncio  # Install test dependencies (not in requirements.txt)
pytest test_azure_functions.py -v
```

### Environment Variables

Create `local.settings.json` (gitignored) for local development:

⚠️ **CRITICAL: Ensure `local.settings.json` is in `.gitignore` before adding any secrets. Never commit this file to version control.**

**OpenAI Configuration:**

- `AZURE_OPENAI_ENDPOINT`: Azure OpenAI endpoint URL (required)
- `AZURE_OPENAI_KEY`: Azure OpenAI API key (required)
- `AZURE_OPENAI_DEPLOYMENT`: Deployment name (optional, defaults to "gpt-35-turbo")
- `AZURE_OPENAI_API_VERSION`: OpenAI API version (optional, defaults to "2024-02-15-preview")
  - Can be updated via environment variable without code changes
  - Example: `AZURE_OPENAI_API_VERSION=2024-06-01-preview`
  - Note: Falls back to `OPENAI_API_VERSION` for backward compatibility

**Email Configuration:**

- `ZOHO_EMAIL`: Sender email address (required)
- `ZOHO_PASSWORD`: SMTP password (required)
- `ZOHO_SMTP_SERVER`: SMTP server hostname (optional, defaults to "smtp.zoho.eu")
  - Can be overridden per function call via the `smtp_server` parameter
  - Useful for using different Zoho regions (e.g., "smtp.zoho.com" for US, "smtp.zoho.in" for India)

To verify or update `.gitignore`:

**Platform-neutral method (Git):**

- Check if `local.settings.json` is ignored: `git check-ignore -q local.settings.json && echo "Ignored" || echo "Not ignored"`
  - If "Not ignored", add it: `echo "local.settings.json" >> .gitignore`
  - Or manually add `local.settings.json` to your `.gitignore` file

**Windows PowerShell alternative:**

- Check if `local.settings.json` is listed: `Select-String -Path .gitignore -Pattern "local.settings.json" -Quiet`
  - If missing, add it: `Add-Content -Path .gitignore -Value "local.settings.json"`
  - Or manually add `local.settings.json` to your `.gitignore` file

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "python",
    "AZURE_OPENAI_ENDPOINT": "your-endpoint",
    "AZURE_OPENAI_KEY": "your-key",
    "AZURE_OPENAI_DEPLOYMENT": "gpt-35-turbo",
    "AZURE_OPENAI_API_VERSION": "2024-02-15-preview",
    "COSMOS_DB_ENDPOINT": "your-endpoint",
    "COSMOS_DB_KEY": "your-key",
    "STRIPE_SECRET_KEY": "your-key",
    "ZOHO_EMAIL": "your-email",
    "ZOHO_PASSWORD": "your-password"
  }
}
```

## CI/CD Process

### GitHub Actions Workflow

The `.github/workflows/python-functions.yml` workflow:

1. **Runs on:**
   - Pull requests to `main` branch
   - Pushes to `main` branch
   - Manual workflow dispatch

2. **Matrix testing:**
   - Python versions: 3.11, 3.12, 3.13

3. **Steps:**
   - Sets up Python with pip caching
   - Creates and caches virtual environment
   - Installs dependencies with constraints (`pip install -r requirements.txt -c constraints.txt`)
   - Installs linting tools (flake8, mypy) and runs linting
   - Installs test dependencies (`pip install pytest pytest-asyncio`) and runs tests
   - Installs security scanner (pip-audit) and runs security scanning

### Security Scanning

- **Dependabot**: Automatically creates PRs for dependency updates
  - Configured in `.github/dependabot.yml`
  - Scans `requirements.txt` daily
  - Groups minor/patch updates

- **pip-audit**: Runs in CI/CD workflow
  - Scans for known vulnerabilities
  - Generates JSON report
  - Uploaded as workflow artifact

### Caching Strategy

- Virtual environment cached by:
  - OS type
  - Python version
  - requirements.txt hash
  - constraints.txt hash

## Azure Deployment

### Deployment Process

Azure Functions uses a **remote build** process by default:

1. **Local development**: Uses `.venv/` for dependency isolation
2. **Azure deployment**: Uses `.python_packages/lib/site-packages` (NOT venv)
3. **Remote build**: Azure installs from `requirements.txt` on Azure servers

### Deployment Scripts

**Windows:**

```bash
<function-app-root>/deploy-azure-functions.bat
```

**Linux/Mac:**

```bash
<function-app-root>/deploy-azure-functions.sh
```

Both scripts:

- Create/activate virtual environment
- Install dependencies with constraints (for local testing)
- Test functions locally
- Deploy to Azure using `func azure functionapp publish`

### Important Deployment Notes

- ⚠️ **constraints.txt** may not be used by Azure remote build
- ✅ Azure remote build installs from `requirements.txt` only
- ✅ Local venv is for development/testing only

### Deployment Configuration

The deployment uses:

- Function App: `<your-function-app-name>` (e.g., `func-tcdynamics-contact`)
  The deployment uses:

- Function App: `<your-function-app-name>` (e.g., `func-tcdynamics-contact`)
- Deployment method: `func azure functionapp publish --nozip`
- Remote build: Enabled by default (installs on Azure servers)

## Troubleshooting

### Virtual Environment Not Detected

**Problem:** Azure Functions Core Tools doesn't detect `.venv`

**Solution:**

- Ensure `.venv/` is in `<function-app-root>/` (where `host.json` is)
- Recreate the virtual environment if moved
- Verify `func host start` is run from `<function-app-root>/` directory

### Import Errors After Deployment

**Problem:** Functions work locally but fail in Azure

**Solution:**

- Verify all dependencies are in `requirements.txt`
- Check Azure deployment logs for missing packages
- Ensure `requirements.txt` has pinned versions
- Azure remote build may need explicit package versions

### Dependency Version Conflicts

**Problem:** Different behavior between local and Azure

**Solution:**

- Use `constraints.txt` for local development
- Ensure `requirements.txt` has compatible versions
- **Test with same Python version locally as Azure:**
  - **Check local Python version:**
    - Windows/Linux: `python --version` or `python3 --version`
    - Verify which Python is active: `where python` (Windows) or `which python3` (Linux/Mac)
  - **Check Azure Function App Python version:**
  - **Manage multiple Python versions locally:**
    - **pyenv** (recommended for version management):
      - Install: `curl https://pyenv.run | bash` (Linux/Mac) or use pyenv-win for Windows
      - Set version: `pyenv install 3.11.12 && pyenv local 3.11.12` (replace `3.11.12` with your desired version)
    - **virtualenv/venv** (isolate project environment):
      - Create: `python -m venv .venv` or `python3 -m venv .venv`
      - Activate: `.venv\Scripts\activate` (Windows) or `source .venv/bin/activate` (Linux/Mac)
      - Verify: `python --version` after activation should match Azure version
      - **Note:** Ensure the venv's Python path is in your PATH or activate the venv before running functions locally

### CI/CD Failures

**Problem:** GitHub Actions workflow fails

**Solution:**

- Check Python version compatibility
- Verify `requirements.txt` and `constraints.txt` are valid
- Review pip-audit security scan results
- Check workflow logs for specific error messages

## Best Practices

1. ✅ Always use virtual environment for local development
2. ✅ Pin versions in `requirements.txt` for reproducibility
3. ✅ Use `constraints.txt` for local development consistency
4. ✅ Test locally before deploying to Azure
5. ✅ Keep `requirements.txt` and `constraints.txt` in sync
6. ✅ Review Dependabot PRs regularly for security updates
7. ✅ Run tests before committing changes
8. ✅ Document any new dependencies and their purpose

## Additional Resources

- [Azure Functions Python Developer Guide](https://learn.microsoft.com/en-us/azure/azure-functions/functions-reference-python)
- [Python Virtual Environments](https://docs.python.org/3/library/venv.html)
- [pip-tools Documentation](https://pip-tools.readthedocs.io/)
- [Azure Functions Core Tools](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local)
