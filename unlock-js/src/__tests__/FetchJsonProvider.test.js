import NockHelper from './helpers/nockHelper'
import FetchJsonProvider from '../FetchJsonProvider'

const endpoint = 'http://127.0.0.1:8545'
const nock = new NockHelper(endpoint, false /** debug */)

describe('FetchJsonProvider', () => {
  const originalFetch = global.fetch
  describe('verify parameters passed in', () => {
    let fetch

    function fakeFetchSuccess(returnValue) {
      fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              error: null,
              result: returnValue,
            }),
        })
      )
      global.fetch = fetch
    }

    afterEach(() => {
      global.fetch = originalFetch
    })

    it('should set cors mode, POST, and content-type', async () => {
      expect.assertions(1)
      const result = { id: 42, jsonrpc: '2.0', result: 123, error: null }

      fakeFetchSuccess(result)

      const provider = new FetchJsonProvider(endpoint)

      await provider.send('net_version', [])

      expect(fetch).toHaveBeenCalledWith(
        endpoint,
        expect.objectContaining({
          body: JSON.stringify({
            method: 'net_version',
            params: [],
            id: 42,
            jsonrpc: '2.0',
          }),
          mode: 'cors',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // "Content-Type": "application/x-www-form-urlencoded",
          },
        })
      )
      await new Promise(resolve => setTimeout(resolve, 1)) // this ensures our test finishes after the provider requests net_version
    })
  })

  describe('failures', () => {
    beforeEach(() => {
      global.fetch = originalFetch
      nock.cleanAll()
    })

    afterEach(() => {
      nock.cleanAll()
    })

    it('if request fails, should throw', async () => {
      expect.assertions(2)

      nock.do404('net_version', [])
      nock.do404('net_version', [])

      try {
        const provider = new FetchJsonProvider(endpoint)
        await provider.send('net_version', [])
      } catch (e) {
        expect(e).toBeInstanceOf(Error)
        expect(e.message).toBe('invalid response - 404')
      }
      await new Promise(resolve => setTimeout(resolve, 1)) // this ensures our test finishes after the provider requests net_version
    })

    it('if json-rpc fails, should throw', async () => {
      expect.assertions(2)

      nock.ethCallAndFail('data', 'to', { code: 404, message: 'nope' })
      nock.netVersionAndYield(1984)

      try {
        const provider = new FetchJsonProvider(endpoint)
        await provider.send('eth_call', [{ data: 'data', to: 'to' }, 'latest'])
      } catch (e) {
        expect(e).toBeInstanceOf(Error)
        expect(e.message).toBe('nope')
      }
      await new Promise(resolve => setTimeout(resolve, 1)) // this ensures our test finishes after the provider requests net_version
    })
  })

  describe('success', () => {
    afterEach(() => {
      nock.cleanAll()
    })

    it('should return the JSON value', async () => {
      expect.assertions(1)

      nock.netVersionAndYield(1984)
      nock.netVersionAndYield(1984)

      const provider = new FetchJsonProvider(endpoint)
      const value = await provider.send('net_version', [])

      expect(value).toBe(1984)
      await new Promise(resolve => setTimeout(resolve, 1)) // this ensures our test finishes after the provider requests net_version
    })

    it('should emit a debug event', async () => {
      expect.assertions(1)

      nock.netVersionAndYield(1984)
      nock.netVersionAndYield(1984)

      const provider = new FetchJsonProvider(endpoint)
      provider.emit = jest.fn()
      await provider.send('net_version', [])
      await new Promise(resolve => setTimeout(resolve, 1)) // this ensures our test finishes after the provider requests net_version
      expect(provider.emit).toHaveBeenCalledWith(
        'debug',
        expect.objectContaining({
          action: 'send',
          request: {
            method: 'net_version',
            params: [],
            id: expect.any(Number),
            jsonrpc: '2.0',
          },
          response: 1984,
          provider,
        })
      )
    })
  })
})
