# **all the errors in the last push :**

# **IN THE CI - Pull Request Validation :**

**Test React Frontend :**
**Run tests :**
Run npm run test:coverage
npm run test:coverage
shell: /usr/bin/bash -e {0}
env:
NODE_VERSION: 20
PYTHON_VERSION: 3.11
CI: true

> tcdynamics-frontend@1.0.0 test:coverage
> vitest --coverage

RUN v3.2.4 /home/runner/work/TCDynamics/TCDynamics
Coverage enabled with v8

✓ src/api/**tests**/azureServices.test.ts (23 tests) 3032ms
✓ Azure Services API Client > Contact API > should handle HTTP errors 1003ms
✓ Azure Services API Client > Error Handling and Retries > should retry on network errors 1003ms
✓ Azure Services API Client > Error Handling and Retries > should retry on server errors 1002ms
✓ src/utils/**tests**/security.test.ts (41 tests) 24ms
stdout | src/utils/**tests**/integration.test.ts
[2025-10-08T07:51:27.229Z] INFO: Configuration status check completed {
client: {
environment: 'development',
functionsUrl: 'configured',
analytics: '<boolean>',
debugLogging: '<boolean>',
cache: '<boolean>',
cacheSize: '<number>',
performanceSampling: '<boolean>',
securityStrict: '<boolean>'
},
server: {
openai: 'missing',
vision: 'missing',
email: 'missing',
database: 'missing',
adminKey: '<REDACTED>'
}
}

stdout | src/utils/**tests**/integration.test.ts > Integration Tests > Configuration Integration > should initialize configuration with safe defaults
[2025-10-08T07:51:27.264Z] INFO: Configuration status check completed {
client: {
environment: 'development',
functionsUrl: 'configured',
analytics: '<boolean>',
debugLogging: '<boolean>',
cache: '<boolean>',
cacheSize: '<number>',
performanceSampling: '<boolean>',
securityStrict: '<boolean>'
},
server: {
openai: 'missing',
vision: 'missing',
email: 'missing',
database: 'missing',
adminKey: '<REDACTED>'
}
}

stdout | src/utils/**tests**/integration.test.ts > Integration Tests > Configuration Integration > should handle configuration validation errors gracefully
[2025-10-08T07:51:27.266Z] INFO: Configuration status check completed {
client: {
environment: 'development',
functionsUrl: 'configured',
analytics: '<boolean>',
debugLogging: '<boolean>',
cache: '<boolean>',
cacheSize: '<number>',
performanceSampling: '<boolean>',
securityStrict: '<boolean>'
},
server: {
openai: 'missing',
vision: 'missing',
email: 'missing',
database: 'missing',
adminKey: '<REDACTED>'
}
}

stdout | src/utils/**tests**/integration.test.ts > Integration Tests > Cache Integration > should store and retrieve data with size limits
[2025-10-08T07:51:27.267Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.267Z] INFO: Performance: cache.hit {
duration: '0ms',
metadata: {
key: '<REDACTED>',
accessCount: '<number>',
age: '<number>',
size: '<number>'
}
}

stdout | src/utils/**tests**/integration.test.ts > Integration Tests > Cache Integration > should handle cache size limits and LRU eviction
[2025-10-08T07:51:27.268Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.268Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.268Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.268Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.268Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.268Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.268Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.268Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.268Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.268Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.268Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.268Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.268Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.268Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.269Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.269Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.269Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.269Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.269Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.269Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.269Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.269Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.269Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.269Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.269Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.269Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.269Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.269Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.269Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.270Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.270Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.270Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.270Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.270Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.270Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.270Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.270Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.270Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.270Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.270Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.270Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.270Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.270Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.271Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.271Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.271Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.271Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.271Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.271Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.271Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.271Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.271Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.271Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.271Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.271Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.271Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.271Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.271Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.271Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.271Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.271Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.271Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.271Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.272Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.272Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.272Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.272Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.272Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.272Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.272Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.272Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.272Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.272Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.272Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.272Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.272Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.272Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.272Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.272Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.272Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.272Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.272Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.272Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.273Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.273Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.273Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.273Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.273Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.273Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.273Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.273Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.273Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.273Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.273Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T07:51:27.273Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T07:51:27.273Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}

stdout | src/utils/**tests**/integration.test.ts > Integration Tests > Performance Monitoring Integration > should record metrics without errors
[2025-10-08T07:51:27.277Z] INFO: Performance: integration.test {
duration: '100ms',
metadata: { test: '<boolean>', environment: 'test' }
}

stdout | src/utils/**tests**/integration.test.ts > Integration Tests > End-to-End Integration > should work together without conflicts
[2025-10-08T07:51:27.281Z] INFO: Configuration status check completed {
client: {
environment: 'development',
functionsUrl: 'configured',
analytics: '<boolean>',
debugLogging: '<boolean>',
cache: '<boolean>',
cacheSize: '<number>',
performanceSampling: '<boolean>',
securityStrict: '<boolean>'
},
server: {
openai: 'missing',
vision: 'missing',
email: 'missing',
database: 'missing',
adminKey: '<REDACTED>'
}
}

stdout | src/utils/**tests**/integration.test.ts > Integration Tests > End-to-End Integration > should work together without conflicts
[2025-10-08T07:51:27.281Z] INFO: Performance: integration.e2e { duration: '50ms', metadata: { test: '<boolean>', config: 'loaded' } }

✓ src/utils/**tests**/integration.test.ts (16 tests) 18ms

⎯⎯⎯⎯⎯⎯ Failed Suites 28 ⎯⎯⎯⎯⎯⎯

FAIL src/components/**tests**/AIChatbot.test.tsx [ src/components/__tests__/AIChatbot.test.tsx ]
FAIL src/components/**tests**/AIDemo.test.tsx [ src/components/__tests__/AIDemo.test.tsx ]
FAIL src/components/**tests**/Contact.test.tsx [ src/components/__tests__/Contact.test.tsx ]
FAIL src/components/**tests**/DocumentProcessor.test.tsx [ src/components/__tests__/DocumentProcessor.test.tsx ]
FAIL src/components/**tests**/ErrorBoundary.test.tsx [ src/components/__tests__/ErrorBoundary.test.tsx ]
FAIL src/components/**tests**/FAQ.test.tsx [ src/components/__tests__/FAQ.test.tsx ]
FAIL src/components/**tests**/Features.test.tsx [ src/components/__tests__/Features.test.tsx ]
FAIL src/components/**tests**/Hero.test.tsx [ src/components/__tests__/Hero.test.tsx ]
FAIL src/components/**tests**/HowItWorks.test.tsx [ src/components/__tests__/HowItWorks.test.tsx ]
FAIL src/components/**tests**/LocalAdvantages.test.tsx [ src/components/__tests__/LocalAdvantages.test.tsx ]
FAIL src/components/**tests**/MobileNavigation.test.tsx [ src/components/__tests__/MobileNavigation.test.tsx ]
FAIL src/components/**tests**/OfflineIndicator.test.tsx [ src/components/__tests__/OfflineIndicator.test.tsx ]
FAIL src/components/**tests**/OptimizedImage.test.tsx [ src/components/__tests__/OptimizedImage.test.tsx ]
FAIL src/components/**tests**/Pricing.test.tsx [ src/components/__tests__/Pricing.test.tsx ]
FAIL src/components/**tests**/SocialProof.test.tsx [ src/components/__tests__/SocialProof.test.tsx ]
FAIL src/hooks/**tests**/use-mobile.test.ts [ src/hooks/__tests__/use-mobile.test.ts ]
FAIL src/hooks/**tests**/use-toast.test.ts [ src/hooks/__tests__/use-toast.test.ts ]
FAIL src/hooks/**tests**/useContactForm.test.ts [ src/hooks/__tests__/useContactForm.test.ts ]
FAIL src/hooks/**tests**/useDemoForm.test.ts [ src/hooks/__tests__/useDemoForm.test.ts ]
FAIL src/hooks/**tests**/useFormSubmit.test.ts [ src/hooks/__tests__/useFormSubmit.test.ts ]
FAIL src/hooks/**tests**/useIntersectionObserver.test.ts [ src/hooks/__tests__/useIntersectionObserver.test.ts ]
FAIL src/hooks/**tests**/useToggle.test.ts [ src/hooks/__tests__/useToggle.test.ts ]
FAIL src/pages/**tests**/CheckoutSuccess.test.tsx [ src/pages/__tests__/CheckoutSuccess.test.tsx ]
FAIL src/utils/**tests**/config.test.ts [ src/utils/__tests__/config.test.ts ]
FAIL src/utils/**tests**/logger.test.ts [ src/utils/__tests__/logger.test.ts ]
FAIL src/utils/**tests**/math.test.ts [ src/utils/__tests__/math.test.ts ]
FAIL src/components/ui/**tests**/animated-counter.test.tsx [ src/components/ui/__tests__/animated-counter.test.tsx ]
FAIL src/components/ui/**tests**/button.test.tsx [ src/components/ui/__tests__/button.test.tsx ]
ReferenceError: window is not defined
❯ src/test/setup.ts:16:23
14|
15| // Mock des images
16| Object.defineProperty(window.HTMLImageElement.prototype, 'src', {
| ^
17| set(src) {
18| // Mock pour éviter les erreurs de chargement d'images

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/28]⎯

Test Files 28 failed | 3 passed (31)
Tests 80 passed (80)
Start at 07:51:22
Duration 4.98s (transform 401ms, setup 365ms, collect 236ms, tests 3.07s, environment 258ms, prepare 71ms)

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:16:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:16:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:16:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:16:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:16:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:16:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:16:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:16:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:16:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:16:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:16:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:16:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:16:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:16:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:16:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:16:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:16:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:16:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:16:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:16:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:16:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:16:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:16:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:16:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:16:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:16:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:16:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:16:23

Error: Process completed with exit code 1.

**Test Node.js Backend**
**Install dependencies**

Run npm ci
npm ci
shell: /usr/bin/bash -e {0}
env:
NODE_VERSION: 20
PYTHON_VERSION: 3.11
npm error code EUSAGE
npm error
npm error `npm ci` can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync. Please update your lock file with `npm install` before continuing.
npm error
npm error Missing: @playwright/test@1.56.0 from lock file
npm error Missing: jest@30.2.0 from lock file
npm error Missing: supertest@7.1.4 from lock file
npm error Missing: playwright@1.56.0 from lock file
npm error Missing: @jest/core@30.2.0 from lock file
npm error Missing: @jest/types@30.2.0 from lock file
npm error Missing: import-local@3.2.0 from lock file
npm error Missing: jest-cli@30.2.0 from lock file
npm error Missing: @jest/console@30.2.0 from lock file
npm error Missing: @jest/pattern@30.0.1 from lock file
npm error Missing: @jest/reporters@30.2.0 from lock file
npm error Missing: @jest/test-result@30.2.0 from lock file
npm error Missing: @jest/transform@30.2.0 from lock file
npm error Missing: @types/node@24.7.0 from lock file
npm error Missing: ansi-escapes@4.3.2 from lock file
npm error Missing: ci-info@4.3.1 from lock file
npm error Missing: exit-x@0.2.2 from lock file
npm error Missing: graceful-fs@4.2.11 from lock file
npm error Missing: jest-changed-files@30.2.0 from lock file
npm error Missing: jest-config@30.2.0 from lock file
npm error Missing: jest-haste-map@30.2.0 from lock file
npm error Missing: jest-message-util@30.2.0 from lock file
npm error Missing: jest-regex-util@30.0.1 from lock file
npm error Missing: jest-resolve@30.2.0 from lock file
npm error Missing: jest-resolve-dependencies@30.2.0 from lock file
npm error Missing: jest-runner@30.2.0 from lock file
npm error Missing: jest-runtime@30.2.0 from lock file
npm error Missing: jest-snapshot@30.2.0 from lock file
npm error Missing: jest-util@30.2.0 from lock file
npm error Missing: jest-validate@30.2.0 from lock file
npm error Missing: jest-watcher@30.2.0 from lock file
npm error Missing: micromatch@4.0.8 from lock file
npm error Missing: pretty-format@30.2.0 from lock file
npm error Missing: slash@3.0.0 from lock file
npm error Missing: @bcoe/v8-coverage@0.2.3 from lock file
npm error Missing: collect-v8-coverage@1.0.2 from lock file
npm error Missing: glob@10.4.5 from lock file
npm error Missing: istanbul-lib-coverage@3.2.2 from lock file
npm error Missing: istanbul-lib-instrument@6.0.3 from lock file
npm error Missing: istanbul-lib-report@3.0.1 from lock file
npm error Missing: istanbul-lib-source-maps@5.0.6 from lock file
npm error Missing: istanbul-reports@3.2.0 from lock file
npm error Missing: jest-worker@30.2.0 from lock file
npm error Missing: string-length@4.0.2 from lock file
npm error Missing: v8-to-istanbul@9.3.0 from lock file
npm error Missing: @types/istanbul-lib-coverage@2.0.6 from lock file
npm error Missing: babel-plugin-istanbul@7.0.1 from lock file
npm error Missing: pirates@4.0.7 from lock file
npm error Missing: write-file-atomic@5.0.1 from lock file
npm error Missing: @jest/schemas@30.0.5 from lock file
npm error Missing: @types/istanbul-reports@3.0.4 from lock file
npm error Missing: @types/yargs@17.0.33 from lock file
npm error Missing: @sinclair/typebox@0.34.41 from lock file
npm error Missing: @types/istanbul-lib-report@3.0.3 from lock file
npm error Missing: undici-types@7.14.0 from lock file
npm error Missing: @types/yargs-parser@21.0.3 from lock file
npm error Missing: type-fest@0.21.3 from lock file
npm error Missing: @istanbuljs/load-nyc-config@1.1.0 from lock file
npm error Missing: @istanbuljs/schema@0.1.3 from lock file
npm error Missing: test-exclude@6.0.0 from lock file
npm error Missing: camelcase@5.3.1 from lock file
npm error Missing: find-up@4.1.0 from lock file
npm error Missing: get-package-type@0.1.0 from lock file
npm error Missing: js-yaml@3.14.1 from lock file
npm error Missing: resolve-from@5.0.0 from lock file
npm error Missing: pkg-dir@4.2.0 from lock file
npm error Missing: resolve-cwd@3.0.0 from lock file
npm error Missing: make-dir@4.0.0 from lock file
npm error Missing: supports-color@7.2.0 from lock file
npm error Missing: debug@4.4.3 from lock file
npm error Missing: html-escaper@2.0.2 from lock file
npm error Missing: execa@5.1.1 from lock file
npm error Missing: get-stream@6.0.1 from lock file
npm error Missing: human-signals@2.1.0 from lock file
npm error Missing: merge-stream@2.0.0 from lock file
npm error Missing: npm-run-path@4.0.1 from lock file
npm error Missing: onetime@5.1.2 from lock file
npm error Missing: signal-exit@3.0.7 from lock file
npm error Missing: strip-final-newline@2.0.0 from lock file
npm error Missing: yargs@17.7.2 from lock file
npm error Missing: @jest/get-type@30.1.0 from lock file
npm error Missing: @jest/test-sequencer@30.2.0 from lock file
npm error Missing: babel-jest@30.2.0 from lock file
npm error Missing: deepmerge@4.3.1 from lock file
npm error Missing: glob@10.4.5 from lock file
npm error Missing: jest-circus@30.2.0 from lock file
npm error Missing: jest-docblock@30.2.0 from lock file
npm error Missing: jest-environment-node@30.2.0 from lock file
npm error Missing: parse-json@5.2.0 from lock file
npm error Missing: @types/babel__core@7.20.5 from lock file
npm error Missing: babel-preset-jest@30.2.0 from lock file
npm error Missing: @types/babel__generator@7.27.0 from lock file
npm error Missing: @types/babel__template@7.4.4 from lock file
npm error Missing: @types/babel__traverse@7.28.0 from lock file
npm error Missing: babel-plugin-jest-hoist@30.2.0 from lock file
npm error Missing: babel-preset-current-node-syntax@1.2.0 from lock file
npm error Missing: @babel/plugin-syntax-async-generators@7.8.4 from lock file
npm error Missing: @babel/plugin-syntax-bigint@7.8.3 from lock file
npm error Missing: @babel/plugin-syntax-class-properties@7.12.13 from lock file
npm error Missing: @babel/plugin-syntax-class-static-block@7.14.5 from lock file
npm error Missing: @babel/plugin-syntax-import-attributes@7.27.1 from lock file
npm error Missing: @babel/plugin-syntax-import-meta@7.10.4 from lock file
npm error Missing: @babel/plugin-syntax-json-strings@7.8.3 from lock file
npm error Missing: @babel/plugin-syntax-logical-assignment-operators@7.10.4 from lock file
npm error Missing: @babel/plugin-syntax-nullish-coalescing-operator@7.8.3 from lock file
npm error Missing: @babel/plugin-syntax-numeric-separator@7.10.4 from lock file
npm error Missing: @babel/plugin-syntax-object-rest-spread@7.8.3 from lock file
npm error Missing: @babel/plugin-syntax-optional-catch-binding@7.8.3 from lock file
npm error Missing: @babel/plugin-syntax-optional-chaining@7.8.3 from lock file
npm error Missing: @babel/plugin-syntax-private-property-in-object@7.14.5 from lock file
npm error Missing: @babel/plugin-syntax-top-level-await@7.14.5 from lock file
npm error Missing: @jest/environment@30.2.0 from lock file
npm error Missing: @jest/expect@30.2.0 from lock file
npm error Missing: co@4.6.0 from lock file
npm error Missing: dedent@1.7.0 from lock file
npm error Missing: is-generator-fn@2.1.0 from lock file
npm error Missing: jest-each@30.2.0 from lock file
npm error Missing: jest-matcher-utils@30.2.0 from lock file
npm error Missing: pure-rand@7.0.1 from lock file
npm error Missing: stack-utils@2.0.6 from lock file
npm error Missing: @jest/fake-timers@30.2.0 from lock file
npm error Missing: jest-mock@30.2.0 from lock file
npm error Missing: expect@30.2.0 from lock file
npm error Missing: @sinonjs/fake-timers@13.0.5 from lock file
npm error Missing: @sinonjs/commons@3.0.1 from lock file
npm error Missing: type-detect@4.0.8 from lock file
npm error Missing: @jest/expect-utils@30.2.0 from lock file
npm error Missing: detect-newline@3.1.0 from lock file
npm error Missing: fb-watchman@2.0.2 from lock file
npm error Missing: walker@1.0.8 from lock file
npm error Missing: bser@2.1.1 from lock file
npm error Missing: node-int64@0.4.0 from lock file
npm error Missing: jest-diff@30.2.0 from lock file
npm error Missing: @jest/diff-sequences@30.0.1 from lock file
npm error Missing: @types/stack-utils@2.0.3 from lock file
npm error Missing: jest-pnp-resolver@1.2.3 from lock file
npm error Missing: unrs-resolver@1.11.1 from lock file
npm error Missing: emittery@0.13.1 from lock file
npm error Missing: jest-leak-detector@30.2.0 from lock file
npm error Missing: source-map-support@0.5.13 from lock file
npm error Missing: @jest/globals@30.2.0 from lock file
npm error Missing: @jest/source-map@30.0.1 from lock file
npm error Missing: cjs-module-lexer@2.1.0 from lock file
npm error Missing: glob@10.4.5 from lock file
npm error Missing: strip-bom@4.0.0 from lock file
npm error Missing: @babel/plugin-syntax-jsx@7.27.1 from lock file
npm error Missing: @babel/plugin-syntax-typescript@7.27.1 from lock file
npm error Missing: @jest/snapshot-utils@30.2.0 from lock file
npm error Missing: synckit@0.11.11 from lock file
npm error Missing: picomatch@4.0.3 from lock file
npm error Missing: camelcase@6.3.0 from lock file
npm error Missing: leven@3.1.0 from lock file
npm error Missing: supports-color@8.1.1 from lock file
npm error Missing: mimic-fn@2.1.0 from lock file
npm error Missing: error-ex@1.3.4 from lock file
npm error Missing: json-parse-even-better-errors@2.3.1 from lock file
npm error Missing: lines-and-columns@1.2.4 from lock file
npm error Missing: is-arrayish@0.2.1 from lock file
npm error Missing: find-up@4.1.0 from lock file
npm error Missing: fsevents@2.3.2 from lock file
npm error Missing: playwright-core@1.56.0 from lock file
npm error Missing: ansi-styles@5.2.0 from lock file
npm error Missing: react-is@18.3.1 from lock file
npm error Missing: resolve-from@5.0.0 from lock file
npm error Missing: buffer-from@1.1.2 from lock file
npm error Missing: source-map@0.6.1 from lock file
npm error Missing: escape-string-regexp@2.0.0 from lock file
npm error Missing: char-regex@1.0.2 from lock file
npm error Missing: superagent@10.2.3 from lock file
npm error Missing: component-emitter@1.3.1 from lock file
npm error Missing: cookiejar@2.1.4 from lock file
npm error Missing: debug@4.4.3 from lock file
npm error Missing: fast-safe-stringify@2.1.1 from lock file
npm error Missing: form-data@4.0.4 from lock file
npm error Missing: formidable@3.5.4 from lock file
npm error Missing: mime@2.6.0 from lock file
npm error Missing: asynckit@0.4.0 from lock file
npm error Missing: combined-stream@1.0.8 from lock file
npm error Missing: delayed-stream@1.0.0 from lock file
npm error Missing: @paralleldrive/cuid2@2.2.2 from lock file
npm error Missing: dezalgo@1.0.4 from lock file
npm error Missing: @noble/hashes@1.8.0 from lock file
npm error Missing: asap@2.0.6 from lock file
npm error Missing: @pkgr/core@0.2.9 from lock file
npm error Missing: @unrs/resolver-binding-android-arm-eabi@1.11.1 from lock file
npm error Missing: @unrs/resolver-binding-android-arm64@1.11.1 from lock file
npm error Missing: @unrs/resolver-binding-darwin-arm64@1.11.1 from lock file
npm error Missing: @unrs/resolver-binding-darwin-x64@1.11.1 from lock file
npm error Missing: @unrs/resolver-binding-freebsd-x64@1.11.1 from lock file
npm error Missing: @unrs/resolver-binding-linux-arm-gnueabihf@1.11.1 from lock file
npm error Missing: @unrs/resolver-binding-linux-arm-musleabihf@1.11.1 from lock file
npm error Missing: @unrs/resolver-binding-linux-arm64-gnu@1.11.1 from lock file
npm error Missing: @unrs/resolver-binding-linux-arm64-musl@1.11.1 from lock file
npm error Missing: @unrs/resolver-binding-linux-ppc64-gnu@1.11.1 from lock file
npm error Missing: @unrs/resolver-binding-linux-riscv64-gnu@1.11.1 from lock file
npm error Missing: @unrs/resolver-binding-linux-riscv64-musl@1.11.1 from lock file
npm error Missing: @unrs/resolver-binding-linux-s390x-gnu@1.11.1 from lock file
npm error Missing: @unrs/resolver-binding-linux-x64-gnu@1.11.1 from lock file
npm error Missing: @unrs/resolver-binding-linux-x64-musl@1.11.1 from lock file
npm error Missing: @unrs/resolver-binding-wasm32-wasi@1.11.1 from lock file
npm error Missing: @unrs/resolver-binding-win32-arm64-msvc@1.11.1 from lock file
npm error Missing: @unrs/resolver-binding-win32-ia32-msvc@1.11.1 from lock file
npm error Missing: @unrs/resolver-binding-win32-x64-msvc@1.11.1 from lock file
npm error Missing: napi-postinstall@0.3.4 from lock file
npm error Missing: @napi-rs/wasm-runtime@0.2.12 from lock file
npm error Missing: @emnapi/core@1.5.0 from lock file
npm error Missing: @emnapi/runtime@1.5.0 from lock file
npm error Missing: @tybys/wasm-util@0.10.1 from lock file
npm error Missing: @emnapi/wasi-threads@1.1.0 from lock file
npm error Missing: tslib@2.8.1 from lock file
npm error Missing: makeerror@1.0.12 from lock file
npm error Missing: tmpl@1.0.5 from lock file
npm error Missing: signal-exit@4.1.0 from lock file
npm error Missing: cliui@8.0.1 from lock file
npm error Missing: require-directory@2.1.1 from lock file
npm error Missing: string-width@4.2.3 from lock file
npm error Missing: y18n@5.0.8 from lock file
npm error Missing: yargs-parser@21.1.1 from lock file
npm error Missing: wrap-ansi@7.0.0 from lock file
npm error Missing: emoji-regex@8.0.0 from lock file
npm error Missing: is-fullwidth-code-point@3.0.0 from lock file
npm error Missing: locate-path@5.0.0 from lock file
npm error Missing: argparse@1.0.10 from lock file
npm error Missing: esprima@4.0.1 from lock file
npm error Missing: sprintf-js@1.0.3 from lock file
npm error Missing: p-locate@4.1.0 from lock file
npm error Missing: p-limit@2.3.0 from lock file
npm error Missing: p-try@2.2.0 from lock file
npm error Missing: foreground-child@3.3.1 from lock file
npm error Missing: jackspeak@3.4.3 from lock file
npm error Missing: minimatch@9.0.5 from lock file
npm error Missing: minipass@7.1.2 from lock file
npm error Missing: package-json-from-dist@1.0.1 from lock file
npm error Missing: path-scurry@1.11.1 from lock file
npm error Missing: signal-exit@4.1.0 from lock file
npm error Missing: @isaacs/cliui@8.0.2 from lock file
npm error Missing: @pkgjs/parseargs@0.11.0 from lock file
npm error Missing: string-width@5.1.2 from lock file
npm error Missing: string-width-cjs@4.2.3 from lock file
npm error Missing: strip-ansi@7.1.2 from lock file
npm error Missing: strip-ansi-cjs@6.0.1 from lock file
npm error Missing: wrap-ansi@8.1.0 from lock file
npm error Missing: wrap-ansi-cjs@7.0.0 from lock file
npm error Missing: lru-cache@10.4.3 from lock file
npm error Missing: eastasianwidth@0.2.0 from lock file
npm error Missing: emoji-regex@9.2.2 from lock file
npm error Missing: ansi-regex@6.2.2 from lock file
npm error Missing: ansi-styles@6.2.3 from lock file
npm error Missing: brace-expansion@2.0.2 from lock file
npm error Missing: has-flag@4.0.0 from lock file
npm error Missing: ms@2.1.3 from lock file
npm error Missing: minimatch@9.0.5 from lock file
npm error Missing: brace-expansion@2.0.2 from lock file
npm error Missing: minimatch@9.0.5 from lock file
npm error Missing: brace-expansion@2.0.2 from lock file
npm error Missing: has-flag@4.0.0 from lock file
npm error Missing: locate-path@5.0.0 from lock file
npm error Missing: p-locate@4.1.0 from lock file
npm error Missing: p-limit@2.3.0 from lock file
npm error Missing: ms@2.1.3 from lock file
npm error
npm error Clean install a project
npm error
npm error Usage:
npm error npm ci
npm error
npm error Options:
npm error [--install-strategy <hoisted|nested|shallow|linked>] [--legacy-bundling]
npm error [--global-style] [--omit <dev|optional|peer> [--omit <dev|optional|peer> ...]]
npm error [--include <prod|dev|optional|peer> [--include <prod|dev|optional|peer> ...]]
npm error [--strict-peer-deps] [--foreground-scripts] [--ignore-scripts] [--no-audit]
npm error [--no-bin-links] [--no-fund] [--dry-run]
npm error [-w|--workspace <workspace-name> [-w|--workspace <workspace-name> ...]]
npm error [-ws|--workspaces] [--include-workspace-root] [--install-links]
npm error
npm error aliases: clean-install, ic, install-clean, isntall-clean
npm error
npm error Run "npm help ci" for more info
npm error A complete log of this run can be found in: /home/runner/.npm/\_logs/2025-10-08T07_51_23_900Z-debug-0.log
Error: Process completed with exit code 1.

**Test Azure Functions**
**Run Azure Functions**

Run # Install test dependencies

# Install test dependencies

pip install pytest pytest-cov pytest-asyncio pytest-mock

# Run comprehensive test suite

pytest test_azure_functions.py -v --cov=. --cov-report=xml --tb=short
shell: /usr/bin/bash -e {0}
env:
NODE_VERSION: 20
PYTHON_VERSION: 3.11
pythonLocation: /opt/hostedtoolcache/Python/3.11.13/x64
PKG_CONFIG_PATH: /opt/hostedtoolcache/Python/3.11.13/x64/lib/pkgconfig
Python_ROOT_DIR: /opt/hostedtoolcache/Python/3.11.13/x64
Python2_ROOT_DIR: /opt/hostedtoolcache/Python/3.11.13/x64
Python3_ROOT_DIR: /opt/hostedtoolcache/Python/3.11.13/x64
LD_LIBRARY_PATH: /opt/hostedtoolcache/Python/3.11.13/x64/lib
AZURE_OPENAI_ENDPOINT: https://test.openai.azure.com
AZURE_OPENAI_API_KEY: test-key
AZURE_VISION_ENDPOINT: https://test.vision.azure.com
AZURE_VISION_API_KEY: test-key
COSMOS_CONNECTION_STRING: test-connection-string
STRIPE_SECRET_KEY: sk_test_123
Requirement already satisfied: pytest in /opt/hostedtoolcache/Python/3.11.13/x64/lib/python3.11/site-packages (8.4.2)
Requirement already satisfied: pytest-cov in /opt/hostedtoolcache/Python/3.11.13/x64/lib/python3.11/site-packages (7.0.0)
Collecting pytest-asyncio
Downloading pytest_asyncio-1.2.0-py3-none-any.whl.metadata (4.1 kB)
Collecting pytest-mock
Downloading pytest_mock-3.15.1-py3-none-any.whl.metadata (3.9 kB)
Requirement already satisfied: iniconfig>=1 in /opt/hostedtoolcache/Python/3.11.13/x64/lib/python3.11/site-packages (from pytest) (2.1.0)
Requirement already satisfied: packaging>=20 in /opt/hostedtoolcache/Python/3.11.13/x64/lib/python3.11/site-packages (from pytest) (25.0)
Requirement already satisfied: pluggy<2,>=1.5 in /opt/hostedtoolcache/Python/3.11.13/x64/lib/python3.11/site-packages (from pytest) (1.6.0)
Requirement already satisfied: pygments>=2.7.2 in /opt/hostedtoolcache/Python/3.11.13/x64/lib/python3.11/site-packages (from pytest) (2.19.2)
Requirement already satisfied: coverage>=7.10.6 in /opt/hostedtoolcache/Python/3.11.13/x64/lib/python3.11/site-packages (from coverage[toml]>=7.10.6->pytest-cov) (7.10.7)
Requirement already satisfied: typing-extensions>=4.12 in /opt/hostedtoolcache/Python/3.11.13/x64/lib/python3.11/site-packages (from pytest-asyncio) (4.15.0)
Downloading pytest_asyncio-1.2.0-py3-none-any.whl (15 kB)
Downloading pytest_mock-3.15.1-py3-none-any.whl (10 kB)
Installing collected packages: pytest-mock, pytest-asyncio

Successfully installed pytest-asyncio-1.2.0 pytest-mock-3.15.1
============================= test session starts ==============================
platform linux -- Python 3.11.13, pytest-8.4.2, pluggy-1.6.0 -- /opt/hostedtoolcache/Python/3.11.13/x64/bin/python
cachedir: .pytest_cache
rootdir: /home/runner/work/TCDynamics/TCDynamics/TCDynamics
plugins: anyio-4.11.0, asyncio-1.2.0, cov-7.0.0, mock-3.15.1
asyncio: mode=Mode.STRICT, debug=False, asyncio_default_fixture_loop_scope=None, asyncio_default_test_loop_scope=function
collecting ... collected 0 items / 1 error

==================================== ERRORS ====================================
**\*\*\*\***\_\_\_**\*\*\*\*** ERROR collecting test_azure_functions.py **\*\*\*\***\_\_\_**\*\*\*\***
/opt/hostedtoolcache/Python/3.11.13/x64/lib/python3.11/site-packages/\_pytest/python.py:498: in importtestmodule
mod = import_path(
/opt/hostedtoolcache/Python/3.11.13/x64/lib/python3.11/site-packages/\_pytest/pathlib.py:587: in import_path
importlib.import_module(module_name)
/opt/hostedtoolcache/Python/3.11.13/x64/lib/python3.11/importlib/**init**.py:126: in import_module
return \_bootstrap.\_gcd_import(name[level:], package, level)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
<frozen importlib._bootstrap>:1204: in \_gcd_import
???
<frozen importlib._bootstrap>:1176: in \_find_and_load
???
<frozen importlib._bootstrap>:1147: in \_find_and_load_unlocked
???
<frozen importlib._bootstrap>:690: in \_load_unlocked
???
/opt/hostedtoolcache/Python/3.11.13/x64/lib/python3.11/site-packages/\_pytest/assertion/rewrite.py:177: in exec_module
source_stat, co = \_rewrite_test(fn, self.config)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
/opt/hostedtoolcache/Python/3.11.13/x64/lib/python3.11/site-packages/\_pytest/assertion/rewrite.py:359: in \_rewrite_test
co = compile(tree, strfn, "exec", dont_inherit=True)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
E File "/home/runner/work/TCDynamics/TCDynamics/TCDynamics/test_azure_functions.py", line 346
E response = await contact_form(mock_req)
E ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
E SyntaxError: 'await' outside async function
=========================== short test summary info ============================
ERROR test_azure_functions.py
!!!!!!!!!!!!!!!!!!!! Interrupted: 1 error during collection !!!!!!!!!!!!!!!!!!!!
=============================== 1 error in 0.30s ===============================
Error: Process completed with exit code 2.

**Quality Gate**
**Quality Gate Check**
Run # Check if all required jobs passed

# Check if all required jobs passed

FRONTEND_RESULT="failure"
BACKEND_RESULT="failure"
FUNCTIONS_RESULT="failure"

if [["$FRONTEND_RESULT" != "success"]]; then
echo "❌ Frontend tests failed"
exit 1
fi

if [["$BACKEND_RESULT" != "success"]]; then
echo "❌ Backend tests failed"
exit 1
fi

if [["$FUNCTIONS_RESULT" != "success"]]; then
echo "❌ Functions tests failed"
exit 1
fi

echo "✅ All quality gates passed!"
shell: /usr/bin/bash -e {0}
env:
NODE_VERSION: 20
PYTHON_VERSION: 3.11
❌ Frontend tests failed
Error: Process completed with exit code 1.

**Comment PR on failure**
Run actions/github-script@v7
with:
script: github.rest.issues.createComment({
issue_number: context.issue.number,
owner: context.repo.owner,
repo: context.repo.repo,
body: '❌ **CI Quality Gate Failed**\n\nSome tests failed. Please review the failed jobs above and fix the issues before merging.'
})

    github-token: ***
    debug: false
    user-agent: actions/github-script
    result-encoding: json
    retries: 0
    retry-exempt-status-codes: 400,401,403,404,422

env:
NODE_VERSION: 20
PYTHON_VERSION: 3.11
RequestError [HttpError]: Resource not accessible by integration
at /home/runner/work/\_actions/actions/github-script/v7/dist/index.js:9537:21
at process.processTicksAndRejections (node:internal/process/task_queues:95:5) {
status: 403,
response: {
url: 'https://api.github.com/repos/lawmight/TCDynamics/issues/46/comments',
status: 403,
headers: {
'access-control-allow-origin': '\*',
'access-control-expose-headers': 'ETag, Link, Location, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Used, X-RateLimit-Resource, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval, X-GitHub-Media-Type, X-GitHub-SSO, X-GitHub-Request-Id, Deprecation, Sunset',
'content-encoding': 'gzip',
'content-security-policy': "default-src 'none'",
'content-type': 'application/json; charset=utf-8',
date: 'Wed, 08 Oct 2025 07:51:45 GMT',
'referrer-policy': 'origin-when-cross-origin, strict-origin-when-cross-origin',
server: 'github.com',
'strict-transport-security': 'max-age=31536000; includeSubdomains; preload',
'transfer-encoding': 'chunked',
vary: 'Accept-Encoding, Accept, X-Requested-With',
'x-accepted-github-permissions': 'issues=write; pull_requests=write',
'x-content-type-options': 'nosniff',
'x-frame-options': 'deny',
'x-github-api-version-selected': '2022-11-28',
'x-github-media-type': 'github.v3; format=json',
'x-github-request-id': '93C1:13BFF8:8D4EE2:906902:68E61811',
'x-ratelimit-limit': '5000',
'x-ratelimit-remaining': '4969',
'x-ratelimit-reset': '1759913386',
'x-ratelimit-resource': 'core',
'x-ratelimit-used': '31',
'x-xss-protection': '0'
},
data: {
message: 'Resource not accessible by integration',
documentation_url: 'https://docs.github.com/rest/issues/comments#create-an-issue-comment',
status: '403'
}
},
request: {
method: 'POST',
url: 'https://api.github.com/repos/lawmight/TCDynamics/issues/46/comments',
headers: {
accept: 'application/vnd.github.v3+json',
'user-agent': 'actions/github-script octokit-core.js/5.0.1 Node.js/20.19.4 (linux; x64)',
authorization: 'token [REDACTED]',
'content-type': 'application/json; charset=utf-8'
},
body: '{"body":"❌ **CI Quality Gate Failed**\\n\\nSome tests failed. Please review the failed jobs above and fix the issues before merging."}',
request: {
agent: [Agent],
fetch: [Function: proxyFetch],
hook: [Function: bound bound register]
}
}
}
Error: Unhandled error: HttpError: Resource not accessible by integration
