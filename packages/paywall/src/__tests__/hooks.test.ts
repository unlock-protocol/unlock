import { afterEach, describe, expect, it, vi } from 'vitest'
import { notifyCheckoutHook } from '../utils/hooks'

describe('notifyCheckoutHook', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('posts JSON payloads to the configured hook URL', async () => {
    expect.assertions(2)

    const payload = {
      event: 'authenticated',
      address: '0xUser',
    }
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({ ok: true } as Response)

    await notifyCheckoutHook('https://example.com/hook', payload)

    expect(fetchMock).toHaveBeenCalledWith('https://example.com/hook', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('retries failed responses and stops after the configured retry budget', async () => {
    expect.assertions(4)

    vi.useFakeTimers()
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({ ok: false } as Response)

    await notifyCheckoutHook('https://example.com/hook', { event: 'status' })

    expect(fetchMock).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(1000)
    expect(fetchMock).toHaveBeenCalledTimes(2)

    await vi.advanceTimersByTimeAsync(3000)
    expect(fetchMock).toHaveBeenCalledTimes(3)

    await vi.advanceTimersByTimeAsync(3000)
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('logs network failures and retries the hook notification', async () => {
    expect.assertions(3)

    vi.useFakeTimers()
    const error = new Error('network down')
    const warnMock = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined)
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce({ ok: true } as Response)

    await notifyCheckoutHook('https://example.com/hook', { event: 'metadata' })

    expect(warnMock).toHaveBeenCalledWith(
      'Unlock checkout hook notification failed',
      error
    )
    expect(fetchMock).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(1000)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
