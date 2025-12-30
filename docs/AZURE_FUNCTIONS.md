# Azure Functions Archive & Migration

This document covers the archived Azure Functions and the required migration plan for the Azure Vision API.

## Archive Overview

### Archived Date
December 20, 2025

### Reason for Archiving
Azure Functions were archived to simplify the project structure. The functionality may have been replaced by Vercel serverless API routes or is no longer actively used.

### Location
`apps/functions-archive/`

---

## Archive Contents

- `functions/` - Original Azure Functions code
  - `function_app.py` - Main function app with HTTP endpoints
  - `services/` - Service layer implementation
  - `requirements.txt` - Python dependencies
  - `constraints.txt` - Pinned dependency versions
  - All configuration and deployment files

- `workflow-python-functions.yml` - CI/CD workflow for Python Functions

### Original Functionality

The archived functions included:

- Health check endpoint
- Contact form handler
- Demo form handler
- AI chat endpoint
- Vision/image analysis endpoint
- Payment intent creation
- Subscription creation
- Warm-up timer trigger

---

## How to Restore

1. Move `apps/functions-archive/functions/` back to `apps/functions/`
2. Restore `.github/workflows/python-functions.yml` from archive (copy `workflow-python-functions.yml` back)
3. Update `.github/dependabot.yml` to re-enable Python package ecosystem
4. Reinstall Python virtual environment: `cd apps/functions && python -m venv .venv`
5. Install dependencies: `pip install -r requirements.txt -c constraints.txt`
6. Update documentation to reflect restored functions

### Notes

- Virtual environment (`.venv/`) is not included in archive (gitignored)
- Local settings may need to be reconfigured
- Azure deployment scripts are included for reference

---

## Azure Vision API Migration Plan

### Issue Summary

The archived Azure Functions use `azure-ai-vision-imageanalysis` package, which depends on the Azure Computer Vision - Image Analysis API.

**Microsoft has announced the retirement of this API:**

- **Retirement Date**: September 25, 2028
- **Migration Deadline**: September 2026 (recommended)
- **Current Status**: Using stable version `1.0.0` (updated from beta `1.0.0b2`)

### Current Implementation

- **Package**: `azure-ai-vision-imageanalysis==1.0.0`
- **Location**: `apps/functions-archive/functions/requirements.txt`
- **Usage**: Vision/image analysis endpoint in archived Azure Functions

### Migration Options

Microsoft recommends migrating to one of these alternatives:

1. **Azure AI Vision (v4.0)** - New unified vision service
2. **Azure AI Services - Computer Vision v3.2** - Updated API
3. **Alternative cloud providers** (AWS Rekognition, Google Cloud Vision API)
4. **Open-source solutions** (if applicable)

---

## Migration Timeline

- **Q1 2026**: Research and evaluate migration options (8-12 hours)
- **Q2 2026**: Select migration target, create implementation plan, and begin development (4-6 hours planning + 16-24 hours implementation)
- **Q3 2026 (by August)**: Complete testing, validation, and deployment before September 2026 deadline (8-12 hours)
- **Target Completion**: August 2026 (1 month buffer before September 2026 deadline)

**Total Estimated Effort**: 36-54 hours (4.5-7 working days)

**Backlog Reference**: See `md/docs/implementation-tasks.md` for detailed epic breakdown with steps, owners, and effort estimates.

---

## Action Items

### Phase 1: Research & Evaluation (Q1 2026)
- [ ] Research Azure AI Vision v4.0 capabilities and migration path
- [ ] Evaluate alternative solutions (AWS, Google Cloud, open-source)
- [ ] Assess impact on existing functionality
- [ ] Document findings and recommendation

### Phase 2: Implementation Planning (Q2 2026)
- [ ] Create detailed migration implementation plan
- [ ] Identify breaking changes and required code modifications
- [ ] Plan test strategy for dev environment validation

### Phase 3: Development & Testing (Q2-Q3 2026)
- [ ] Update `requirements.txt` and `constraints.txt` with new dependency
- [ ] Refactor `services/client_manager.py` to use new Vision API client
- [ ] Update `function_app.py` `ai_vision` endpoint for new API
- [ ] Update test mocks and assertions in `test_azure_functions.py`
- [ ] Test migration in development environment
- [ ] Validate feature parity (caption extraction, text reading)

### Phase 4: Validation & Deployment (Q3 2026, before September)
- [ ] Deploy to staging environment (if functions are restored)
- [ ] End-to-end testing with real image samples
- [ ] Update documentation and migration guide
- [ ] Remove deprecated `azure-ai-vision-imageanalysis` dependency
- [ ] Monitor for issues post-migration

**See `md/docs/implementation-tasks.md` for detailed epic with owner assignments and effort estimates.**

---

## Risk Assessment

**Current Risk Level**: LOW (functions are archived, not actively used)

**If Functions Are Restored**:

- Migration must be completed before September 2026
- Service disruption risk if migration is delayed
- Potential breaking changes in new API versions

---

## Dependency Policy

To prevent pre-release dependencies in production requirements:

1. **Manual Review**: Always review `requirements.txt` and `constraints.txt` for pre-release versions (indicated by `a`, `b`, `rc`, or `dev` suffixes)

2. **CI Check** (if functions are restored): Add a validation step to CI/CD pipeline:
   ```bash
   # Check for pre-release versions in requirements.txt
   if grep -E "==[0-9]+\.[0-9]+\.[0-9]+(a|b|rc|dev)" apps/functions/requirements.txt; then
     echo "❌ Pre-release dependencies detected in requirements.txt"
     exit 1
   fi
   ```

3. **Dependabot**: Ensure `.github/dependabot.yml` is configured to update Python dependencies

---

## References

- [Microsoft Migration Guide](https://learn.microsoft.com/azure/ai-services/computer-vision/migration-options)
- [Azure AI Vision Documentation](https://learn.microsoft.com/azure/ai-services/computer-vision/)
- Package: [azure-ai-vision-imageanalysis on PyPI](https://pypi.org/project/azure-ai-vision-imageanalysis/)

---

## Notes

- Functions are currently archived, reducing immediate urgency
- If functions are restored, migration planning should begin immediately
- Pre-release dependency check should be added to CI/CD if functions are restored

---

**Last Updated**: January 2025
**Next Review**: Q2 2026
