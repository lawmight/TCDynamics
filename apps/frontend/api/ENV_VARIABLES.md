# API Environment Variables

This document describes environment variables used by the Vercel serverless API functions.

## Security Variables

### `PII_HASH_SALT` (Optional)

**Description**: Salt value for hashing personally identifiable information (PII) before logging.

**Type**: String

**Default**: Empty string (still hashes but without salt)

**Usage**: Used by `api/_lib/pii-hash.js` to hash sensitive fields like `clerkId`, `userId`, and `orgId` before logging.

**Recommendation**: Set a secure random string in production for additional security:
```bash
# Generate a secure salt
openssl rand -hex 32
```

**Example**:
```bash
PII_HASH_SALT=your-secure-random-salt-here
```

**Note**: This is optional but recommended for production environments. Even without a salt, PII values are still hashed using SHA-256.

## Related Documentation

- See `api/_lib/pii-hash.js` for implementation details
- See `api/_lib/logger.js` for how PII hashing is used in logging
