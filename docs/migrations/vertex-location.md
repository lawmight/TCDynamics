# Vertex AI Location Configuration Migration Guide

## Overview

The default `VERTEX_LOCATION` has been reverted from `'global'` to `'us-central1'` to maintain backward compatibility and ensure data residency compliance for existing deployments.

## Change Details

**Date**: 2025-01-01
**Files Affected**:

- `api/_lib/vertex.js`
- `apps/frontend/api/_lib/vertex.js`

**Change**: The default location in `getProjectConfig()` has been changed from `'global'` back to `'us-central1'`.

## Impact

### For Existing Deployments

✅ **No action required** - Existing deployments will continue to use `'us-central1'` by default, maintaining prior behavior and data residency guarantees.

### For New Deployments

✅ **No action required** - New deployments will default to `'us-central1'`, ensuring consistent behavior.

## Opting Into Global Location

If you need to use the `'global'` location (e.g., for access to global-only features or endpoints), you can explicitly set the environment variable:

```bash
VERTEX_LOCATION=global
```

### Important Considerations When Using `'global'`

⚠️ **Data Residency**: When using `'global'`, your data may be processed outside your specified region. This can impact:

- Compliance with data residency requirements (GDPR, regional regulations)
- Data sovereignty guarantees
- Latency characteristics

⚠️ **Feature Availability**: Some Vertex AI features may be unavailable or behave differently when using the `'global'` location:

- Regional-specific model variants
- Regional compliance features
- Some advanced features may only be available in specific regions

⚠️ **Endpoint Routing**: The code automatically routes `'global'` requests to the `us-central1` endpoint while using `'global'` in the API path. This is handled transparently by the implementation.

## Migration Steps

### If You Were Relying on `'global'` Default

If your deployment was relying on the previous `'global'` default, you need to explicitly set:

```bash
VERTEX_LOCATION=global
```

### Verification

To verify which location is being used, check your environment variables:

```bash
# Check current setting
echo $VERTEX_LOCATION

# Or in your deployment platform (Vercel, etc.)
# Check the environment variable configuration
```

## Code Reference

The location is configured in `getProjectConfig()`:

```javascript
// Default to 'us-central1' for backward compatibility. Using 'global' (via VERTEX_LOCATION env var)
// changes data residency (data may be processed outside your region) and some features may be
// unavailable. Set VERTEX_LOCATION=global explicitly if you need global endpoint access.
const location = process.env.VERTEX_LOCATION || 'us-central1'
```

## Related Documentation

- [Google Cloud Vertex AI Locations](https://cloud.google.com/vertex-ai/docs/general/locations)
- [Vertex AI Data Residency](https://cloud.google.com/vertex-ai/docs/general/data-residency)

---

**Last Updated**: 2025-01-01
