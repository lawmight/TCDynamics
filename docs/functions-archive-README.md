# Azure Functions Archive

This directory contains archived Azure Functions (Python) code that was previously part of the TCDynamics project.

## Archived Date

December 20, 2025

## Reason for Archiving

Azure Functions were archived to simplify the project structure. The functionality may have been replaced by Vercel serverless API routes or is no longer actively used.

## Contents

- `functions/` - Original Azure Functions code
  - `function_app.py` - Main function app with HTTP endpoints
  - `services/` - Service layer implementation
  - `requirements.txt` - Python dependencies
  - `constraints.txt` - Pinned dependency versions
  - All configuration and deployment files

- `workflow-python-functions.yml` - CI/CD workflow for Python Functions

## How to Restore

1. Move `apps/functions-archive/functions/` back to `apps/functions/`
2. Restore `.github/workflows/python-functions.yml` from archive (copy `workflow-python-functions.yml` back)
3. Update `.github/dependabot.yml` to re-enable Python package ecosystem
4. Reinstall Python virtual environment: `cd apps/functions && python -m venv .venv`
5. Install dependencies: `pip install -r requirements.txt -c constraints.txt`
6. Update documentation to reflect restored functions

## Original Functionality

The archived functions included:

- Health check endpoint
- Contact form handler
- Demo form handler
- AI chat endpoint
- Vision/image analysis endpoint
- Payment intent creation
- Subscription creation
- Warm-up timer trigger

## Notes

- Virtual environment (`.venv/`) is not included in archive (gitignored)
- Local settings may need to be reconfigured
- Azure deployment scripts are included for reference

## Important: Azure Vision API Retirement

The archived functions use `azure-ai-vision-imageanalysis` (now pinned to stable v1.0.0). **Microsoft has announced the retirement of the Azure Computer Vision - Image Analysis API on September 25, 2028**, with migration recommended by September 2026.

If you restore these functions, you must plan for migration to alternative solutions. See `docs/azure-vision-migration.md` in the project root for migration tracking and planning.
