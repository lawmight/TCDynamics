**md file with the last push errors**
**Test Azure Functions** was the only one passing this time

**Test React Frontend** failed in Run tests

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

✓ src/api/**tests**/azureServices.test.ts (23 tests) 3031ms
✓ Azure Services API Client > Contact API > should handle HTTP errors 1003ms
✓ Azure Services API Client > Error Handling and Retries > should retry on network errors 1002ms
✓ Azure Services API Client > Error Handling and Retries > should retry on server errors 1002ms
✓ src/utils/**tests**/security.test.ts (41 tests) 21ms
stdout | src/utils/**tests**/integration.test.ts
[2025-10-08T12:49:08.684Z] INFO: Configuration status check completed {
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
[2025-10-08T12:49:08.721Z] INFO: Configuration status check completed {
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
[2025-10-08T12:49:08.722Z] INFO: Configuration status check completed {
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
[2025-10-08T12:49:08.723Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.724Z] INFO: Performance: cache.hit {
duration: '0ms',
metadata: {
key: '<REDACTED>',
accessCount: '<number>',
age: '<number>',
size: '<number>'
}
}

stdout | src/utils/**tests**/integration.test.ts > Integration Tests > Cache Integration > should handle cache size limits and LRU eviction
[2025-10-08T12:49:08.725Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.725Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.725Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.725Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.725Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.725Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.725Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.726Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.726Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.726Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.726Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.726Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.726Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.726Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.726Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.727Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.727Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.727Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.727Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.727Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.727Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.727Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.727Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.728Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.728Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.728Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.728Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.728Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.728Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.728Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.728Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.728Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.729Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.729Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.729Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.729Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.729Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.729Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.729Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.729Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.730Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.730Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.730Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.730Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.730Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.730Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.731Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.731Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.731Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.731Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.731Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.731Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.731Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.731Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.731Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.732Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.732Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.732Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.732Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.732Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.732Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.732Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.732Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.732Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.732Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.733Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.733Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.733Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.733Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.733Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.733Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.733Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.733Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.733Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.734Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.734Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.734Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.734Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.734Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.734Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.734Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.734Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.734Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.735Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.735Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.735Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.735Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.735Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.735Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.735Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.735Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.735Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.735Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.735Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}
[2025-10-08T12:49:08.735Z] INFO: Performance: cache.evicted {
duration: '0ms',
metadata: { key: '<REDACTED>', reason: 'size_limit' }
}
[2025-10-08T12:49:08.735Z] INFO: Performance: cache.set {
duration: '0ms',
metadata: {
key: '<REDACTED>',
ttl: '<number>',
size: '<number>',
totalSize: '<number>'
}
}

stdout | src/utils/**tests**/integration.test.ts > Integration Tests > Performance Monitoring Integration > should record metrics without errors
[2025-10-08T12:49:08.739Z] INFO: Performance: integration.test {
duration: '100ms',
metadata: { test: '<boolean>', environment: 'test' }
}

stdout | src/utils/**tests**/integration.test.ts > Integration Tests > End-to-End Integration > should work together without conflicts
[2025-10-08T12:49:08.744Z] INFO: Configuration status check completed {
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
[2025-10-08T12:49:08.744Z] INFO: Performance: integration.e2e { duration: '50ms', metadata: { test: '<boolean>', config: 'loaded' } }

✓ src/utils/**tests**/integration.test.ts (16 tests) 25ms

⎯⎯⎯⎯⎯⎯ Failed Suites 35 ⎯⎯⎯⎯⎯⎯

FAIL e2e/contact-flow.spec.ts [ e2e/contact-flow.spec.ts ]
FAIL e2e/navigation.spec.ts [ e2e/navigation.spec.ts ]
FAIL src/components/**tests**/AIChatbot.test.tsx [ src/components/__tests__/AIChatbot.test.tsx ]
FAIL src/components/**tests**/AIDemo.test.tsx [ src/components/__tests__/AIDemo.test.tsx ]
FAIL src/components/**tests**/Contact.test.tsx [ src/components/__tests__/Contact.test.tsx ]
FAIL src/components/**tests**/DocumentProcessor.test.tsx [ src/components/__tests__/DocumentProcessor.test.tsx ]
FAIL src/components/**tests**/ErrorBoundary.test.tsx [ src/components/__tests__/ErrorBoundary.test.tsx ]
FAIL src/components/**tests**/FAQ.test.tsx [ src/components/__tests__/FAQ.test.tsx ]
FAIL src/components/**tests**/Features.test.tsx [ src/components/__tests__/Features.test.tsx ]
FAIL src/components/**tests**/Hero.test.tsx [ src/components/__tests__/Hero.test.tsx ]
FAIL src/components/**tests**/HowItWorks.test.tsx [ src/components/__tests__/HowItWorks.test.tsx ]
FAIL src/components/**tests**/LazyAIChatbot.test.tsx [ src/components/__tests__/LazyAIChatbot.test.tsx ]
FAIL src/components/**tests**/LocalAdvantages.test.tsx [ src/components/__tests__/LocalAdvantages.test.tsx ]
FAIL src/components/**tests**/MobileNavigation.test.tsx [ src/components/__tests__/MobileNavigation.test.tsx ]
FAIL src/components/**tests**/OfflineIndicator.test.tsx [ src/components/__tests__/OfflineIndicator.test.tsx ]
FAIL src/components/**tests**/OptimizedImage.test.tsx [ src/components/__tests__/OptimizedImage.test.tsx ]
FAIL src/components/**tests**/PerformanceMonitor.test.tsx [ src/components/__tests__/PerformanceMonitor.test.tsx ]
FAIL src/components/**tests**/Pricing.test.tsx [ src/components/__tests__/Pricing.test.tsx ]
FAIL src/components/**tests**/SimpleNavigation.test.tsx [ src/components/__tests__/SimpleNavigation.test.tsx ]
FAIL src/components/**tests**/SocialProof.test.tsx [ src/components/__tests__/SocialProof.test.tsx ]
FAIL src/components/**tests**/StickyHeader.test.tsx [ src/components/__tests__/StickyHeader.test.tsx ]
FAIL src/hooks/**tests**/use-mobile.test.ts [ src/hooks/__tests__/use-mobile.test.ts ]
FAIL src/hooks/**tests**/use-toast.test.ts [ src/hooks/__tests__/use-toast.test.ts ]
FAIL src/hooks/**tests**/useContactForm.test.ts [ src/hooks/__tests__/useContactForm.test.ts ]
FAIL src/hooks/**tests**/useDemoForm.test.ts [ src/hooks/__tests__/useDemoForm.test.ts ]
FAIL src/hooks/**tests**/useFormSubmit.test.ts [ src/hooks/__tests__/useFormSubmit.test.ts ]
FAIL src/hooks/**tests**/useIntersectionObserver.test.ts [ src/hooks/__tests__/useIntersectionObserver.test.ts ]
FAIL src/hooks/**tests**/useToggle.test.ts [ src/hooks/__tests__/useToggle.test.ts ]
FAIL src/pages/**tests**/CheckoutSuccess.test.tsx [ src/pages/__tests__/CheckoutSuccess.test.tsx ]
FAIL src/pages/**tests**/Index.test.tsx [ src/pages/__tests__/Index.test.tsx ]
FAIL src/utils/**tests**/config.test.ts [ src/utils/__tests__/config.test.ts ]
FAIL src/utils/**tests**/logger.test.ts [ src/utils/__tests__/logger.test.ts ]
FAIL src/utils/**tests**/math.test.ts [ src/utils/__tests__/math.test.ts ]
FAIL src/components/ui/**tests**/animated-counter.test.tsx [ src/components/ui/__tests__/animated-counter.test.tsx ]
FAIL src/components/ui/**tests**/button.test.tsx [ src/components/ui/__tests__/button.test.tsx ]
ReferenceError: window is not defined
❯ src/test/setup.ts:50:23
48|
49| // Mock window.location for React Router tests
50| Object.defineProperty(window, 'location', {
| ^
51| writable: true,
52| value: {

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/35]⎯

Test Files 35 failed | 3 passed (38)
Tests 80 passed (80)
Start at 12:49:04
Duration 5.11s (transform 453ms, setup 396ms, collect 259ms, tests 3.08s, environment 239ms, prepare 73ms)

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:50:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:50:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:50:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:50:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:50:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:50:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:50:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:50:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:50:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:50:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:50:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:50:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:50:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:50:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:50:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:50:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:50:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:50:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:50:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:50:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:50:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:50:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:50:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:50:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:50:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:50:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:50:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:50:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:50:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:50:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:50:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:50:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:50:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:50:23

Error: ReferenceError: window is not defined
❯ src/test/setup.ts:50:23

Error: Process completed with exit code 1.

**Test Node.js Backend** failed in Run backend unit tests with Jest

Run npm run test:coverage
npm run test:coverage
shell: /usr/bin/bash -e {0}
env:
NODE_VERSION: 20
PYTHON_VERSION: 3.11
NODE_ENV: test
POSTGRES_HOST: localhost
POSTGRES_PORT: 5432
POSTGRES_DB: tcdynamics_test
POSTGRES_USER: test_user
POSTGRES_PASSWORD: test_password
REDIS_HOST: localhost
REDIS_PORT: 6379
CI: true

> tcdynamics-backend@1.0.0 test:coverage
> jest --coverage --verbose

FAIL src/routes/**tests**/monitoring.test.js
Test Setup
✓ should have environment variables configured (3 ms)
Monitoring Routes
GET /metrics
✓ should return application metrics without authentication (87 ms)
✓ should return updated memory usage (15 ms)
✓ should calculate uptime correctly (11 ms)
GET /metrics/prometheus
✓ should return metrics in Prometheus format (12 ms)
✕ should include method-specific metrics when requests exist (10 ms)
✕ should include status-specific metrics when requests exist (11 ms)
GET /health/detailed
✓ should return healthy status for normal operation (12 ms)
✕ should detect degraded status with recent errors (16 ms)
✕ should detect warning status with high memory usage (14 ms)
✓ should ignore old errors in health check (10 ms)
POST /metrics/reset
✕ should reset metrics with admin authentication (13 ms)
✓ should apply admin authentication middleware (10 ms)
collectMetrics middleware
✕ should collect request metrics (10 ms)
✕ should calculate average response time (9 ms)
✕ should track slowest endpoints (10 ms)
✕ should handle multiple requests correctly (20 ms)
collectErrorMetrics function
✕ should collect error metrics (3 ms)
✕ should handle errors without name property (1 ms)
✕ should limit recent errors to 50 (2 ms)
Integration with error handling
✕ should work with error middleware (10 ms)

● Monitoring Routes › GET /metrics/prometheus › should include method-specific metrics when requests exist

    expect(received).toContain(expected) // indexOf

    Expected substring: "tcdynamics_requests_by_method_total{method=\"GET\"} 5"
    Received string:    "# HELP tcdynamics_uptime_seconds Application uptime in seconds
    # TYPE tcdynamics_uptime_seconds gauge
    tcdynamics_uptime_seconds 0·
    # HELP tcdynamics_requests_total Total number of requests
    # TYPE tcdynamics_requests_total counter
    tcdynamics_requests_total 0·
    # HELP tcdynamics_errors_total Total number of errors
    # TYPE tcdynamics_errors_total counter
    tcdynamics_errors_total 0·
    # HELP tcdynamics_response_time_average Average response time in milliseconds
    # TYPE tcdynamics_response_time_average gauge
    tcdynamics_response_time_average 0·
    # HELP tcdynamics_memory_usage_rss Memory usage RSS in MB
    # TYPE tcdynamics_memory_usage_rss gauge
    tcdynamics_memory_usage_rss 154·
    # HELP tcdynamics_memory_usage_heap_used Heap memory used in MB
    # TYPE tcdynamics_memory_usage_heap_used gauge
    tcdynamics_memory_usage_heap_used 46·
    # HELP tcdynamics_memory_usage_heap_total Heap memory total in MB
    # TYPE tcdynamics_memory_usage_heap_total gauge
    tcdynamics_memory_usage_heap_total 90·
    "

      148 |         .expect(200)
      149 |
    > 150 |       expect(response.text).toContain(
          |                             ^
      151 |         'tcdynamics_requests_by_method_total{method="GET"} 5'
      152 |       )
      153 |       expect(response.text).toContain(

      at Object.toContain (src/routes/__tests__/monitoring.test.js:150:29)

● Monitoring Routes › GET /metrics/prometheus › should include status-specific metrics when requests exist

    expect(received).toContain(expected) // indexOf

    Expected substring: "tcdynamics_requests_by_status_total{status=\"200\"} 10"
    Received string:    "# HELP tcdynamics_uptime_seconds Application uptime in seconds
    # TYPE tcdynamics_uptime_seconds gauge
    tcdynamics_uptime_seconds 0·
    # HELP tcdynamics_requests_total Total number of requests
    # TYPE tcdynamics_requests_total counter
    tcdynamics_requests_total 0·
    # HELP tcdynamics_errors_total Total number of errors
    # TYPE tcdynamics_errors_total counter
    tcdynamics_errors_total 0·
    # HELP tcdynamics_response_time_average Average response time in milliseconds
    # TYPE tcdynamics_response_time_average gauge
    tcdynamics_response_time_average 0·
    # HELP tcdynamics_memory_usage_rss Memory usage RSS in MB
    # TYPE tcdynamics_memory_usage_rss gauge
    tcdynamics_memory_usage_rss 155·
    # HELP tcdynamics_memory_usage_heap_used Heap memory used in MB
    # TYPE tcdynamics_memory_usage_heap_used gauge
    tcdynamics_memory_usage_heap_used 39·
    # HELP tcdynamics_memory_usage_heap_total Heap memory total in MB
    # TYPE tcdynamics_memory_usage_heap_total gauge
    tcdynamics_memory_usage_heap_total 90·
    "

      169 |         .expect(200)
      170 |
    > 171 |       expect(response.text).toContain(
          |                             ^
      172 |         'tcdynamics_requests_by_status_total{status="200"} 10'
      173 |       )
      174 |       expect(response.text).toContain(

      at Object.toContain (src/routes/__tests__/monitoring.test.js:171:29)

● Monitoring Routes › GET /health/detailed › should detect degraded status with recent errors

    expect(received).toBe(expected) // Object.is equality

    Expected: "degraded"
    Received: "healthy"

      215 |         .expect(200)
      216 |
    > 217 |       expect(response.body.status).toBe('degraded')
          |                                    ^
      218 |       expect(response.body).toHaveProperty('recentErrors', 1)
      219 |     })
      220 |

      at Object.toBe (src/routes/__tests__/monitoring.test.js:217:36)

● Monitoring Routes › GET /health/detailed › should detect warning status with high memory usage

    expect(received).toBe(expected) // Object.is equality

    Expected: "warning"
    Received: "healthy"

      234 |         .expect(200)
      235 |
    > 236 |       expect(response.body.status).toBe('warning')
          |                                    ^
      237 |       expect(response.body).toHaveProperty('memoryWarning')
      238 |     })
      239 |

      at Object.toBe (src/routes/__tests__/monitoring.test.js:236:36)

● Monitoring Routes › POST /metrics/reset › should reset metrics with admin authentication

    expect(jest.fn()).toHaveBeenCalledWith(...expected)

    - Expected
    + Received

      "Metrics reset requested",
      Object {
    -   "ip": Any<String>,
    -   "requestId": Any<String>,
    -   "userAgent": Any<String>,
    +   "ip": "::ffff:127.0.0.1",
    +   "requestId": undefined,
    +   "userAgent": undefined,
      },

    Number of calls: 1

      273 |       })
      274 |
    > 275 |       expect(logger.info).toHaveBeenCalledWith('Metrics reset requested', {
          |                           ^
      276 |         ip: expect.any(String),
      277 |         userAgent: expect.any(String),
      278 |         requestId: expect.any(String),

      at Object.toHaveBeenCalledWith (src/routes/__tests__/monitoring.test.js:275:27)

● Monitoring Routes › collectMetrics middleware › should collect request metrics

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      300 |       await request(testApp).get('/test').expect(200)
      301 |
    > 302 |       expect(monitoringModule.metrics.requests.total).toBe(1)
          |                                                       ^
      303 |       expect(monitoringModule.metrics.requests.byMethod.GET).toBe(1)
      304 |       expect(monitoringModule.metrics.requests.byStatus[200]).toBe(1)
      305 |       expect(monitoringModule.metrics.requests.byEndpoint['GET /test']).toBe(1)

      at Object.toBe (src/routes/__tests__/monitoring.test.js:302:55)

● Monitoring Routes › collectMetrics middleware › should calculate average response time

    expect(received).toBeGreaterThan(expected)

    Expected: > 0
    Received:   0

      318 |       expect(
      319 |         monitoringModule.metrics.performance.averageResponseTime
    > 320 |       ).toBeGreaterThan(0)
          |         ^
      321 |     })
      322 |
      323 |     it('should track slowest endpoints', async () => {

      at Object.toBeGreaterThan (src/routes/__tests__/monitoring.test.js:320:9)

● Monitoring Routes › collectMetrics middleware › should track slowest endpoints

    expect(received).toHaveLength(expected)

    Expected length: 1
    Received length: 0
    Received array:  []

      333 |       expect(
      334 |         monitoringModule.metrics.performance.slowestEndpoints
    > 335 |       ).toHaveLength(1)
          |         ^
      336 |       expect(
      337 |         monitoringModule.metrics.performance.slowestEndpoints[0]
      338 |       ).toHaveProperty('endpoint', 'GET /test')

      at Object.toHaveLength (src/routes/__tests__/monitoring.test.js:335:9)

● Monitoring Routes › collectMetrics middleware › should handle multiple requests correctly

    expect(received).toBe(expected) // Object.is equality

    Expected: 3
    Received: 0

      360 |       ])
      361 |
    > 362 |       expect(monitoringModule.metrics.requests.total).toBe(3)
          |                                                       ^
      363 |       expect(monitoringModule.metrics.requests.byMethod.GET).toBe(3)
      364 |     })
      365 |   })

      at Object.toBe (src/routes/__tests__/monitoring.test.js:362:55)

● Monitoring Routes › collectErrorMetrics function › should collect error metrics

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      377 |       collectErrorMetrics(mockError, mockReq)
      378 |
    > 379 |       expect(monitoringModule.metrics.errors.total).toBe(1)
          |                                                     ^
      380 |       expect(monitoringModule.metrics.errors.byType.Error).toBe(1)
      381 |       expect(monitoringModule.metrics.errors.recent).toHaveLength(1)
      382 |       expect(monitoringModule.metrics.errors.recent[0]).toEqual({

      at Object.toBe (src/routes/__tests__/monitoring.test.js:379:53)

● Monitoring Routes › collectErrorMetrics function › should handle errors without name property

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: undefined

      400 |       collectErrorMetrics(mockError, mockReq)
      401 |
    > 402 |       expect(monitoringModule.metrics.errors.byType.UnknownError).toBe(1)
          |                                                                   ^
      403 |     })
      404 |
      405 |     it('should limit recent errors to 50', () => {

      at Object.toBe (src/routes/__tests__/monitoring.test.js:402:67)

● Monitoring Routes › collectErrorMetrics function › should limit recent errors to 50

    expect(received).toHaveLength(expected)

    Expected length: 50
    Received length: 0
    Received array:  []

      417 |       }
      418 |
    > 419 |       expect(monitoringModule.metrics.errors.recent).toHaveLength(50)
          |                                                      ^
      420 |       expect(monitoringModule.metrics.errors.recent[0].message).toBe(
      421 |         'Test error 54'
      422 |       )

      at Object.toHaveLength (src/routes/__tests__/monitoring.test.js:419:54)

● Monitoring Routes › Integration with error handling › should work with error middleware

    expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

      448 |       // Check that error was collected
      449 |       const monitoringModule = require('../monitoring')
    > 450 |       expect(monitoringModule.metrics.errors.total).toBe(1)
          |                                                     ^
      451 |     })
      452 |   })
      453 | })

      at Object.toBe (src/routes/__tests__/monitoring.test.js:450:53)

PASS src/routes/**tests**/demo.test.js
Test Setup
✓ should have environment variables configured (2 ms)
Demo Route
POST /demo
✓ should send demo request email successfully (38 ms)
✓ should handle email verification failure (12 ms)
✓ should handle email sending failure (8 ms)
✓ should handle missing firstName (10 ms)
✓ should handle missing email (8 ms)
✓ should handle invalid email format (7 ms)
✓ should handle missing employees field (10 ms)
✓ should handle very long needs description (9 ms)
✓ should handle company with special characters (9 ms)
✓ should handle international phone formats (10 ms)
✓ should handle optional phone field (8 ms)
✓ should handle request without JSON body (8 ms)
✓ should handle concurrent requests (15 ms)

PASS src/utils/**tests**/validationHelpers.test.js
Test Setup
✓ should have environment variables configured (3 ms)
validationHelpers
createNameField
✓ should create a required name field with default constraints (25 ms)
✓ should create an optional name field when specified (1 ms)
✓ should respect custom min/max constraints (2 ms)
✓ should use custom label in error messages (1 ms)
createEmailField
✓ should validate correct email addresses (3 ms)
✓ should reject invalid email addresses (2 ms)
✓ should require email by default (1 ms)
✓ should allow optional email when specified (2 ms)
createPhoneField
✓ should validate international phone formats (2 ms)
✓ should reject invalid phone formats (2 ms)
✓ should be optional by default (1 ms)
✓ should allow empty string (1 ms)
createTextField
✓ should create a text field with max length (2 ms)
✓ should enforce minimum length when specified (2 ms)
✓ should be optional by default (2 ms)
✓ should allow required text fields (2 ms)
✓ should use custom label in messages (1 ms)
createSelectField
✓ should validate allowed values (2 ms)
✓ should be optional by default (1 ms)
✓ should allow required select fields (1 ms)
commonFields
firstName and lastName
✓ should validate names correctly (4 ms)
✓ should enforce max length of 50 (1 ms)
fullName
✓ should accept full names (1 ms)
email
✓ should validate emails (1 ms)
phone
✓ should validate phone numbers (1 ms)
company
✓ should be optional by default (1 ms)
✓ should be required when specified (1 ms)
message
✓ should require at least 10 characters (1 ms)
employees
✓ should be optional (1 ms)
notes
✓ should accept custom max length (1 ms)
MESSAGES_FR
✓ should have French error messages (1 ms)
PATTERNS
✓ should have phone pattern

PASS src/routes/**tests**/contact.test.js
Test Setup
✓ should have environment variables configured (2 ms)
Contact Route
POST /contact
✓ should send contact email successfully (31 ms)
✓ should handle email verification failure (9 ms)
✓ should handle email sending failure (10 ms)
✓ should handle missing required fields (7 ms)
✓ should handle malformed email address (7 ms)
✓ should handle very long message (10 ms)
✓ should handle special characters in company name (8 ms)
✓ should handle international phone numbers (9 ms)
✓ should handle empty optional fields (10 ms)
✓ should handle request without JSON body (10 ms)
✓ should handle extremely large payloads (34 ms)

PASS src/utils/**tests**/routeFactory.test.js
Test Setup
✓ should have environment variables configured (3 ms)
routeFactory
createEmailRouteHandler
✓ should throw error if template does not exist (13 ms)
✓ should create a route handler function (1 ms)
✓ should send email successfully with contact template (7 ms)
✓ should send email successfully with demo template (2 ms)
✓ should handle transporter verification failure (2 ms)
✓ should handle sendMail failure (2 ms)
✓ should use custom dataMapper if provided (1 ms)
✓ should handle missing email in request body (1 ms)
✓ should properly capitalize route name in "from" field (2 ms)
createDataMapper
✓ should extract specified fields from body (1 ms)
✓ should handle missing fields gracefully (2 ms)
✓ should handle empty body (1 ms)
✓ should include undefined values if explicitly set (1 ms)

PASS src/utils/**tests**/validation.test.js
Test Setup
✓ should have environment variables configured (2 ms)
Validation Utils
validateData middleware
✓ should validate valid data successfully (32 ms)
✓ should handle validation errors (2 ms)
✓ should handle Joi validation errors with multiple fields (2 ms)
✓ should handle missing error details (3 ms)
Schema definitions
✓ should export contactSchema (1 ms)
✓ should export demoSchema (1 ms)
✓ should have proper Joi schema structure (1 ms)

PASS src/middleware/**tests**/rateLimiter.test.js
Test Setup
✓ should have environment variables configured (3 ms)
Rate Limiter Middleware
✓ should allow requests within limit (25 ms)
✓ should block requests exceeding limit (43 ms)
✓ should track different endpoints separately (42 ms)
✓ should reset after time window (9 ms)

PASS src/**tests**/setup.js
Test Setup
✓ should have environment variables configured (3 ms)

-----------------------|---------|----------|---------|---------|---------------------------------
File | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s  
-----------------------|---------|----------|---------|---------|---------------------------------
All files | 46.21 | 31.44 | 48.64 | 46.17 |  
 src | 0 | 100 | 100 | 0 |  
 swagger.js | 0 | 100 | 100 | 0 | 1-209  
 src/config | 0 | 0 | 0 | 0 |  
 email.js | 0 | 0 | 0 | 0 | 1-70  
 src/middleware | 0 | 0 | 0 | 0 |  
 auth.js | 0 | 0 | 0 | 0 | 1-90  
 csrf.js | 0 | 0 | 0 | 0 | 1-42  
 errorHandler.js | 0 | 0 | 0 | 0 | 1-155  
 security.js | 0 | 0 | 0 | 0 | 1-103  
 src/routes | 81.39 | 67.85 | 76.92 | 81.17 |  
 contact.js | 100 | 100 | 100 | 100 |  
 demo.js | 0 | 100 | 100 | 0 | 1-24  
 monitoring.js | 87.5 | 67.85 | 76.92 | 87.32 | 210,218,278-280,284-285,294-295
src/utils | 70.13 | 58.33 | 74.28 | 69.93 |  
 logger.js | 0 | 0 | 0 | 0 | 1-215  
 routeFactory.js | 100 | 85.71 | 100 | 100 | 102  
 validation.js | 100 | 100 | 100 | 100 |  
 validationHelpers.js | 96.72 | 91.89 | 94.44 | 96.72 | 12,104  
-----------------------|---------|----------|---------|---------|---------------------------------
Jest: "global" coverage threshold for statements (70%) not met: 46.21%
Jest: "global" coverage threshold for branches (70%) not met: 31.44%
Jest: "global" coverage threshold for lines (70%) not met: 46.17%
Jest: "global" coverage threshold for functions (70%) not met: 48.64%
Test Suites: 1 failed, 7 passed, 8 total
Tests: 13 failed, 95 passed, 108 total
Snapshots: 0 total
Time: 3.825 s
Ran all test suites.
Error: Process completed with exit code 1.

**Quality Gate** failed in Quality Gate Check
Run # Check if all required jobs passed

# Check if all required jobs passed

FRONTEND_RESULT="failure"
BACKEND_RESULT="failure"
FUNCTIONS_RESULT="success"

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
