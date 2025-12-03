#!/usr/bin/env node

/**
 * Diagnostic script to test all module imports individually
 * This helps identify which module is causing the server to crash
 */

require('dotenv').config()
console.log('🔧 Testing module imports...')
console.log(
  'Environment variables loaded:',
  Object.keys(process.env).filter(
    key =>
      key.includes('STRIPE') || key.includes('NODE') || key.includes('PORT')
  ).length,
  'relevant vars'
)
console.log('')

const modules = [
  { name: 'Express', path: 'express' },
  { name: 'CORS', path: 'cors' },
  { name: 'Compression', path: 'compression' },
  { name: 'Morgan', path: 'morgan' },
  { name: 'Security Middleware', path: './src/middleware/security' },
  { name: 'Contact Routes', path: './src/routes/contact' },
  { name: 'Demo Routes', path: './src/routes/demo' },
  { name: 'Monitoring Routes', path: './src/routes/monitoring' },
  { name: 'Stripe Routes', path: './src/routes/stripe' },
    { name: 'RUM Routes', path: './src/routes/rum' },
  { name: 'Swagger', path: './src/swagger' },
  { name: 'Logger', path: './src/utils/logger' },
  { name: 'Error Handler', path: './src/middleware/errorHandler' },
  { name: 'CSRF Middleware', path: './src/middleware/csrf' },
]

let successCount = 0
let failureCount = 0

console.log('Testing external dependencies:')
modules.slice(0, 4).forEach(module => {
  try {
    require(module.path)
    console.log(`✅ ${module.name}`)
    successCount++
  } catch (error) {
    console.error(`❌ ${module.name}`)
    console.error(`   Error: ${error.message}`)
    failureCount++
  }
})

console.log('')
console.log('Testing internal modules:')
modules.slice(4).forEach(module => {
  try {
    require(module.path)
    console.log(`✅ ${module.name}`)
    successCount++
  } catch (error) {
    console.error(`❌ ${module.name}`)
    console.error(`   Error: ${error.message}`)
    if (error.stack) {
      console.error(
        `   Stack: ${error.stack.split('\n').slice(0, 3).join('\n   ')}`
      )
    }
    failureCount++
  }
})

console.log('')
console.log('='.repeat(50))
console.log(`Results: ${successCount} successful, ${failureCount} failed`)
console.log('='.repeat(50))

if (failureCount > 0) {
  console.log('')
  console.log(
    '❌ Some modules failed to load. This is likely the cause of your server crash.'
  )
  console.log(
    'Please check the error messages above and fix the failing modules.'
  )
  process.exit(1)
} else {
  console.log('')
  console.log('✅ All modules loaded successfully!')
  console.log('The issue might be elsewhere. Try running the server now.')
}
