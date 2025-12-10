/**
 * Sentry Error Tracking Utility
 *
 * Minimal setup for production error monitoring.
 * Only initializes if SENTRY_DSN environment variable is set.
 */

import * as Sentry from '@sentry/node';

let initialized = false;

/**
 * Initialize Sentry (call once per cold start)
 */
export function initSentry() {
  if (initialized) {
    return;
  }

  const dsn = process.env.SENTRY_DSN;
  const release = process.env.SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA;

  if (!dsn) {
    console.log('[Sentry] Not initialized - SENTRY_DSN not set');
    return;
  }

  try {
    Sentry.init({
      dsn,
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
      tracesSampleRate: 0.1, // 10% of transactions for performance monitoring (keep costs low)
      release,

      // Only send errors in production
      beforeSend(event) {
        // Skip if in development
        if (process.env.VERCEL_ENV !== 'production') {
          return null;
        }
        return event;
      },
    });

    initialized = true;
    console.log('[Sentry] Initialized successfully');
  } catch (error) {
    console.error('[Sentry] Failed to initialize:', error.message);
  }
}

/**
 * Capture an exception to Sentry
 * @param {Error} error - The error to capture
 * @param {Object} context - Additional context (optional)
 */
export function captureException(error, context = {}) {
  if (!initialized || !process.env.SENTRY_DSN) {
    // Just log to console if Sentry not available
    console.error('[Error]', error);
    if (Object.keys(context).length > 0) {
      console.error('[Context]', context);
    }
    return;
  }

  try {
    Sentry.captureException(error, {
      extra: context,
    });
  } catch (sentryError) {
    console.error('[Sentry] Failed to capture exception:', sentryError.message);
    console.error('[Original Error]', error);
  }
}

/**
 * Capture a message to Sentry (for non-error events)
 * @param {string} message - The message to capture
 * @param {string} level - Severity level (info, warning, error)
 * @param {Object} context - Additional context (optional)
 */
export function captureMessage(message, level = 'info', context = {}) {
  if (!initialized || !process.env.SENTRY_DSN) {
    console.log(`[${level.toUpperCase()}]`, message);
    return;
  }

  try {
    Sentry.captureMessage(message, {
      level,
      extra: context,
    });
  } catch (sentryError) {
    console.error('[Sentry] Failed to capture message:', sentryError.message);
  }
}

/**
 * Wrap an API handler with Sentry error tracking
 * @param {Function} handler - The API handler function
 * @returns {Function} Wrapped handler
 */
export function withSentry(handler) {
  return async (req, res) => {
    // Initialize Sentry on first request (cold start)
    initSentry();

    try {
      return await handler(req, res);
    } catch (error) {
      // Capture the error
      captureException(error, {
        url: req.url,
        method: req.method,
        headers: req.headers,
        query: req.query,
        requestId: req.requestId,
      });

      // Re-throw so the handler can decide how to respond
      throw error;
    }
  };
}

export default {
  initSentry,
  captureException,
  captureMessage,
  withSentry,
};
