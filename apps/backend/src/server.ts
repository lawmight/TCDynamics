/**
 * Server entry point
 * Minimal entry point that initializes and starts the server
 */

// Add error handlers at the very top before any imports
process.on('uncaughtException', (error: Error) => {
  console.error('❌ Uncaught Exception:', error)
  console.error('Stack:', error.stack)
  process.exit(1)
})

process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// Load environment variables
console.log('🔧 Loading environment variables...')
import dotenv from 'dotenv'
dotenv.config()
console.log('✅ Environment variables loaded')

import { createApp } from './app'
import { loadEnvironment } from './config/environment'
import { logger } from './utils/logger'

/**
 * Start the server
 */
function startServer(): void {
  try {
    const config = loadEnvironment()
    const app = createApp()
    const PORT = config.port

    // Start server
    console.log('🔧 Starting server...')
    const server = app.listen(PORT, () => {
      console.log('='.repeat(60))
      console.log('🚀 SERVER STARTED SUCCESSFULLY')
      console.log('='.repeat(60))
      console.log(`Port: ${PORT}`)
      console.log(`Environment: ${config.nodeEnv}`)
      console.log(`Frontend URL: ${config.frontendUrl}`)
      console.log(`Email Configured: ${!!config.email.user}`)
      console.log('')
      console.log('📋 Available Endpoints:')
      console.log(`  Health Check: http://localhost:${PORT}/health`)
      console.log(`  API Test: http://localhost:${PORT}/api/test`)
      console.log(`  API Docs: http://localhost:${PORT}/api-docs`)
      console.log()
      console.log('')
      console.log('✅ Server is ready to accept requests')
      console.log('='.repeat(60))

      // Log using the logger if available
      if (logger && typeof logger.info === 'function') {
        logger.info('🚀 Serveur TCDynamics démarré', {
          port: PORT,
          environment: config.nodeEnv,
          emailConfigured: !!config.email.user,
          frontendUrl: config.frontendUrl,
          apiDocsUrl: `http://localhost:${PORT}/api-docs`,
          openApiUrl: `http://localhost:${PORT}/api-docs.json`,
        })
      }
    })

    // Server error handler
    server.on('error', (error: NodeJS.ErrnoException) => {
      console.error('❌ Server failed to start:', error)
      if (error.code === 'EADDRINUSE') {
        console.error(
          `❌ Port ${PORT} is already in use. Please use a different port or kill the process using this port.`
        )
      }
      process.exit(1)
    })

    // Graceful shutdown handlers
    process.on('SIGTERM', () => {
      if (logger && typeof logger.info === 'function') {
        logger.info('🛑 Signal SIGTERM reçu, arrêt gracieux du serveur')
      }
      server.close(() => {
        process.exit(0)
      })
    })

    process.on('SIGINT', () => {
      if (logger && typeof logger.info === 'function') {
        logger.info('🛑 Signal SIGINT reçu, arrêt gracieux du serveur')
      }
      server.close(() => {
        process.exit(0)
      })
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// Start the server
startServer()
