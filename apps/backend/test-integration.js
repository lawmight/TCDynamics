#!/usr/bin/env node

// Load test environment
require('dotenv').config({ path: './test.env' })
const http = require('http')

// Fonction pour tester une URL
function testEndpoint(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    const req = http.request(url, options, res => {
      let body = ''
      res.on('data', chunk => (body += chunk))
      res.on('end', () => {
        try {
          const response = JSON.parse(body)
          resolve({ status: res.statusCode, data: response })
        } catch (e) {
          resolve({ status: res.statusCode, data: body })
        }
      })
    })

    req.on('error', reject)

    if (data) {
      req.write(JSON.stringify(data))
    }

    req.end()
  })
}

async function runTests() {
  console.log("🚀 Test d'intégration TCDynamics\n")

  const results = []

  try {
    // Test 1: Backend health check
    console.log('📊 Test 1: Backend health check')
    const health = await testEndpoint('http://localhost:8080/health')
    results.push({
      name: 'Backend Health',
      status: health.status === 200 ? '✅' : '❌',
      details: `Status: ${health.status}, Uptime: ${health.data.uptime?.toFixed(1)}s`,
    })

    // Test 2: API test endpoint
    console.log('📊 Test 2: API test endpoint')
    const apiTest = await testEndpoint('http://localhost:8080/api/test')
    results.push({
      name: 'API Test',
      status: apiTest.status === 200 && apiTest.data.success ? '✅' : '❌',
      details: `Status: ${apiTest.status}, Message: "${apiTest.data.message}"`,
    })

    // Test 3: Contact form validation (invalid data)
    console.log('📊 Test 3: Contact form validation (invalid data)')
    const invalidContact = await testEndpoint(
      'http://localhost:8080/api/contact',
      'POST',
      {
        name: '',
        email: 'invalid-email',
        message: 'Test',
      }
    )
    results.push({
      name: 'Contact Validation',
      status:
        invalidContact.status === 400 && invalidContact.data.errors
          ? '✅'
          : '❌',
      details: `Status: ${invalidContact.status}, Errors: ${invalidContact.data.errors?.length || 0}`,
    })

    // Test 4: Demo form validation (invalid data)
    console.log('📊 Test 4: Demo form validation (invalid data)')
    const invalidDemo = await testEndpoint(
      'http://localhost:8080/api/demo',
      'POST',
      {
        firstName: '',
        lastName: '',
        email: 'invalid-email',
        company: '',
      }
    )
    results.push({
      name: 'Demo Validation',
      status:
        invalidDemo.status === 400 && invalidDemo.data.errors ? '✅' : '❌',
      details: `Status: ${invalidDemo.status}, Errors: ${invalidDemo.data.errors?.length || 0}`,
    })

    // Test 5: Rate limiting
    console.log('📊 Test 5: Rate limiting')
    const rateLimitTests = []
    for (let i = 0; i < 6; i++) {
      const response = await testEndpoint(
        'http://localhost:8080/api/contact',
        'POST',
        {
          name: 'Rate Limit Test',
          email: 'test@example.com',
          message: 'Rate limit test message',
        }
      )
      rateLimitTests.push(response)
    }

    const rateLimited = rateLimitTests.some(r =>
      r.data.message?.includes('Trop de tentatives')
    )
    results.push({
      name: 'Rate Limiting',
      status: rateLimited ? '✅' : '❌',
      details: `Rate limited after ${rateLimitTests.findIndex(r => r.data.message?.includes('Trop de tentatives')) + 1} attempts`,
    })

    // Test 6: Frontend availability (basic check)
    console.log('📊 Test 6: Frontend availability')
    const frontend = await testEndpoint('http://localhost:8080')
    results.push({
      name: 'Frontend',
      status: frontend.status === 200 ? '✅' : '❌',
      details: `Status: ${frontend.status}`,
    })
  } catch (error) {
    results.push({
      name: 'Connection Error',
      status: '❌',
      details: `Error: ${error.message}`,
    })
  }

  // Afficher les résultats
  console.log('\n📋 Résultats des tests:\n')
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.name}: ${result.status}`)
    console.log(`   ${result.details}\n`)
  })

  const passed = results.filter(r => r.status === '✅').length
  const total = results.length

  console.log(`🎯 Score: ${passed}/${total} tests réussis`)

  if (passed === total) {
    console.log(
      "🎉 Tous les tests sont passés ! L'intégration est fonctionnelle."
    )
  } else {
    console.log('⚠️ Certains tests ont échoué. Vérifiez les configurations.')
  }

  console.log('\n📝 Prochaines étapes:')
  console.log('1. Configurer Zoho Mail avec de vraies informations')
  console.log("2. Tester l'envoi d'emails réel")
  console.log('3. Déployer le backend')
  console.log('4. Tester les formulaires depuis le navigateur')

  process.exit(passed === total ? 0 : 1)
}

runTests().catch(console.error)
