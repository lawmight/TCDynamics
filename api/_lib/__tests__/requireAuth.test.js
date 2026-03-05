import assert from 'node:assert/strict'
import test from 'node:test'

import { requireAuth } from '../requireAuth.js'

function createMockRes() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.body = payload
      return this
    },
  }
}

test('returns 401 when auth header is missing', async () => {
  const wrapped = requireAuth(
    async (_req, res) => res.status(200).json({ ok: true }),
    {},
    {
      verifyAuth: async () => ({
        userId: null,
        error: 'Missing or invalid Authorization header',
      }),
    }
  )

  const req = { headers: {} }
  const res = createMockRes()
  await wrapped(req, res)

  assert.equal(res.statusCode, 401)
  assert.deepEqual(res.body, { error: 'Unauthorized' })
})

test('returns 401 when token is invalid', async () => {
  const wrapped = requireAuth(
    async (_req, res) => res.status(200).json({ ok: true }),
    {},
    {
      verifyAuth: async () => ({
        userId: null,
        error: 'Invalid or expired token',
      }),
    }
  )

  const req = { headers: { authorization: 'Bearer invalid-token' } }
  const res = createMockRes()
  await wrapped(req, res)

  assert.equal(res.statusCode, 401)
  assert.deepEqual(res.body, { error: 'Unauthorized' })
})

test('allows request when token is valid', async () => {
  const wrapped = requireAuth(
    async (req, res) => res.status(200).json({ clerkId: req.clerkId }),
    {},
    {
      verifyAuth: async () => ({ userId: 'user_123', error: null }),
    }
  )

  const req = { headers: { authorization: 'Bearer valid-token' } }
  const res = createMockRes()
  await wrapped(req, res)

  assert.equal(res.statusCode, 200)
  assert.deepEqual(res.body, { clerkId: 'user_123' })
})

test('allows request when plan check passes', async () => {
  const wrapped = requireAuth(
    async (req, res) =>
      res.status(200).json({ clerkId: req.clerkId, plan: req.user.plan }),
    { requiredPlans: ['professional', 'enterprise'] },
    {
      verifyAuth: async () => ({ userId: 'user_123', error: null }),
      connectDb: async () => true,
      findUserByClerkId: async () => ({ plan: 'professional' }),
    }
  )

  const req = { headers: { authorization: 'Bearer valid-token' } }
  const res = createMockRes()
  await wrapped(req, res)

  assert.equal(res.statusCode, 200)
  assert.deepEqual(res.body, { clerkId: 'user_123', plan: 'professional' })
})

test('returns 403 when plan check fails', async () => {
  const wrapped = requireAuth(
    async (_req, res) => res.status(200).json({ ok: true }),
    { requiredPlans: ['professional', 'enterprise'] },
    {
      verifyAuth: async () => ({ userId: 'user_123', error: null }),
      connectDb: async () => true,
      findUserByClerkId: async () => ({ plan: 'starter' }),
    }
  )

  const req = { headers: { authorization: 'Bearer valid-token' } }
  const res = createMockRes()
  await wrapped(req, res)

  assert.equal(res.statusCode, 403)
  assert.deepEqual(res.body, {
    error: 'Upgrade required',
    requiredPlan: 'professional',
  })
})
