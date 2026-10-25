// ABOUTME: Tests for the worker's retry-with-backoff helper that keeps the
// worker process alive through transient database connection failures.
import { vi } from 'vitest'
import { retryForever } from '../../src/worker/retry'

describe('retryForever', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the result when the first attempt succeeds', async () => {
    const fn = vi.fn().mockResolvedValue('ok')
    const onError = vi.fn()
    await expect(retryForever(fn, { onError })).resolves.toBe('ok')
    expect(fn).toHaveBeenCalledTimes(1)
    expect(onError).not.toHaveBeenCalled()
  })

  it('retries with exponential backoff capped at maxDelayMs', async () => {
    const error = new Error('read ECONNRESET')
    const fn = vi
      .fn()
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error)
      .mockResolvedValue('ok')
    const onError = vi.fn()

    const promise = retryForever(fn, {
      baseDelayMs: 1000,
      maxDelayMs: 3000,
      onError,
    })

    // attempt 1 fails immediately, wait 1000ms
    await vi.advanceTimersByTimeAsync(999)
    expect(fn).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(fn).toHaveBeenCalledTimes(2)

    // attempt 2 fails, wait 2000ms
    await vi.advanceTimersByTimeAsync(1999)
    expect(fn).toHaveBeenCalledTimes(2)
    await vi.advanceTimersByTimeAsync(1)
    expect(fn).toHaveBeenCalledTimes(3)

    // attempt 3 fails, wait would be 4000ms but is capped at 3000ms
    await vi.advanceTimersByTimeAsync(2999)
    expect(fn).toHaveBeenCalledTimes(3)
    await vi.advanceTimersByTimeAsync(1)
    expect(fn).toHaveBeenCalledTimes(4)

    await expect(promise).resolves.toBe('ok')
    expect(onError).toHaveBeenCalledTimes(3)
    expect(onError).toHaveBeenNthCalledWith(1, error, 1, 1000)
    expect(onError).toHaveBeenNthCalledWith(2, error, 2, 2000)
    expect(onError).toHaveBeenNthCalledWith(3, error, 3, 3000)
  })
})
