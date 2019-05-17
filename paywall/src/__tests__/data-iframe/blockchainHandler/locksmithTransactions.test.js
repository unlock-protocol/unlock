import ensureWalletReady from '../../../data-iframe/blockchainHandler/ensureWalletReady'
import locksmithTransactions from '../../../data-iframe/blockchainHandler/locksmithTransactions'
import { setAccount } from '../../../data-iframe/blockchainHandler/account'
import { setNetwork } from '../../../data-iframe/blockchainHandler/network'

jest.mock('../../../data-iframe/blockchainHandler/ensureWalletReady', () =>
  jest.fn().mockResolvedValue()
)

describe('locksmithTransactions - retrieving existing transactions', () => {
  let fakeWindow
  let fakeWeb3Service
  let fetchedResult
  const fakeWalletService = {}

  beforeEach(() => {
    setAccount('account')
    setNetwork(1)
    fetchedResult = {}
    fakeWindow = {
      fetch: jest
        .fn()
        .mockResolvedValue({ json: () => Promise.resolve(fetchedResult) }),
    }
    fakeWeb3Service = {
      getTransaction: jest.fn(hash => Promise.resolve({ hash })),
    }
  })

  it('ensures wallet is ready', async () => {
    expect.assertions(1)

    await locksmithTransactions(
      fakeWindow,
      'host',
      fakeWeb3Service,
      fakeWalletService
    )

    expect(ensureWalletReady).toHaveBeenCalledWith(fakeWalletService)
  })

  it('calls fetch with the correct url', async () => {
    expect.assertions(1)

    await locksmithTransactions(
      fakeWindow,
      'host',
      fakeWeb3Service,
      fakeWalletService
    )

    expect(fakeWindow.fetch).toHaveBeenCalledWith(
      'host/transactions?sender=account'
    )
  })

  it('returns an empty {} if there are no transactions for that user', async () => {
    expect.assertions(1)

    const result = await locksmithTransactions(
      fakeWindow,
      'host',
      fakeWeb3Service,
      fakeWalletService
    )

    expect(result).toEqual({})
  })

  it('returns the transactions for that user', async () => {
    expect.assertions(1)

    fetchedResult = {
      data: {
        transactions: [
          {
            transactionHash: 'hash1',
            chain: 2,
            to: 'lock 1',
            from: 'account',
          },
          {
            transactionHash: 'hash2',
            chain: 1,
            to: 'lock 2',
            from: 'account',
          },
        ],
      },
    }

    const result = await locksmithTransactions(
      fakeWindow,
      'host',
      fakeWeb3Service,
      fakeWalletService
    )

    expect(result).toEqual({
      hash2: {
        hash: 'hash2',
      },
    })
  })

  it('calls web3Service.getTransaction for each transaction returned', async () => {
    expect.assertions(2)

    fetchedResult = {
      data: {
        transactions: [
          {
            transactionHash: 'hash1',
            chain: 2,
            to: 'lock 1',
            from: 'account',
          },
          {
            transactionHash: 'hash2',
            chain: 1,
            to: 'lock 2',
            from: 'account',
          },
          {
            transactionHash: 'hash3',
            chain: 1,
            to: 'lock 3',
            from: 'account',
          },
        ],
      },
    }

    await locksmithTransactions(
      fakeWindow,
      'host',
      fakeWeb3Service,
      fakeWalletService
    )

    expect(fakeWeb3Service.getTransaction).toHaveBeenNthCalledWith(1, 'hash2')
    expect(fakeWeb3Service.getTransaction).toHaveBeenNthCalledWith(2, 'hash3')
  })
})
