import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildSanitizedSummary,
  createFilesUploadHandler,
} from '../files.js'

const toBase64 = (text) => Buffer.from(text, 'utf-8').toString('base64')

const createMockRes = () => {
  let statusCode = 200
  let payload

  return {
    status: (code) => {
      statusCode = code
      return {
        json: (data) => {
          payload = data
          return data
        },
      }
    },
    get statusCode() {
      return statusCode
    },
    get body() {
      return payload
    },
  }
}

const createSupabaseMock = () => {
  const state = {
    upsertPayload: null,
    uploadCalls: [],
  }

  const supabase = {
    storage: {
      from: () => ({
        upload: async (path, buffer) => {
          state.uploadCalls.push({ path, size: buffer.length })
          return { error: null }
        },
      }),
    },
    from: () => ({
      upsert: async (payload) => {
        state.upsertPayload = payload
        return { error: null }
      },
    }),
  }

  return { supabase, state }
}

test('buildSanitizedSummary refuses when not requested or missing text', () => {
  const resultNoRequest = buildSanitizedSummary('hello', false)
  assert.equal(resultNoRequest.allowed, false)
  assert.equal(resultNoRequest.summary, null)

  const resultNoText = buildSanitizedSummary('', true)
  assert.equal(resultNoText.allowed, false)
  assert.equal(resultNoText.summary, null)
})

test('buildSanitizedSummary suppresses PII-like content', () => {
  const result = buildSanitizedSummary('reach me at jane@example.com', true)
  assert.equal(result.allowed, false)
  assert.equal(result.summary, null)
  assert.equal(result.reason, 'pii_detected')
})

test('handler omits summary when not requested', async () => {
  const { supabase, state } = createSupabaseMock()
  const handler = createFilesUploadHandler({
    supabaseClientFactory: () => supabase,
    embedTextFn: async () => [0.01],
  })

  const res = createMockRes()
  await handler(
    {
      method: 'POST',
      query: {},
      body: {
        fileName: 'doc.txt',
        mimeType: 'text/plain',
        base64: toBase64('safe text'),
      },
    },
    res
  )

  assert.equal(res.statusCode, 200)
  assert.equal(res.body.summary, undefined)
  assert.equal(state.upsertPayload.summary, null)
})

test('handler returns sanitized summary when requested and safe', async () => {
  const { supabase, state } = createSupabaseMock()
  const handler = createFilesUploadHandler({
    supabaseClientFactory: () => supabase,
    embedTextFn: async () => [0.01],
  })

  const res = createMockRes()
  await handler(
    {
      method: 'POST',
      query: { includeSummary: 'true' },
      body: {
        fileName: 'doc.txt',
        mimeType: 'text/plain',
        base64: toBase64('plain summary content'),
      },
    },
    res
  )

  assert.equal(res.statusCode, 200)
  assert.equal(res.body.summary, 'plain summary content')
  assert.equal(state.upsertPayload.summary, 'plain summary content')
})

test('handler suppresses summary when requested but PII detected', async () => {
  const { supabase, state } = createSupabaseMock()
  const handler = createFilesUploadHandler({
    supabaseClientFactory: () => supabase,
    embedTextFn: async () => [0.01],
  })

  const res = createMockRes()
  await handler(
    {
      method: 'POST',
      query: { includeSummary: 'true' },
      body: {
        fileName: 'doc.txt',
        mimeType: 'text/plain',
        base64: toBase64('contact jane@example.com for details'),
      },
    },
    res
  )

  assert.equal(res.statusCode, 200)
  assert.equal(res.body.summary, undefined)
  assert.equal(state.upsertPayload.summary, null)
})

