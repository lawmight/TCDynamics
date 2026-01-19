const express = require('express')
const rateLimit = require('express-rate-limit')
const Joi = require('joi')
const crypto = require('crypto')
const { query } = require('../utils/db')
const { asyncHandler, ValidationError } = require('../middleware/errorHandler')

const router = express.Router()

// Route-scoped CORS for beacon ingestion (allow cross-origin, no credentials)
router.use((req, res, next) => {
  res.setHeader(
    'Access-Control-Allow-Origin',
    process.env.RUM_ALLOWED_ORIGINS || '*',
  )
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Write-Key')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204)
  }
  return next()
})

// Higher limits for ingestion, with basic abuse protection
const ingestLimiter = rateLimit({
  windowMs: parseInt(process.env.RUM_WINDOW_MS) || 60 * 1000, // 1 minute
  max: parseInt(process.env.RUM_MAX_REQUESTS) || 600, // 600 req/min/IP
  standardHeaders: true,
  legacyHeaders: false,
})

const allowedMetrics = ['CLS', 'LCP', 'INP', 'TTFB', 'FCP', 'LT']

const eventSchema = Joi.object({
  ts: Joi.date().iso().optional(),
  url: Joi.string().uri({ allowRelative: true }).allow('').optional(),
  path: Joi.string().max(2048).required(),
  referrer: Joi.string().allow('', null).optional(),
  country: Joi.string().uppercase().length(2).allow(null)
    .optional(),
  device: Joi.string()
    .valid('desktop', 'mobile', 'tablet')
    .allow(null)
    .optional(),
  session_id: Joi.string().max(128).allow(null).optional(),
  visitor_id: Joi.string().max(128).allow(null).optional(),
  metric: Joi.string()
    .valid(...allowedMetrics)
    .required(),
  value: Joi.number().min(0).required(),
  metadata: Joi.object().unknown(true).default({}).optional(),
})

const collectSchema = Joi.object({
  projectId: Joi.string().max(64).optional(),
  events: Joi.array().items(eventSchema).min(1).max(100)
    .required(),
})

const hashIp = ip => {
  try {
    const salt = process.env.IP_HASH_SALT || 'dev-salt'
    return crypto.createHash('sha256').update(`${salt}:${ip}`).digest('hex')
  } catch (_) {
    return null
  }
}

const resolveProjectByKey = async writeKey => {
  const res = await query(
    'SELECT id, public_write_key FROM projects WHERE public_write_key = $1 LIMIT 1',
    [writeKey],
  )
  return res.rows[0] || null
}

// POST /api/rum/collect
router.post(
  '/rum/collect',
  ingestLimiter,
  asyncHandler(async (req, res) => {
    const writeKey = req.header('x-write-key')
      || req.header('X-Write-Key')
      || req.query.key
      || req.query.k
      || req.body?.key
      || req.body?.writeKey
    if (!writeKey) {
      throw new ValidationError('Missing X-Write-Key header')
    }

    const project = await resolveProjectByKey(writeKey)
    if (!project) {
      throw new ValidationError('Invalid write key')
    }

    const { error, value } = collectSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    })
    if (error) {
      throw new ValidationError(error.details.map(d => d.message).join('; '))
    }

    const clientIp = req.ip || req.connection?.remoteAddress || ''
    const ipHash = hashIp(clientIp)
    const serverNow = new Date()

    // Build parameterized bulk insert
    const columns = [
      'project_id',
      'ts',
      'url',
      'path',
      'referrer',
      'country',
      'device',
      'session_id',
      'visitor_id',
      'metric',
      'value',
      'metadata',
      'ip_hash',
    ]

    const values = []
    const params = []
    let paramIndex = 1
    for (const e of value.events) {
      const ts = e.ts ? new Date(e.ts) : serverNow
      // Build parameter placeholders for SQL query
      const currentIndex = paramIndex
      // eslint-disable-next-line no-loop-func
      const placeholders = Array.from(
        { length: 13 },
        (_, i) => `$${currentIndex + i}`,
      ).join(', ')
      values.push(`(${placeholders})`)
      paramIndex += 13
      params.push(
        project.id,
        ts,
        e.url || null,
        e.path,
        e.referrer || null,
        e.country || null,
        e.device || null,
        e.session_id || null,
        e.visitor_id || null,
        e.metric,
        e.value,
        e.metadata || {},
        ipHash,
      )
    }

    const sql = `INSERT INTO rum_events (${columns.join(',')}) VALUES ${values.join(
      ',',
    )}`
    await query(sql, params)

    res.status(202).json({ success: true, accepted: value.events.length })
  }),
)

// GET /api/metrics/overview?projectId=...&days=7
router.get(
  '/metrics/overview',
  asyncHandler(async (req, res) => {
    const { projectId } = req.query
    const days = Math.min(parseInt(req.query.days || '7'), 30)
    if (!projectId) {
      throw new ValidationError('Missing projectId')
    }

    const metrics = ['LCP', 'INP', 'CLS', 'TTFB', 'FCP']
    const results = {}
    for (const m of metrics) {
      const q = `SELECT
        percentile_disc(0.5) WITHIN GROUP (ORDER BY value) AS p50,
        percentile_disc(0.75) WITHIN GROUP (ORDER BY value) AS p75,
        percentile_disc(0.95) WITHIN GROUP (ORDER BY value) AS p95,
        COUNT(*) AS samples
      FROM rum_events
      WHERE project_id = $1 AND metric = $2 AND ts >= now() - ($3 || ' days')::interval`
      const { rows } = await query(q, [projectId, m, days])
      results[m] = rows[0]
    }

    res.json({
      success: true, projectId, windowDays: days, results,
    })
  }),
)

// GET /api/metrics/pages?projectId=...&days=7&limit=50
router.get(
  '/metrics/pages',
  asyncHandler(async (req, res) => {
    const { projectId } = req.query
    const days = Math.min(parseInt(req.query.days || '7'), 30)
    const limit = Math.min(parseInt(req.query.limit || '50'), 200)
    if (!projectId) {
      throw new ValidationError('Missing projectId')
    }

    // Compute per-path samples and p75 for key metrics
    const baseCte = `WITH windowed AS (
      SELECT path, metric, value
      FROM rum_events
      WHERE project_id = $1 AND ts >= now() - ($2 || ' days')::interval AND path IS NOT NULL
    )`

    const perMetric = async metric => {
      const sql = `${baseCte}
        SELECT path,
          percentile_disc(0.75) WITHIN GROUP (ORDER BY value) AS p75,
          COUNT(*) AS samples
        FROM windowed
        WHERE metric = $3
        GROUP BY path
        ORDER BY samples DESC
        LIMIT $4`
      const { rows } = await query(sql, [projectId, days, metric, limit])
      return rows
    }

    const [lcp, inp, cls] = await Promise.all([
      perMetric('LCP'),
      perMetric('INP'),
      perMetric('CLS'),
    ])

    // Merge by path
    const byPath = {}
    const add = (rows, key) => {
      for (const r of rows) {
        byPath[r.path] = byPath[r.path] || { path: r.path, samples: 0 }
        byPath[r.path][key] = Number(r.p75)
        byPath[r.path].samples = Math.max(
          byPath[r.path].samples,
          Number(r.samples),
        )
      }
    }
    add(lcp, 'p75LCP')
    add(inp, 'p75INP')
    add(cls, 'p75CLS')

    res.json({
      success: true,
      projectId,
      windowDays: days,
      pages: Object.values(byPath),
    })
  }),
)

module.exports = router
