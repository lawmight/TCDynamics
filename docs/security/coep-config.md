# COEP Header Rationale

## Why `Cross-Origin-Embedder-Policy: credentialless`?

We use `Cross-Origin-Embedder-Policy: credentialless` to enable high-performance browser features like `SharedArrayBuffer` while maintaining compatibility with third-party resources.

### COEP Options Compared

```mermaid
flowchart LR
  subgraph RequireCorp["require-corp"]
    RC_Strict[Strict: CORP required]
    RC_Block[Blocks 3rd party without CORP]
  end

  subgraph Credentialless["credentialless"]
    CL_Isolate[Cross-origin isolated]
    CL_Load[Load 3rd party without CORP]
    CL_SAB[SharedArrayBuffer OK]
  end

  RequireCorp --> Credentialless
```

### Isolation Outcome

```mermaid
flowchart TB
  COEP["COEP: credentialless"]
  COOP["COOP: same-origin"]
  COEP --> Isolated[Cross-Origin Isolated]
  COOP --> Isolated
  Isolated --> SAB[SharedArrayBuffer available]
  Isolated --> NoCORP["3rd party resources still load"]
```

### The Problem

- Modern browser features (like `SharedArrayBuffer`, used by WASM libraries) require a "Cross-Origin Isolated" environment.
- Traditionally, this required:
  - `Cross-Origin-Opener-Policy: same-origin`
  - `Cross-Origin-Embedder-Policy: require-corp`
- `require-corp` is strict: it blocks **all** cross-origin subresources (images, scripts, styles) unless they explicitly send a `Cross-Origin-Resource-Policy` (CORP) header. Many 3rd party services (CDNs, analytics, social widgets) do not send this header, breaking the app.

### The Solution: `credentialless`

- `credentialless` provides the necessary isolation for `SharedArrayBuffer`.
- **Benefit**: It allows loading cross-origin resources _without_ requiring them to send CORP headers, by treating them as if they were requested without credentials (cookies, client certs).
- **Result**: We get security and high-performance features without breaking external integrations.

## References

- [MDN: Cross-Origin-Embedder-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Embedder-Policy)
- [Vercel Guide: SharedArrayBuffer is not defined](https://vercel.com/kb/guide/fix-shared-array-buffer-not-defined-nextjs-react)
