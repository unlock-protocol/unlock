import { storeTransactionFor } from '../../../data-iframe/locksmith-helpers'
import { TransactionDefaults } from '../../../data-iframe/blockchainHandler/blockChainTypes'

const makeMockFetch = (mockJSON: any = {}) => {
  const g = global as any

  const mockJSONPromise = Promise.resolve(mockJSON)
  const mockFetchPromise = Promise.resolve({
    json: () => mockJSONPromise,
  })

  const mockFetch = jest.fn().mockImplementation(() => mockFetchPromise)
  // eslint-disable-next-line no-console
  const originalLog = console.log
  const mockLog = jest.fn()
  g.fetch = mockFetch
  g.console.log = mockLog

  const cleanup = () => {
    g.fetch.mockClear()
    g.console.log.mockClear()
    g.console.log = originalLog
    delete g.fetch
  }

  return {
    mockFetch,
    mockLog,
    cleanup,
  }
}

const expectedTransaction: TransactionDefaults = {
  createdAt: expect.any(Date),
  hash: '0xdeadb33f',
  to: '0xbadc0ffee',
  from: '0xdef33d',
  for: '0xdef33d',
  input: null,
}

const accountAddress = '0xACCOUNTADDRESS'
const networkId = 4

describe('storeTransactionFor', () => {
  it('should call window.fetch with the right URL', async () => {
    expect.assertions(1)

    const { mockFetch, cleanup } = makeMockFetch()

    await storeTransactionFor(accountAddress, networkId, expectedTransaction)

    expect(mockFetch).toHaveBeenCalledWith('http://0.0.0.0:8080/transaction', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body:
        '{"transactionHash":"0xdeadb33f","sender":"0xACCOUNTADDRESS","for":"0xACCOUNTADDRESS","recipient":"0xbadc0ffee","data":null,"chain":4}',
    })

    cleanup()
  })

  it('should log an error if the request fails', async () => {
    expect.assertions(1)

    const { mockFetch, mockLog, cleanup } = makeMockFetch()
    mockFetch.mockRejectedValue('fail')

    await storeTransactionFor(accountAddress, networkId, expectedTransaction)

    expect(mockLog).toHaveBeenCalledWith(
      'unable to save key purchase transaction'
    )

    cleanup()
  })
})
