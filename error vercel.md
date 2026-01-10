2026-01-10 22:50:42.580 [error] (node:4) [DEP0169] DeprecationWarning: `url.parse()` behavior is not standardized and prone to errors that have security implications. Use the WHATWG URL API instead. CVEs are not issued for `url.parse()` vulnerabilities.
2026-01-10 22:50:42.859 [error] ❌ Error creating Polar checkout: HTTPValidationError: API error occurred: {"detail":[{"loc":["body","function-after[is_complete_configuration(), CheckoutProductsCreate]","prices","8f88e778-374c-4ef3-9ca3-21d2cf136606",0,"fixed","price_currency"],"msg":"String should match pattern 'usd'","type":"string_pattern_mismatch"},{"loc":["body","function-after[is_complete_configuration(), CheckoutProductCreate]","product_id"],"msg":"Field required","type":"missing"},{"loc":["body","function-after[is_complete_configuration(), CheckoutPriceCreate]","product_price_id"],"msg":"Field required","type":"missing"}],"request$":{},"response$":{},"body$":"{\"error\":\"RequestValidationError\",\"detail\":[{\"type\":\"string_pattern_mismatch\",\"loc\":[\"body\",\"function-after[is_complete_configuration(), CheckoutProductsCreate]\",\"prices\",\"8f88e778-374c-4ef3-9ca3-21d2cf136606\",0,\"fixed\",\"price_currency\"],\"msg\":\"String should match pattern 'usd'\",\"input\":\"eur\",\"ctx\":{\"pattern\":\"usd\"}},{\"type\":\"missing\",\"loc\":[\"body\",\"function-after[is_complete_configuration(), CheckoutProductCreate]\",\"product_id\"],\"msg\":\"Field required\",\"input\":{\"metadata\":{\"created_via\":\"public_checkout\",\"manual_onboarding\":\"true\",\"payment_type\":\"one_time\",\"plan_name\":\"enterprise\"},\"allow_discount_codes\":true,\"require_billing_address\":false,\"allow_trial\":true,\"is_business_customer\":false,\"success_url\":\"https://tcdynamics.fr/checkout-success?checkout_id={CHECKOUT_ID}&source=manual\",\"products\":[\"8f88e778-374c-4ef3-9ca3-21d2cf136606\"],\"prices\":{\"8f88e778-374c-4ef3-9ca3-21d2cf136606\":[{\"amount_type\":\"fixed\",\"price_amount\":216000,\"price_currency\":\"eur\"}]}}},{\"type\":\"missing\",\"loc\":[\"body\",\"function-after[is_complete_configuration(), CheckoutPriceCreate]\",\"product_price_id\"],\"msg\":\"Field required\",\"input\":{\"metadata\":{\"created_via\":\"public_checkout\",\"manual_onboarding\":\"true\",\"payment_type\":\"one_time\",\"plan_name\":\"enterprise\"},\"allow_discount_codes\":true,\"require_billing_address\":false,\"allow_trial\":true,\"is_business_customer\":false,\"success_url\":\"https://tcdynamics.fr/checkout-success?checkout_id={CHECKOUT_ID}&source=manual\",\"products\":[\"8f88e778-374c-4ef3-9ca3-21d2cf136606\"],\"prices\":{\"8f88e778-374c-4ef3-9ca3-21d2cf136606\":[{\"amount_type\":\"fixed\",\"price_amount\":216000,\"price_currency\":\"eur\"}]}}}]}"}
    at Object.transform (file:///var/task/api/node_modules/@polar-sh/sdk/dist/esm/models/errors/httpvalidationerror.js:26:12)
    at inst._zod.parse (file:///var/task/api/node_modules/zod/v4/core/schemas.js:1515:26)
    at handlePipeResult (file:///var/task/api/node_modules/zod/v4/core/schemas.js:1749:22)
    at inst._zod.parse (file:///var/task/api/node_modules/zod/v4/core/schemas.js:1740:16)
    at Module.<anonymous> (file:///var/task/api/node_modules/zod/v4/core/parse.js:6:32)
    at inst.parse (file:///var/task/api/node_modules/zod/v4/mini/schemas.js:10:42)
    at safeParseResponse.request.request (file:///var/task/api/node_modules/@polar-sh/sdk/dist/esm/lib/matchers.js:163:74)
    at safeParseResponse (file:///var/task/api/node_modules/@polar-sh/sdk/dist/esm/lib/matchers.js:188:19)
    at matchFunc (file:///var/task/api/node_modules/@polar-sh/sdk/dist/esm/lib/matchers.js:163:28)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5) {
  statusCode: 422,
  body: `{"error":"RequestValidationError","detail":[{"type":"string_pattern_mismatch","loc":["body","function-after[is_complete_configuration(), CheckoutProductsCreate]","prices","8f88e778-374c-4ef3-9ca3-21d2cf136606",0,"fixed","price_currency"],"msg":"String should match pattern 'usd'","input":"eur","ctx":{"pattern":"usd"}},{"type":"missing","loc":["body","function-after[is_complete_configuration(), CheckoutProductCreate]","product_id"],"msg":"Field required","input":{"metadata":{"created_via":"public_checkout","manual_onboarding":"true","payment_type":"one_time","plan_name":"enterprise"},"allow_discount_codes":true,"require_billing_address":false,"allow_trial":true,"is_business_customer":false,"success_url":"https://tcdynamics.fr/checkout-success?checkout_id={CHECKOUT_ID}&source=manual","products":["8f88e778-374c-4ef3-9ca3-21d2cf136606"],"prices":{"8f88e778-374c-4ef3-9ca3-21d2cf136606":[{"amount_type":"fixed","price_amount":216000,"price_currency":"eur"}]}}},{"type":"missing","loc":["body","function-after[is_complete_configuration(), CheckoutPriceCreate]","product_price_id"],"msg":"Field required","input":{"metadata":{"created_via":"public_checkout","manual_onboarding":"true","payment_type":"one_time","plan_name":"enterprise"},"allow_discount_codes":true,"require_billing_address":false,"allow_trial":true,"is_business_customer":false,"success_url":"https://tcdynamics.fr/checkout-success?checkout_id={CHECKOUT_ID}&source=manual","products":["8f88e778-374c-4ef3-9ca3-21d2cf136606"],"prices":{"8f88e778-374c-4ef3-9ca3-21d2cf136606":[{"amount_type":"fixed","price_amount":216000,"price_currency":"eur"}]}}}]}`,
  headers: Headers {
    date: 'Sat, 10 Jan 2026 22:50:42 GMT',
    'content-type': 'application/json',
    'content-length': '508',
    connection: 'keep-alive',
    'cf-ray': '9bbfbc2169362054-IAD',
    'content-encoding': 'br',
    'rndr-id': '2e7b3359-b44a-407c',
    vary: 'Accept-Encoding',
    'x-render-origin-server': 'uvicorn',
    'cf-cache-status': 'DYNAMIC',
    server: 'cloudflare',
    'alt-svc': 'h3=":443"; ma=86400'
  },
  contentType: 'application/json',
  rawResponse: Response {
    status: 422,
    statusText: 'Unprocessable Entity',
    headers: Headers {
      date: 'Sat, 10 Jan 2026 22:50:42 GMT',
      'content-type': 'application/json',
      'content-length': '508',
      connection: 'keep-alive',
      'cf-ray': '9bbfbc2169362054-IAD',
      'content-encoding': 'br',
      'rndr-id': '2e7b3359-b44a-407c',
      vary: 'Accept-Encoding',
      'x-render-origin-server': 'uvicorn',
      'cf-cache-status': 'DYNAMIC',
      server: 'cloudflare',
      'alt-svc': 'h3=":443"; ma=86400'
    },
    body: ReadableStream { locked: true, state: 'closed', supportsBYOB: true },
    bodyUsed: true,
    ok: false,
    redirected: false,
    type: 'basic',
    url: 'https://api.polar.sh/v1/checkouts/'
  },
  'data$': {
detail: [ [Object], [Object], [Object] ],
'request$': Request {
      method: 'POST',
      url: 'https://api.polar.sh/v1/checkouts/',
      headers: Headers {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        authorization: 'Bearer polar_oat_egOSwJWVOnenYxHFVRINhWKWWhTUZJqQO2SZk3BpB1C',
        cookie: '',
        'user-agent': 'speakeasy-sdk/typescript 0.42.1 2.788.5 0.1.0 @polar-sh/sdk'
      },
      destination: '',
      referrer: 'about:client',
      referrerPolicy: '',
      mode: 'cors',
      credentials: 'same-origin',
      cache: 'default',
      redirect: 'follow',
      integrity: '',
      keepalive: false,
      isReloadNavigation: false,
      isHistoryNavigation: false,
      signal: AbortSignal { aborted: false }
    },
    'response$': Response {
status: 422,
statusText: 'Unprocessable Entity',
headers: Headers {
date: 'Sat, 10 Jan 2026 22:50:42 GMT',
'content-type': 'application/json',
'content-length': '508',
connection: 'keep-alive',
'cf-ray': '9bbfbc2169362054-IAD',
'content-encoding': 'br',
'rndr-id': '2e7b3359-b44a-407c',
vary: 'Accept-Encoding',
'x-render-origin-server': 'uvicorn',
'cf-cache-status': 'DYNAMIC',
server: 'cloudflare',
'alt-svc': 'h3=":443"; ma=86400'
},
body: ReadableStream { locked: true, state: 'closed', supportsBYOB: true },
bodyUsed: true,
ok: false,
redirected: false,
type: 'basic',
url: 'https://api.polar.sh/v1/checkouts/'
},
'body$': `{"error":"RequestValidationError","detail":[{"type":"string_pattern_mismatch","loc":["body","function-after[is_complete_configuration(), CheckoutProductsCreate]","prices","8f88e778-374c-4ef3-9ca3-21d2cf136606",0,"fixed","price_currency"],"msg":"String should match pattern 'usd'","input":"eur","ctx":{"pattern":"usd"}},{"type":"missing","loc":["body","function-after[is_complete_configuration(), CheckoutProductCreate]","product_id"],"msg":"Field required","input":{"metadata":{"created_via":"public_checkout","manual_onboarding":"true","payment_type":"one_time","plan_name":"enterprise"},"allow_discount_codes":true,"require_billing_address":false,"allow_trial":true,"is_business_customer":false,"success_url":"https://tcdynamics.fr/checkout-success?checkout_id={CHECKOUT_ID}&source=manual","products":["8f88e778-374c-4ef3-9ca3-21d2cf136606"],"prices":{"8f88e778-374c-4ef3-9ca3-21d2cf136606":[{"amount_type":"fixed","price_amount":216000,"price_currency":"eur"}]}}},{"type":"missing","loc":["body","function-after[is_complete_configuration(), CheckoutPriceCreate]","product_price_id"],"msg":"Field required","input":{"metadata":{"created_via":"public_checkout","manual_onboarding":"true","payment_type":"one_time","plan_name":"enterprise"},"allow_discount_codes":true,"require_billing_address":false,"allow_trial":true,"is_business_customer":false,"success_url":"https://tcdynamics.fr/checkout-success?checkout_id={CHECKOUT_ID}&source=manual","products":["8f88e778-374c-4ef3-9ca3-21d2cf136606"],"prices":{"8f88e778-374c-4ef3-9ca3-21d2cf136606":[{"amount_type":"fixed","price_amount":216000,"price_currency":"eur"}]}}}]}`
},
detail: [
{
loc: [Array],
msg: "String should match pattern 'usd'",
type: 'string_pattern_mismatch'
},
{ loc: [Array], msg: 'Field required', type: 'missing' },
{ loc: [Array], msg: 'Field required', type: 'missing' }
]
}
