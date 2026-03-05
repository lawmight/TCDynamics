import assert from 'node:assert/strict'
import test from 'node:test'

import { AnalyticsEvent } from '../models/AnalyticsEvent.js'
import { KnowledgeFile } from '../models/KnowledgeFile.js'
import { ensureString, sanitizeMongoInput } from '../sanitize-mongo.js'
import { validateImageUrl } from '../validate-url.js'

test('ensureString returns null for non-string values', () => {
  assert.equal(ensureString('user_123'), 'user_123')
  assert.equal(ensureString({ $ne: null }), null)
  assert.equal(ensureString(42), null)
  assert.equal(ensureString(null), null)
})

test('sanitizeMongoInput strips Mongo operators recursively', () => {
  const payload = {
    plan: { $regex: '.*' },
    nested: {
      safe: 'value',
      $where: 'this.password',
    },
    array: [{ keep: true, $ne: null }],
    $or: [{ role: 'admin' }],
  }

  const sanitized = sanitizeMongoInput(payload)
  assert.deepEqual(sanitized, {
    plan: {},
    nested: { safe: 'value' },
    array: [{ keep: true }],
  })
})

test('validateImageUrl blocks non-HTTPS and internal targets', () => {
  const blockedMetadata = validateImageUrl(
    'http://169.254.169.254/latest/meta-data/'
  )
  assert.equal(blockedMetadata.valid, false)

  const blockedLocalhost = validateImageUrl('https://localhost:3000/image.jpg')
  assert.equal(blockedLocalhost.valid, false)

  const blockedLocalIp = validateImageUrl('https://127.0.0.1/image.jpg')
  assert.equal(blockedLocalIp.valid, false)

  const valid = validateImageUrl('https://images.unsplash.com/photo.jpg')
  assert.equal(valid.valid, true)
  assert.equal(valid.url, 'https://images.unsplash.com/photo.jpg')
})

test('AnalyticsEvent rejects operator object in clerkId', () => {
  const doc = new AnalyticsEvent({
    event: 'security_test',
    clerkId: { $ne: null },
  })

  const error = doc.validateSync()
  assert.ok(error?.errors?.clerkId)
})

test('KnowledgeFile rejects operator object in clerkId', () => {
  const doc = new KnowledgeFile({
    path: '/tmp/test.txt',
    name: 'test.txt',
    clerkId: { $ne: null },
  })

  const error = doc.validateSync()
  assert.ok(error?.errors?.clerkId)
})

test('schemas accept valid string clerkId', () => {
  const analyticsDoc = new AnalyticsEvent({
    event: 'security_test',
    clerkId: 'user_abc123',
  })
  assert.equal(analyticsDoc.validateSync(), undefined)

  const fileDoc = new KnowledgeFile({
    path: '/tmp/file.pdf',
    name: 'file.pdf',
    clerkId: 'user_abc123',
  })
  assert.equal(fileDoc.validateSync(), undefined)
})
