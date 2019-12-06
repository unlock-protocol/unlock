import {
  makeLockFilter,
  transformLocksmithTransaction,
  getTransactionsFor,
} from '../../../data-iframe/locksmith-helpers/getTransactionsFor'
import {
  LocksmithTransactionsResult,
  TransactionDefaults,
} from '../../../data-iframe/blockchainHandler/blockChainTypes'
import { TransactionStatus, TransactionType } from '../../../unlockTypes'

const makeMockFetch = (mockJSON: any = {}) => {
  const g = global as any

  const mockJSONPromise = Promise.resolve(mockJSON)
  const mockFetchPromise = Promise.resolve({
    json: () => mockJSONPromise,
  })

  const mockFetch = jest.fn().mockImplementation(() => mockFetchPromise)
  g.fetch = mockFetch

  const cleanup = () => {
    g.fetch.mockClear()
    delete g.fetch
  }

  return {
    mockFetch,
    cleanup,
  }
}

const locksmithTransaction: LocksmithTransactionsResult = {
  createdAt: new Date().toDateString(),
  transactionHash: '0xdeadb33f',
  chain: 4,
  recipient: '0xbadc0ffee',
  data: null,
  sender: '0xdef33d',
  for: '0xdef33d',
}

const expectedTransaction: TransactionDefaults = {
  createdAt: expect.any(Date),
  hash: '0xdeadb33f',
  to: '0xbadc0ffee',
  from: '0xdef33d',
  for: '0xdef33d',
  input: null,
  blockNumber: Number.MAX_SAFE_INTEGER,
  confirmations: 0,
  status: TransactionStatus.SUBMITTED,
  type: TransactionType.KEY_PURCHASE,
}

describe('getTransactionsFor - makeLockFilter', () => {
  it('should return empty string for empty input', () => {
    expect.assertions(1)

    expect(makeLockFilter([])).toEqual('')
  })

  it('should return a simple query string for input with one address', () => {
    expect.assertions(1)

    expect(makeLockFilter(['0xdeadb33f'])).toEqual('recipient[]=0xdeadb33f')
  })

  it('should return a compound query string for input with several addresses', () => {
    expect.assertions(1)

    expect(makeLockFilter(['0xdeadb33f', '0xbadc0ffee'])).toEqual(
      'recipient[]=0xdeadb33f&recipient[]=0xbadc0ffee'
    )
  })
})

describe('getTransactionsFor - transformLocksmithTransaction', () => {
  it('should take a transaction from locksmith and turn it into a TransactionDefaults', () => {
    expect.assertions(1)

    expect(transformLocksmithTransaction(locksmithTransaction)).toEqual(
      expectedTransaction
    )
  })
})

describe('getTransactionsFor', () => {
  it('should call window.fetch with the right URL', async () => {
    expect.assertions(1)

    const { mockFetch, cleanup } = makeMockFetch()

    await getTransactionsFor(
      '0xACCOUNTADDRESS',
      ['0xLOCKADDRESS1', '0xLOCKADDRESS2'],
      'http://locksmith'
    )

    expect(mockFetch).toHaveBeenCalledWith(
      'http://locksmith/transactions?for=0xACCOUNTADDRESS&recipient[]=0xLOCKADDRESS1&recipient[]=0xLOCKADDRESS2'
    )

    cleanup()
  })

  it('should return empty array if there is no transactions property in response', async () => {
    expect.assertions(1)

    const { cleanup } = makeMockFetch()

    const result = await getTransactionsFor(
      '0xACCOUNTADDRESS',
      ['0xLOCKADDRESS1', '0xLOCKADDRESS2'],
      'http://locksmith'
    )
    expect(result).toEqual([])

    cleanup()
  })

  it('should return a collection of TransactionDefaults based on the transactions in the response', async () => {
    expect.assertions(1)

    const mockJson = {
      transactions: [locksmithTransaction],
    }

    const { cleanup } = makeMockFetch(mockJson)

    const result = await getTransactionsFor(
      '0xACCOUNTADDRESS',
      ['0xLOCKADDRESS1', '0xLOCKADDRESS2'],
      'http://locksmith'
    )
    expect(result).toEqual([expectedTransaction])

    cleanup()
  })
})
