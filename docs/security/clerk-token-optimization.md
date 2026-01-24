# Clerk Token Optimization

**Last Updated**: 2026-01-21
**Status**: Guidance Document

## Overview

This document provides guidance on keeping Clerk JWT tokens small to avoid HTTP header size issues (431 errors) and improve performance.

## Why Token Size Matters

- Clerk JWT tokens are sent in every authenticated API request
- Large tokens contribute to HTTP header size
- Node.js has a 16KB default header size limit (we've increased to 32KB)
- Smaller tokens mean:
  - Faster requests (less data to transmit)
  - Lower bandwidth usage
  - Fewer 431 errors
  - Better mobile performance

## Current Token Size

Clerk tokens typically contain:
- User ID and authentication claims (~1KB)
- Public metadata (varies - avoid large objects)
- Private metadata (not sent to client, but affects server tokens)
- Session information (~0.5KB)

**Target**: Keep total token size under 10KB

## Best Practices

### 1. Minimize Public Metadata

**Bad** - Storing full arrays/objects:
```javascript
await user.update({
  publicMetadata: {
    preferences: {
      theme: 'dark',
      language: 'fr',
      notifications: { email: true, sms: false, push: true },
      layout: { sidebar: 'left', compact: true },
      // ... many more fields
    },
    recentActivities: [/* large array */],
    savedFilters: [/* another array */]
  }
})
```

**Good** - Store references:
```javascript
await user.update({
  publicMetadata: {
    preferencesId: 'pref_abc123',  // Reference to DB document
    theme: 'dark',                  // Only essential fields
    language: 'fr'
  }
})
```

### 2. Use Database for Large Data

Store user preferences, settings, and complex data in MongoDB:

```javascript
// Store in MongoDB
await User.findOneAndUpdate(
  { clerkId: user.id },
  { 
    preferences: { /* large object */ },
    savedFilters: [ /* array */ ]
  }
)

// Keep Clerk metadata minimal
await user.update({
  publicMetadata: {
    hasPreferences: true  // Just a flag
  }
})
```

### 3. Avoid Nested Objects in Metadata

**Bad**:
```javascript
publicMetadata: {
  settings: {
    ui: {
      sidebar: { position: 'left', collapsed: false },
      theme: { mode: 'dark', accent: 'blue' }
    }
  }
}
```

**Good**:
```javascript
publicMetadata: {
  uiSettingsId: 'ui_abc123'  // Fetch from DB when needed
}
```

### 4. Use Short Property Names

**Bad**:
```javascript
publicMetadata: {
  userPreferredLanguageCode: 'fr',
  userSelectedThemeColorScheme: 'dark',
  userEnabledFeatureFlags: ['chat', 'vision']
}
```

**Good**:
```javascript
publicMetadata: {
  lang: 'fr',
  theme: 'dark',
  features: ['chat', 'vision']
}
```

## Monitoring Token Size

### Check Current Token Size

```javascript
// In browser console
const token = await window.Clerk.session.getToken()
console.log('Token size:', new Blob([token]).size, 'bytes')
```

### Set Up Alerts

Consider monitoring token sizes in production:

```javascript
// In API middleware
const tokenSize = req.headers.authorization?.length || 0
if (tokenSize > 10000) {
  logger.warn('Large token detected', { tokenSize, userId: req.user.id })
}
```

## When to Review

Review token size when:
- Adding new fields to Clerk metadata
- Users report 431 errors
- API performance degrades
- Mobile users experience slow load times

## Related Documentation

- [Clerk Metadata Documentation](https://clerk.com/docs/users/metadata)
- [Environment Setup](../development/environment-setup.md)
- [Authentication](./authentication.md)

---

**Last Updated**: 2026-01-21
