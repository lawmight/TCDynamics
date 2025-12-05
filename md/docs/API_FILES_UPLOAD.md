# `/api/files-upload` endpoint

Securely uploads files to Supabase storage and records metadata for the knowledge base.

## Request

- **Method**: `POST`
- **Body**:
  - `fileName` (string, required)
  - `mimeType` (string, optional)
  - `base64` (string, required) — base64-encoded file contents
  - `size` (number, optional)
- **Query**:
  - `includeSummary` (optional: `true|1|yes|on`) — opt-in to receive a sanitized text summary when safe

## Summary redaction rules

- The API **does not return any summary by default**.
- When `includeSummary` is truthy:
  - The first 280 characters are inspected for PII/confidential patterns (emails, phone numbers, card-like numbers, secrets).
  - If any sensitive token is detected, the summary is **suppressed** and not persisted.
  - If the text is clean, a sanitized summary (PII masked defensively) is stored and returned.

## Responses

**Summary not requested or suppressed (summary omitted)**

```json
{ "success": true, "path": "uploads/173..." }
```

**Summary requested and allowed**

```json
{ "success": true, "path": "uploads/173...", "summary": "Your sanitized text..." }
```

## Notes

- Metadata saved to `knowledge_files` will only contain a summary when it passes the PII check.
- Embeddings are generated independently of the summary and still run even when the summary is omitted.

