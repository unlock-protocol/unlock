import { handler } from '../../__mocks__/worker/subscriber'
import { notify } from '../../src/worker/helpers'
import { Hook, HookEvent } from '../../src/models'
import { vi } from 'vitest'

const notifyHook = vi.fn()
notifyHook.mockImplementation(() => new HookEvent())

describe('Test notify helpers', () => {
  beforeAll(() => {
    fetchMock.mockIf(/^https?:\/\/localhost:4000\/.*$/, handler)
  })
  describe('Test notify function', () => {
    it('should succeed', async () => {
      expect.assertions(1)
      const hook = new Hook()
      hook.callback = 'http://localhost:4000/callback'
      hook.secret = 'websub'
      const response = await notify({
        hookCallback: hook.callback,
        hookSecret: hook.secret,
        body: {
          test: true,
        },
      })
      expect(response.ok).toBe(true)
    })

    it('should result in error with signature mismatch', async () => {
      expect.assertions(1)
      const hook = new Hook()
      hook.callback = 'http://localhost:4000/callback'
      // Change signature here
      hook.secret = 'websu'
      const response = await notify({
        hookCallback: hook.callback,
        hookSecret: hook.secret,
        body: {
          test: true,
        },
      })
      expect(response.ok).toBe(false)
    })

    it('should result in error if no signature provided to a client expecting it', async () => {
      expect.assertions(1)
      const hook = new Hook()
      hook.callback = 'http://localhost:4000/callback'

      const response = await notify({
        hookCallback: hook.callback,
        hookSecret: hook.secret,
        body: {
          test: true,
        },
      })
      expect(response.ok).toBe(false)
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
