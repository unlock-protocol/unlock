import { subscriberServer } from '../../__mocks__/websub/subscriber'
import { notify } from '../../src/websub/helpers'
import { Hook, HookEvent } from '../../src/models'
import { vi } from 'vitest'

const notifyHook = vi.fn()
notifyHook.mockImplementation(() => new HookEvent())

describe('Test notify helpers', () => {
  beforeAll(() => subscriberServer.listen())
  afterEach(() => subscriberServer.resetHandlers())
  describe('Test notify function', () => {
    it('should succeed', async () => {
      expect.assertions(1)
      const hook = new Hook()
      hook.callback = 'http://localhost:4000/callback'
      hook.secret = 'websub'
      const response = await notify({
        hook,
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
        hook,
        body: {
          test: true,
        },
      })
      expect(response.ok).toBe(false)
    })

    it('Should result in error if no signature provided to a client expecting it', async () => {
      expect.assertions(1)
      const hook = new Hook()
      hook.callback = 'http://localhost:4000/callback'
      const response = await notify({
        hook,
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
  afterAll(() => subscriberServer.close())
})
