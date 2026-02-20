/**
 * @tcd/shared-types - User Types
 * Shared user, plan, and subscription type definitions
 * Extracted from api/_lib/models/User.js Mongoose schema
 */

/** Available subscription plans */
export const UserPlan = {
  STARTER: 'starter',
  PROFESSIONAL: 'professional',
  ENTERPRISE: 'enterprise',
} as const

export type UserPlan = (typeof UserPlan)[keyof typeof UserPlan]

/** Subscription status values (synced via Polar webhook) */
export const SubscriptionStatus = {
  ACTIVE: 'active',
  CANCELED: 'canceled',
  PAST_DUE: 'past_due',
  TRIALING: 'trialing',
} as const

export type SubscriptionStatus =
  | (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus]
  | null

/** User shape matching the Mongoose User model */
export interface User {
  clerkId: string
  email: string
  plan: UserPlan
  subscriptionStatus: SubscriptionStatus
  polarCustomerId: string | null
  polarSubscriptionId: string | null
  firstName: string | null
  lastName: string | null
  imageUrl: string | null
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
}
