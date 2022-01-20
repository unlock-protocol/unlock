import { subscriberServer } from '../../__mocks__/websub/subscriber'
import { notify } from '../../src/websub/helpers'
import { Hook } from '../../src/models'

beforeAll(() => subscriberServer.listen())

afterEach(() => subscriberServer.resetHandlers())

afterAll(() => subscriberServer.close())
describe('Test notify function', () => {
  it('should succeed', async () => {
    expect.assertions(1)
    const hook = new Hook()
    hook.callback = 'http://localhost:4000/callback'
    hook.secret = 'websub'
    const fn = notify(hook, { test: true })
    const response = await fn()
    expect(response.status).toBe(200)
  })

  it('should throw with signature mismatch', async () => {
    expect.assertions(1)
    const hook = new Hook()
    hook.callback = 'http://localhost:4000/callback'
    // Change signature here
    hook.secret = 'websu'
    const fn = notify(hook, { test: true })
    const response = await fn()
    expect(response.ok).toBe(false)
  })
})
