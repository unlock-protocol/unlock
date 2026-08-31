// ABOUTME: Ensures the HTTP request/error loggers never write credentials
// ABOUTME: (session tokens, cookies, API keys) into the log stream.
import express from 'express'
import expressWinston from 'express-winston'
import request from 'supertest'
import { Writable } from 'stream'
import winston from 'winston'
import { describe, expect, it } from 'vitest'
import {
  requestLoggerOptions,
  errorLoggerOptions,
} from '../../src/utils/requestLogger'

// Collects every log line written through winston as a string.
class CaptureTransport extends winston.transports.Stream {
  entries: string[] = []
  constructor() {
    const entries: string[] = []
    super({
      stream: new Writable({
        write(chunk, _encoding, callback) {
          entries.push(chunk.toString())
          callback()
        },
      }),
      format: winston.format.json(),
    })
    this.entries = entries
  }
}

const SECRETS = ['session-token-abc', 'cookie-value-xyz', 'api-key-123']

const buildApp = (capture: CaptureTransport, fail = false) => {
  const app = express()
  app.use(
    expressWinston.logger({
      ...requestLoggerOptions,
      transports: [capture],
    })
  )
  app.get('/ping', (_req, res, next) => {
    if (fail) {
      next(new Error('boom'))
      return
    }
    res.send('pong')
  })
  app.use(
    expressWinston.errorLogger({
      ...errorLoggerOptions,
      transports: [capture],
    })
  )
  // Explicit terminal handler so the test does not depend on Express's
  // default error handling to end the response.
  app.use(
    (
      _err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      res.status(500).send('error')
    }
  )
  return app
}

const send = (app: express.Express) =>
  request(app)
    .get('/ping?api-key=api-key-123&chain=8453')
    .set('authorization', 'Bearer session-token-abc')
    .set('cookie', 'session=cookie-value-xyz')
    .set('user-agent', 'test-agent')

describe('request logger redaction', () => {
  it('logs requests without credentials but keeps useful metadata', async () => {
    const capture = new CaptureTransport()
    await send(buildApp(capture)).expect(200)

    expect(capture.entries).toHaveLength(1)
    const entry = capture.entries[0]
    for (const secret of SECRETS) {
      expect(entry).not.toContain(secret)
    }
    expect(entry).toContain('test-agent')
    expect(entry).toContain('"chain":"8453"')
  })

  it('logs errors without credentials', { timeout: 10_000 }, async () => {
    const capture = new CaptureTransport()
    await send(buildApp(capture, true)).expect(500)

    const errorEntry = capture.entries.find((e) => e.includes('boom'))
    expect(errorEntry).toBeDefined()
    for (const secret of SECRETS) {
      expect(errorEntry).not.toContain(secret)
    }
  })
})
