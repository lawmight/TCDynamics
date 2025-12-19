/**
 * Stripe service
 * Handles Stripe SDK initialization and configuration
 */

import Stripe from 'stripe'
import { EnvironmentConfig } from '../config/environment'

let stripeInstance: Stripe | null = null

/**
 * Initialize Stripe service
 */
export function initializeStripeService(
  config: EnvironmentConfig['stripe']
): Stripe {
  if (stripeInstance) {
    return stripeInstance
  }

  // Validate Stripe configuration
  if (!config.secretKey) {
    throw new Error('STRIPE_SECRET_KEY not found in environment variables')
  }

  if (!config.secretKey.startsWith('sk_')) {
    throw new Error(
      'Invalid STRIPE_SECRET_KEY format. Stripe secret key should start with "sk_test_" or "sk_live_"'
    )
  }

  // Initialize Stripe with latest API version
  try {
    stripeInstance = new Stripe(config.secretKey, {
      apiVersion: '2025-10-29.clover',
    })
    console.log('✅ Stripe SDK initialized successfully')
    return stripeInstance
  } catch (error) {
    const err = error as Error
    console.error('❌ Failed to initialize Stripe SDK:', err.message)
    throw err
  }
}

/**
 * Get Stripe instance
 */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    throw new Error(
      'Stripe service not initialized. Call initializeStripeService first.'
    )
  }
  return stripeInstance
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  const stripe = getStripe()
  return stripe.webhooks.constructEvent(payload, signature, secret)
}
