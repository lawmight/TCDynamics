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

## AI Prompt Configuration Variables

### `AI_PROMPT_TYPE` (Optional)

**Description**: Type of prompt template to use for AI interactions.

**Type**: String

**Default**: `chat`

**Valid Values**: `chat`, `workspace`, `assistant`

**Usage**: Used by `api/_lib/prompt-generator.js` to select the appropriate prompt template.

- `chat`: Default chat assistant prompt (optimized for French SMEs)
- `workspace`: Workspace chat prompt (optimized for workflow automation)
- `assistant`: Generic assistant prompt

**Example**:
```bash
AI_PROMPT_TYPE=workspace
AI_PROMPT_TYPE=chat
```

**Note**: This affects all AI endpoints (`/api/chat`, `/api/vertex?action=chat`) unless overridden per-request.

### `AI_PROMPT_LANGUAGE` (Optional)

**Description**: Language preference for AI prompts and responses.

**Type**: String

**Default**: `fr` (for chat endpoint), `en` (for vertex endpoint)

**Valid Values**: `fr`, `en`

**Usage**: Used by `api/_lib/prompt-generator.js` to select the language-specific prompt variant.

**Example**:
```bash
AI_PROMPT_LANGUAGE=fr
AI_PROMPT_LANGUAGE=en
```

**Note**: This sets the default language, but individual requests can override this via the `promptLanguage` parameter.

### `AI_CUSTOM_PROMPT` (Optional)

**Description**: Custom system prompt to override default prompts.

**Type**: String

**Default**: Not set (uses default prompts based on `AI_PROMPT_TYPE` and `AI_PROMPT_LANGUAGE`)

**Usage**: Used by `api/_lib/prompt-generator.js` as a complete override for all prompt templates.

**Example**:
```bash
AI_CUSTOM_PROMPT="You are a specialized AI assistant for workflow automation. Always respond in French and focus on practical solutions for French SMEs."
```

**Note**: When set, this completely overrides all default prompts regardless of `AI_PROMPT_TYPE` or `AI_PROMPT_LANGUAGE` settings. Use this for complete customization of AI behavior.

## Payment Variables

### `PUBLIC_CHECKOUT_SECRET` (Optional)

**Description**: Secret token for protecting the public checkout endpoint (`/api/polar/create-checkout-session?public=true`). Used in the `X-Checkout-Token` header.

**Type**: String

**Default**: Not set (endpoint is accessible without token, less secure but simpler)

**Usage**: Used by `api/polar/create-checkout-session.js` for optional token-based protection of public checkout endpoint when `?public=true` query parameter is present.

**Recommendation**: Set a secure random string in production for additional security:
```bash
# Generate a secure token
openssl rand -hex 32
```

**Example**:
```bash
PUBLIC_CHECKOUT_SECRET=your-secure-random-token-here
```

**Note**: This is optional but recommended for production environments. If not set, the endpoint is publicly accessible without token validation (simpler but less secure).

### `MIN_CHECKOUT_AMOUNT` (Optional)

**Description**: Minimum checkout amount in cents for public checkout endpoint.

**Type**: Integer (cents)

**Default**: `216000` (2160€)

**Usage**: Used by `api/polar/create-checkout-session.js` (when `?public=true`) and `apps/frontend/src/pages/CheckoutEnterprise.tsx` for validating minimum checkout amounts.

**Example**:
```bash
MIN_CHECKOUT_AMOUNT=216000  # 2160€
MIN_CHECKOUT_AMOUNT=300000  # 3000€
```

**Note**: This value is used for validation in both the API endpoint and frontend form. Amount must be provided in cents (e.g., 216000 for 2160€).

## Payment Variables

### `PUBLIC_CHECKOUT_SECRET` (Optional)

**Description**: Secret token for protecting the public checkout endpoint (`/api/polar/create-checkout-session?public=true`). Used in the `X-Checkout-Token` header.

**Type**: String

**Default**: Not set (endpoint is accessible without token, less secure but simpler)

**Usage**: Used by `api/polar/create-checkout-session.js` for optional token-based protection of public checkout endpoint when `?public=true` query parameter is present.

**Recommendation**: Set a secure random string in production for additional security:
```bash
# Generate a secure token
openssl rand -hex 32
```

**Example**:
```bash
PUBLIC_CHECKOUT_SECRET=your-secure-random-token-here
```

**Note**: This is optional but recommended for production environments. If not set, the endpoint is publicly accessible without token validation (simpler but less secure).

### `MIN_CHECKOUT_AMOUNT` (Optional)

**Description**: Minimum checkout amount in cents for public checkout endpoint.

**Type**: Integer (cents)

**Default**: `216000` (2160€)

**Usage**: Used by `api/polar/create-checkout-session.js` (when `?public=true`) and `apps/frontend/src/pages/CheckoutEnterprise.tsx` for validating minimum checkout amounts.

**Example**:
```bash
MIN_CHECKOUT_AMOUNT=216000  # 2160€
MIN_CHECKOUT_AMOUNT=300000  # 3000€
```

**Note**: This value is used for validation in both the API endpoint and frontend form. Amount must be provided in cents (e.g., 216000 for 2160€).

## Related Documentation

- See `api/_lib/pii-hash.js` for implementation details
- See `api/_lib/logger.js` for how PII hashing is used in logging

## Payment Variables

### `PUBLIC_CHECKOUT_SECRET` (Optional)

**Description**: Secret token for protecting the public checkout endpoint (`/api/polar/create-checkout-session?public=true`). Used in the `X-Checkout-Token` header.

**Type**: String

**Default**: Not set (endpoint is accessible without token, less secure but simpler)

**Usage**: Used by `api/polar/create-checkout-session.js` for optional token-based protection of public checkout endpoint when `?public=true` query parameter is present.

**Recommendation**: Set a secure random string in production for additional security:
```bash
# Generate a secure token
openssl rand -hex 32
```

**Example**:
```bash
PUBLIC_CHECKOUT_SECRET=your-secure-random-token-here
```

**Note**: This is optional but recommended for production environments. If not set, the endpoint is publicly accessible without token validation (simpler but less secure).

### `MIN_CHECKOUT_AMOUNT` (Optional)

**Description**: Minimum checkout amount in cents for public checkout endpoint.

**Type**: Integer (cents)

**Default**: `216000` (2160€)

**Usage**: Used by `api/polar/create-checkout-session.js` (when `?public=true`) and `apps/frontend/src/pages/CheckoutEnterprise.tsx` for validating minimum checkout amounts.

**Example**:
```bash
MIN_CHECKOUT_AMOUNT=216000  # 2160€
MIN_CHECKOUT_AMOUNT=300000  # 3000€
```

**Note**: This value is used for validation in both the API endpoint and frontend form. Amount must be provided in cents (e.g., 216000 for 2160€).
- See `api/polar/create-checkout-session.js` for checkout endpoint implementation (supports both authenticated and public flows via `?public=true` query parameter)
- See `apps/frontend/src/pages/CheckoutEnterprise.tsx` for frontend checkout page
