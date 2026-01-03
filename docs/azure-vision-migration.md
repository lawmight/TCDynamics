# Azure Vision Migration Plan

**Status**: Planning
**Retirement Date**: September 25, 2028
**Recommendation**: Migrate by September 2026

## Context

The project's archived functions (`apps/functions-archive/`) used the **Azure Computer Vision - Image Analysis API**. This API is deprecated and will be retired.

## Migration Path

Microsoft recommends migrating to the **Image Analysis 4.0** API (part of Azure AI Vision).

### Key Steps

1.  **Identify Usage**: Check archived functions for `azure-ai-vision-imageanalysis` usage.
2.  **Update SDK**: Migrate to the latest Azure AI Vision SDK.
3.  **Test**: Verify parity with new Image Analysis 4.0 features.

## References

- [Migration Options - Azure AI Vision](https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/migration-options)
