# NIA Sources Tracking

## Indexed Resources

### Repositories

- **anthropics/skills** - https://github.com/anthropics/skills.git
  - **Indexed**: 2025-01-XX
  - **Status**: Indexing in progress (cloning stage)
  - **Description**: Public repository containing example skills for Claude, including creative, development, enterprise, and document skills
  - **Branch**: main

## Research Sessions

### 2025-01-XX: Website Structure & Modern Trends Analysis

- **Topic**: Current website design trends 2024-2025, page structure, navigation patterns
- **Sources Used**:
  - NIA Web Search: "current website design trends 2024 2025 modern web architecture page structure"
  - NIA Web Search: "single page application vs multi-page website 2024 best practices user experience"
  - NIA Deep Research Agent: Web design trends comparison for SaaS platforms
- **Key Findings**: Documented in research analysis below

### 2025-01-XX: SaaS App Entry CTA Placement

- **Topic**: Where to place the primary app/login entry point on a SaaS marketing homepage
- **Sources Used**:
  - NIA Web Search: "best practice CTA placement SaaS homepage link to app login dashboard hero vs header"
  - NIA Deep Research Agent: Placement comparison (header nav vs hero CTA vs secondary sections)
- **Key Findings**:
  - Make the primary app/login entry a prominent header button (top-right) for returning users.
  - Keep hero CTAs focused on acquisition (sign-up/demo) to avoid diluting conversion intent.
  - Secondary/backup links can live in footer or secondary sections; lower visibility, not primary.

### 2025-12-08: Industry-tier SaaS Website Comparison vs TCDynamics

- **Topic**: Benchmark WorkFlowAI/TCDynamics marketing site against top B2B SaaS/AI automation landing patterns
- **Sources Used**:
  - NIA Web Search: "best B2B SaaS landing page examples 2025 dev tools automation"
  - NIA Web Search: "AI workflow automation platform website design 2025 conversion best practices"
  - NIA Web Search: "B2B SaaS homepage structure hero CTA pricing social proof 2025"
  - NIA Web Search: "enterprise software landing page benchmarks trust signals case studies 2025"
- **Key Findings (high level)**:
  - Industry leaders show an above-the-fold product screenshot/video plus single focused CTA (demo or start free) tied to a clear ICP.
  - Social proof relies on real customer logos, numbers with sources, and concise 2–3 case-study snippets; trust badges for security/compliance are visible.
  - Pricing is simple (monthly/annual toggle, usage/seat clarity) with transparent in-product onboarding; fake metrics or filler testimonials erode credibility.
  - Navigation keeps a persistent top-right login/app button; hero CTAs stay acquisition-focused, not technical jargon.

### 2025-12-08: Industry Readiness Technical Plan (Nia-backed)

- **Topic**: Security, performance, observability, payments, CI/CD hardening across Vercel + Azure Functions stack
- **Sources Used**:
  - Vercel security headers / production checklist (https://vercel.com/docs/headers/security-headers, https://vercel.com/docs/production-checklist)
  - CSP/CORS hardening (https://dev.to/pocketportfolio/hardening-a-vercel-app-csp-cors-and-service-workers-that-dont-bite-1k2m)
  - Core Web Vitals thresholds (https://web.dev/articles/defining-core-web-vitals-thresholds)
  - CWV 2025 update (https://webstandards.net/article/3)
  - CWV guide (https://nitropack.io/blog/post/core-web-vitals)
  - Sentry Vite plugin (https://docs.sentry.io/platforms/javascript/sourcemaps/uploading/vite/)
  - Stripe webhook/idempotency/retries (https://stripe.dev/blog/building-solid-stripe-integrations-developers-guide-success, https://hookdeck.com/blog/webhooks-at-scale, https://medium.com/@sohail_saifii/handling-payment-webhooks-reliably-idempotency-retries-validation-69b762720bf5)
  - Playwright CI with GitHub Actions (https://software-testing-tutorials-automation.com/2025/08/run-playwright-tests-github-actions.html, https://www.youtube.com/watch?v=9xuRckyrcKs)
- **Key Findings**:
  - Enforce CSP/HSTS/permissions policy on Vercel/Azure Functions with strict origin allowlists.
  - CWV targets remain LCP 2.5s/INP 200ms/CLS 0.1; INP is now primary interaction metric.
  - Sentry Vite plugin supports source map upload gated by env vars; integrate only on production builds.
  - Stripe webhooks must combine signature verification, idempotency keys, and retry-safe handlers; alert on failures.
  - CI gates should run type-check, lint, tests, coverage threshold, build, and Playwright smoke; add SBOM/vuln scans.
