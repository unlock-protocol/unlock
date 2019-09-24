import { providers } from 'ethers'
import FetchJsonProvider from '../FetchJsonProvider'

jest.mock('ethers')

const url = 'providerUrl'
const method = 'method'
const params = []

describe('FetchJsonProvider', () => {
  beforeEach(() => {
    providers.JsonRpcProvider.prototype.send.call = jest.fn()
  })

  it('should return the response from JsonRpcProvider if successful', async () => {
    expect.assertions(2)
    const provider = new FetchJsonProvider(url)

    providers.JsonRpcProvider.prototype.send.call = jest.fn(() =>
      Promise.resolve('response')
    )
    const response = await provider.send(method, params)
    expect(providers.JsonRpcProvider.prototype.send.call).toHaveBeenCalledWith(
      provider,
      method,
      params
    )
    expect(response).toEqual('response')
  })

  describe('if JsonRpcProvider failed', () => {
    it('should retry if the error is 429 and there has not been too many retries', async () => {
      expect.assertions(2)
      const provider = new FetchJsonProvider(url, 1, 3)
      let callCounter = 0
      providers.JsonRpcProvider.prototype.send.call = jest.fn(() => {
        callCounter += 1
        if (callCounter === 3) {
          return Promise.resolve('response')
        } else {
          return Promise.reject({
            statusCode: 429,
          })
        }
      })
      const response = await provider.send(method, params)
      expect(response).toEqual('response')
      expect(callCounter).toEqual(3)
    })

    it('should throw and not retry if the error is not 429', async () => {
      expect.assertions(1)
      const error = {
        statusCode: 404,
      }
      const provider = new FetchJsonProvider(url, 1, 3)
      providers.JsonRpcProvider.prototype.send.call = jest.fn(() => {
        return Promise.reject(error)
      })
      try {
        await provider.send(method, params)
      } catch (e) {
        expect(e).toEqual(error)
      }
    })

    it('should retry if the error is 429 and there has been too many retries', async () => {
      expect.assertions(2)
      const provider = new FetchJsonProvider(url, 1, 3)
      let callCounter = 0
      providers.JsonRpcProvider.prototype.send.call = jest.fn(() => {
        callCounter += 1
        return Promise.reject({
          statusCode: 429,
        })
      })
      try {
        await provider.send(method, params)
      } catch (e) {
        expect(e.statusCode).toEqual(429)
      }
      expect(callCounter).toEqual(3)
    })
  })
})
