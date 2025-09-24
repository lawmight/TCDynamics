# TCDynamics Deployment Fix - Background Agent Prompt

## Mission: Fix Broken Deployment Pipeline and Configuration Issues

You are tasked with fixing the TCDynamics deployment pipeline and resolving all configuration inconsistencies. The project has been battling Azure Functions deployment issues, authentication problems, and environment configuration chaos.

## Current State Analysis

**What's Broken:**

- Azure Functions deployment pipeline is unstable
- Multiple authentication methods causing confusion
- Function app naming inconsistencies
- Environment variable configuration scattered
- Documentation references outdated URLs and names
- DNS resolution issues with Azure Functions

**What's Working:**

- React frontend builds successfully
- Azure Functions Python v2 model (recent conversion)
- Security enhancements implemented
- Comprehensive testing setup

## Phase 1: Audit and Cleanup (Priority: HIGH)

### Step 1.1: Function App Naming Audit

- [ ] Verify actual Azure Function App name in Azure Portal
- [ ] Check all references in GitHub workflows, environment files, and documentation
- [ ] Identify and document all naming inconsistencies
- [ ] Create a single source of truth for function app naming

### Step 1.2: Authentication Method Consolidation

- [ ] Review all authentication methods currently in use
- [ ] Choose ONE authentication method (recommend OIDC for security)
- [ ] Remove all references to other authentication methods
- [ ] Update GitHub secrets to use only the chosen method

### Step 1.3: Environment Variable Audit

- [ ] Audit all environment variable references across the codebase
- [ ] Identify hardcoded URLs vs environment variables
- [ ] Create a single environment configuration file
- [ ] Ensure frontend and backend use consistent variable names

## Phase 2: Configuration Standardization (Priority: HIGH)

### Step 2.1: GitHub Workflow Cleanup

- [ ] Review `.github/workflows/tcdynamics-hybrid-deploy.yml`
- [ ] Remove all commented-out code and unused steps
- [ ] Consolidate authentication to single method
- [ ] Fix all function app name references
- [ ] Add proper error handling and rollback mechanisms

### Step 2.2: Environment Configuration

- [ ] Create standardized `.env.example` files for both frontend and backend
- [ ] Update `src/utils/config.ts` to use consistent variable names
- [ ] Ensure all hardcoded URLs are replaced with environment variables
- [ ] Add validation for required environment variables

### Step 2.3: Documentation Update

- [ ] Update `DEPLOYMENT.md` with correct function app names
- [ ] Fix all URLs in `DEPLOYMENT-SUMMARY.md`
- [ ] Update `AZURE_DEPLOYMENT_FIX.md` with current solutions
- [ ] Remove outdated troubleshooting steps

## Phase 3: Deployment Pipeline Stabilization (Priority: MEDIUM)

### Step 3.1: Azure Functions Deployment

- [ ] Test deployment with chosen authentication method
- [ ] Add comprehensive error handling
- [ ] Implement proper rollback mechanisms
- [ ] Add deployment verification steps

### Step 3.2: Frontend Deployment

- [ ] Verify OVHcloud deployment process
- [ ] Ensure environment variables are properly injected
- [ ] Test CORS configuration with Azure Functions
- [ ] Add health check endpoints

### Step 3.3: Integration Testing

- [ ] Test end-to-end deployment process
- [ ] Verify all API endpoints are accessible
- [ ] Test contact and demo forms
- [ ] Verify AI chat and vision features

## Phase 4: Monitoring and Maintenance (Priority: LOW)

### Step 4.1: Monitoring Setup

- [ ] Add deployment status monitoring
- [ ] Implement health check endpoints
- [ ] Add error logging and alerting
- [ ] Create deployment success/failure notifications

### Step 4.2: Documentation Maintenance

- [ ] Create deployment runbook
- [ ] Document troubleshooting procedures
- [ ] Add rollback procedures
- [ ] Create maintenance schedule

## Specific Files to Fix

### Critical Files (Fix First):

1. `.github/workflows/tcdynamics-hybrid-deploy.yml` - Main deployment pipeline
2. `src/utils/config.ts` - Environment configuration
3. `src/api/azureServices.ts` - API client configuration
4. `DEPLOYMENT.md` - Deployment documentation
5. `DEPLOYMENT-SUMMARY.md` - Deployment summary

### Secondary Files:

1. `AZURE_DEPLOYMENT_FIX.md` - Troubleshooting guide
2. `env.example` - Environment template
3. `TCDynamics/local.settings.json` - Azure Functions local config
4. `staticwebapp.config.json` - Frontend configuration

## Success Criteria

**Phase 1 Complete When:**

- [ ] Single function app name used throughout codebase
- [ ] Single authentication method implemented
- [ ] All environment variables documented and consistent

**Phase 2 Complete When:**

- [ ] GitHub workflow runs without errors
- [ ] All hardcoded URLs replaced with environment variables
- [ ] Documentation matches actual configuration

**Phase 3 Complete When:**

- [ ] Deployment succeeds consistently
- [ ] All endpoints are accessible
- [ ] End-to-end functionality works

**Phase 4 Complete When:**

- [ ] Monitoring and alerting in place
- [ ] Maintenance procedures documented
- [ ] Rollback procedures tested

## Constraints and Requirements

**DO NOT:**

- Change the hybrid architecture (frontend on OVHcloud, backend on Azure)
- Modify the core React application functionality
- Change the Azure Functions Python v2 model
- Alter the security enhancements already implemented

**DO:**

- Use existing GitHub secrets where possible
- Maintain backward compatibility during fixes
- Test each change before moving to next step
- Document all changes made
- Provide clear error messages for troubleshooting

## Expected Timeline

- **Phase 1:** 2-3 hours (audit and cleanup)
- **Phase 2:** 3-4 hours (configuration standardization)
- **Phase 3:** 2-3 hours (deployment stabilization)
- **Phase 4:** 1-2 hours (monitoring setup)

**Total Estimated Time:** 8-12 hours

## Deliverables

1. **Fixed deployment pipeline** that works consistently
2. **Standardized configuration** across all components
3. **Updated documentation** that matches actual setup
4. **Monitoring and alerting** for deployment status
5. **Rollback procedures** for emergency situations

## Start Here

Begin with Phase 1, Step 1.1: Function App Naming Audit. Use the Azure CLI to verify the actual function app name and then systematically update all references throughout the codebase.

Remember: Fix one thing at a time, test thoroughly, and document everything. The goal is to create a stable, maintainable deployment pipeline that works consistently.
