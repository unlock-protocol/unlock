// ABOUTME: Guards against the worker module printing secrets (such as the
// ABOUTME: database URL with its password) to stdout when it is imported.
import { afterEach, describe, expect, it, vi } from 'vitest'

describe('worker module import', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
  })

  it('does not print the database URL', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.resetModules()
    await import('../../src/worker/worker')
    const printed = log.mock.calls.map((call) => call.join(' ')).join('\n')
    expect(printed).not.toMatch(/DATABASE|postgres(ql)?:\/\//)
  })
})
