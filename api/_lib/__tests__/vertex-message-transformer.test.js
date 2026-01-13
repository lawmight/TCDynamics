/**
 * Unit tests for Vertex AI message transformer
 * Uses Node.js test runner (node:test)
 */

import { test, describe } from 'node:test'
import assert from 'node:assert'

import {
  toSafeText,
  normalizeEntryToParts,
  mapRole,
  filterParts,
  transformMessagesToContents,
} from '../vertex-message-transformer.js'

describe('toSafeText', () => {
  test('should handle string values', () => {
    assert.strictEqual(toSafeText('hello'), 'hello')
    assert.strictEqual(toSafeText(''), '')
  })

  test('should handle number values', () => {
    assert.strictEqual(toSafeText(123), '123')
    assert.strictEqual(toSafeText(0), '0')
    assert.strictEqual(toSafeText(-42), '-42')
  })

  test('should handle boolean values', () => {
    assert.strictEqual(toSafeText(true), 'true')
    assert.strictEqual(toSafeText(false), 'false')
  })

  test('should handle null and undefined', () => {
    assert.strictEqual(toSafeText(null), '')
    assert.strictEqual(toSafeText(undefined), '')
  })

  test('should handle objects', () => {
    assert.strictEqual(toSafeText({ a: 1 }), '{"a":1}')
    assert.strictEqual(toSafeText([1, 2, 3]), '[1,2,3]')
  })
})

describe('mapRole', () => {
  test('should map assistant to model', () => {
    assert.strictEqual(mapRole('assistant'), 'model')
  })

  test('should map system to user', () => {
    assert.strictEqual(mapRole('system'), 'user')
  })

  test('should map user to user', () => {
    assert.strictEqual(mapRole('user'), 'user')
  })

  test('should default unknown roles to user', () => {
    assert.strictEqual(mapRole('unknown'), 'user')
    assert.strictEqual(mapRole(''), 'user')
  })
})

describe('normalizeEntryToParts', () => {
  test('should handle string entries', () => {
    const parts = []
    normalizeEntryToParts('hello world', parts)
    assert.strictEqual(parts.length, 1)
    assert.deepStrictEqual(parts[0], { text: 'hello world' })
  })

  test('should handle number entries', () => {
    const parts = []
    normalizeEntryToParts(42, parts)
    assert.strictEqual(parts.length, 1)
    assert.deepStrictEqual(parts[0], { text: '42' })
  })

  test('should handle array entries', () => {
    const parts = []
    normalizeEntryToParts(['hello', 'world'], parts)
    assert.strictEqual(parts.length, 2)
    assert.deepStrictEqual(parts[0], { text: 'hello' })
    assert.deepStrictEqual(parts[1], { text: 'world' })
  })

  test('should handle Vertex inlineData format', () => {
    const parts = []
    const entry = {
      inlineData: {
        mimeType: 'image/png',
        data: 'base64data',
      },
    }
    normalizeEntryToParts(entry, parts)
    assert.strictEqual(parts.length, 1)
    assert.deepStrictEqual(parts[0], { inlineData: entry.inlineData })
  })

  test('should handle Vertex fileData format', () => {
    const parts = []
    const entry = {
      fileData: {
        fileUri: 'gs://bucket/file.png',
      },
    }
    normalizeEntryToParts(entry, parts)
    assert.strictEqual(parts.length, 1)
    assert.deepStrictEqual(parts[0], { fileData: entry.fileData })
  })

  test('should handle OpenAI-style image_url format', () => {
    const parts = []
    const entry = {
      type: 'image_url',
      image_url: {
        url: 'https://example.com/image.png',
      },
    }
    normalizeEntryToParts(entry, parts)
    assert.strictEqual(parts.length, 1)
    assert.deepStrictEqual(parts[0], {
      fileData: { fileUri: 'https://example.com/image.png' },
    })
  })

  test('should handle objects with text property', () => {
    const parts = []
    normalizeEntryToParts({ text: 'hello' }, parts)
    assert.strictEqual(parts.length, 1)
    assert.deepStrictEqual(parts[0], { text: 'hello' })
  })

  test('should handle nested parts arrays', () => {
    const parts = []
    normalizeEntryToParts({ parts: [{ text: 'hello' }, { text: 'world' }] }, parts)
    assert.strictEqual(parts.length, 2)
    assert.deepStrictEqual(parts[0], { text: 'hello' })
    assert.deepStrictEqual(parts[1], { text: 'world' })
  })

  test('should skip null and undefined entries', () => {
    const parts = []
    normalizeEntryToParts(null, parts)
    normalizeEntryToParts(undefined, parts)
    assert.strictEqual(parts.length, 0)
  })
})

describe('filterParts', () => {
  test('should remove empty text parts', () => {
    const parts = [
      { text: 'hello' },
      { text: '   ' },
      { text: '' },
      { text: 'world' },
    ]
    const filtered = filterParts(parts)
    assert.strictEqual(filtered.length, 2)
    assert.deepStrictEqual(filtered[0], { text: 'hello' })
    assert.deepStrictEqual(filtered[1], { text: 'world' })
  })

  test('should trim text parts', () => {
    const parts = [{ text: '  hello  ' }, { text: 'world' }]
    const filtered = filterParts(parts)
    assert.strictEqual(filtered.length, 2)
    assert.deepStrictEqual(filtered[0], { text: 'hello' })
  })

  test('should preserve non-text parts', () => {
    const parts = [
      { text: 'hello' },
      { inlineData: { mimeType: 'image/png', data: 'data' } },
      { fileData: { fileUri: 'gs://bucket/file.png' } },
    ]
    const filtered = filterParts(parts)
    assert.strictEqual(filtered.length, 3)
  })
})

describe('transformMessagesToContents', () => {
  test('should transform simple messages', () => {
    const messages = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there!' },
    ]
    const contents = transformMessagesToContents(messages)
    assert.strictEqual(contents.length, 2)
    assert.strictEqual(contents[0].role, 'user')
    assert.strictEqual(contents[1].role, 'model')
    assert.deepStrictEqual(contents[0].parts, [{ text: 'Hello' }])
    assert.deepStrictEqual(contents[1].parts, [{ text: 'Hi there!' }])
  })

  test('should map system role to user', () => {
    const messages = [{ role: 'system', content: 'You are a helpful assistant' }]
    const contents = transformMessagesToContents(messages)
    assert.strictEqual(contents.length, 1)
    assert.strictEqual(contents[0].role, 'user')
  })

  test('should filter out messages with empty content', () => {
    const messages = [
      { role: 'user', content: 'Hello' },
      { role: 'user', content: '' },
      { role: 'user', content: '   ' },
      { role: 'assistant', content: 'Hi' },
    ]
    const contents = transformMessagesToContents(messages)
    assert.strictEqual(contents.length, 2)
  })

  test('should handle array content', () => {
    const messages = [
      {
        role: 'user',
        content: ['Hello', 'world'],
      },
    ]
    const contents = transformMessagesToContents(messages)
    assert.strictEqual(contents.length, 1)
    assert.strictEqual(contents[0].parts.length, 2)
  })

  test('should handle multimodal content', () => {
    const messages = [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'What is this?' },
          {
            type: 'image_url',
            image_url: { url: 'https://example.com/image.png' },
          },
        ],
      },
    ]
    const contents = transformMessagesToContents(messages)
    assert.strictEqual(contents.length, 1)
    assert.strictEqual(contents[0].parts.length, 2)
    assert.strictEqual(contents[0].parts[0].text, 'What is this?')
    assert.ok(contents[0].parts[1].fileData)
  })

  test('should throw error for non-array input', () => {
    assert.throws(
      () => transformMessagesToContents(null),
      /Messages must be an array/
    )
    assert.throws(
      () => transformMessagesToContents('not an array'),
      /Messages must be an array/
    )
  })

  test('should handle complex nested structures', () => {
    const messages = [
      {
        role: 'user',
        content: {
          parts: [
            { text: 'Hello' },
            { text: 'World' },
          ],
        },
      },
    ]
    const contents = transformMessagesToContents(messages)
    assert.strictEqual(contents.length, 1)
    assert.strictEqual(contents[0].parts.length, 2)
  })
})
