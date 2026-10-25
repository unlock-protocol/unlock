import { notify } from '../../src/worker/helpers'
import { Hook, HookEvent } from '../../src/models'
import { vi, describe, it, expect } from 'vitest'

vi.mock('../../src/utils/safeOutboundUrl', async () => {
  const actual = await vi.importActual<
    typeof import('../../src/utils/safeOutboundUrl')
  >('../../src/utils/safeOutboundUrl')
  return {
    ...actual,
    fetchSafeOutbound: vi.fn(
      async (
        url: string,
        init: { method?: string; headers?: Record<string, string>; body?: string }
      ) => {
        const response = await fetch(url, {
          method: init.method,
          headers: init.headers,
          body: init.body,
        })
        return Object.assign(response, { blocked: false })
      }
    ),
  }
})

const notifyHook = vi.fn()
notifyHook.mockImplementation(() => new HookEvent())

describe('Test notify helpers', () => {
  beforeEach(() => {
    fetchMock.resetMocks()
  })

  describe('Test notify function', () => {
    it('should succeed', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ success: true }), {
        status: 200,
      })

      const hook = new Hook()
      hook.callback = 'https://example.com/callback'
      hook.secret = 'websub'

      const response = await notify({
        hookCallback: hook.callback,
        hookSecret: hook.secret,
        body: { test: true },
      })

      expect(response.ok).toBe(true)
      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(fetchMock).toHaveBeenCalledWith(
        'https://example.com/callback',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Hub-Signature': expect.any(String),
          }),
        })
      )
    })

    it('should result in error with signature mismatch', async () => {
      fetchMock.mockResponseOnce(
        JSON.stringify({ error: 'Signature mismatch' }),
        {
          status: 400,
        }
      )

      const hook = new Hook()
      hook.callback = 'https://example.com/callback'
      hook.secret = 'websu'

      const response = await notify({
        hookCallback: hook.callback,
        hookSecret: hook.secret,
        body: { test: true },
      })

      expect(response.ok).toBe(false)
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('should result in error if no signature provided to a client expecting it', async () => {
      fetchMock.mockResponseOnce(
        JSON.stringify({ error: 'Missing signature' }),
        {
          status: 400,
        }
      )

      const hook = new Hook()
      hook.callback = 'https://example.com/callback'

      const response = await notify({
        hookCallback: hook.callback,
        hookSecret: undefined,
        body: { test: true },
      })

      expect(response.ok).toBe(false)
      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(fetchMock).toHaveBeenCalledWith(
        'https://example.com/callback',
        expect.not.objectContaining({
          headers: expect.objectContaining({
            'X-Hub-Signature': expect.any(String),
          }),
        })
      )
    })
  })

  describe('Test notify hook function', () => {
    it('Test notify hook function', async () => {
      expect.assertions(1)
      const hook = new Hook()
      const body = { test: true }

      expect(notifyHook.call(hook, body)).toBeInstanceOf(HookEvent)
    })
  })
})
