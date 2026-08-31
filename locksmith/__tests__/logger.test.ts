// ABOUTME: Verifies the winston logger writes to stdout in every environment
// ABOUTME: except tests, since Railway's log view is the only log sink.
import { afterEach, describe, expect, it, vi } from 'vitest'
import winston from 'winston'

const loadLoggerWithEnv = async (nodeEnv: string) => {
  const previous = process.env.NODE_ENV
  process.env.NODE_ENV = nodeEnv
  vi.resetModules()
  try {
    const { logger } = await import('../src/logger')
    return logger
  } finally {
    process.env.NODE_ENV = previous
    vi.resetModules()
  }
}

describe('logger', () => {
  afterEach(() => {
    vi.resetModules()
  })

  it('writes to the console in production', async () => {
    const logger = await loadLoggerWithEnv('production')
    const consoleTransports = logger.transports.filter(
      (transport) => transport instanceof winston.transports.Console
    )
    expect(consoleTransports).toHaveLength(1)
    expect(consoleTransports[0].silent).toBeFalsy()
  })

  it('stays quiet in tests', async () => {
    const logger = await loadLoggerWithEnv('test')
    const consoleTransports = logger.transports.filter(
      (transport) => transport instanceof winston.transports.Console
    )
    expect(consoleTransports).toHaveLength(1)
    expect(consoleTransports[0].silent).toBe(true)
  })

  it('uses only the console transport', async () => {
    const logger = await loadLoggerWithEnv('production')
    expect(logger.transports).toHaveLength(1)
  })
})
