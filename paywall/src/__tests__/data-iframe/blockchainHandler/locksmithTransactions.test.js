import ensureWalletReady from '../../../data-iframe/blockchainHandler/ensureWalletReady'
import locksmithTransactions, {
  storeTransaction,
} from '../../../data-iframe/blockchainHandler/locksmithTransactions'
import { setAccount } from '../../../data-iframe/blockchainHandler/account'
import { setNetwork } from '../../../data-iframe/blockchainHandler/network'
import { setPaywallConfig } from '../../../data-iframe/paywallConfig'

jest.mock('../../../data-iframe/blockchainHandler/ensureWalletReady', () =>
  jest.fn().mockResolvedValue()
)

describe('locksmithTransactions - retrieving existing transactions', () => {
  let fakeWindow
  let fakeWeb3Service
  let fetchedResult
  const fakeWalletService = {}

  describe('storeTransaction', () => {
    beforeEach(() => {
      setAccount('account')
      setNetwork(1)
      fetchedResult = {}
      fakeWindow = {
        fetch: jest.fn(),
      }
      fakeWeb3Service = {}
    })

    it('should POST the transaction to locksmith', async () => {
      expect.assertions(1)

      const transaction = {
        hash: 'hi',
        lock: 'HI',
        input: 'input',
      }

      await storeTransaction({
        window: fakeWindow,
        transaction,
        locksmithHost: 'http://example.com',
        walletService: {
          ready: true,
        },
      })

      expect(fakeWindow.fetch).toHaveBeenCalledWith(
        'http://example.com/transaction',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
          mode: 'cors',
          body: JSON.stringify({
            transactionHash: 'hi',
            sender: 'account',
            for: 'account',
            recipient: 'HI',
            data: 'input',
            chain: 1,
          }),
        })
      )
    })
  })

  describe('locksmithTransactions', () => {
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

      setPaywallConfig({
        locks: {
          'lock 1': {
            name: 'lock 1',
          },
          'lock 2': {
            name: 'lock 2',
          },
        },
      })
    })

    it('ensures wallet is ready', async () => {
      expect.assertions(1)

      await locksmithTransactions({
        window: fakeWindow,
        locksmithHost: 'host',
        web3Service: fakeWeb3Service,
        walletService: fakeWalletService,
      })

      expect(ensureWalletReady).toHaveBeenCalledWith(fakeWalletService)
    })

    it('calls fetch with the correct url and filter', async () => {
      expect.assertions(2)

      setPaywallConfig({
        locks: {
          'lock 1': {
            name: 'lock 1',
          },
          'lock 2': {
            name: 'lock 2',
          },
        },
      })

      await locksmithTransactions({
        window: fakeWindow,
        locksmithHost: 'host',
        web3Service: fakeWeb3Service,
        walletService: fakeWalletService,
      })

      expect(fakeWindow.fetch).toHaveBeenCalledWith(
        'host/transactions?for=account&recipient[]=lock%201&recipient[]=lock%202'
      )

      setPaywallConfig({
        locks: {
          'lock 1': {
            name: 'lock 1',
          },
        },
      })

      await locksmithTransactions({
        window: fakeWindow,
        locksmithHost: 'host',
        web3Service: fakeWeb3Service,
        walletService: fakeWalletService,
      })

      expect(fakeWindow.fetch).toHaveBeenCalledWith(
        'host/transactions?for=account&recipient[]=lock%201'
      )
    })

    it('calls web3Service.getTransaction for each transaction returned', async () => {
      expect.assertions(2)

      fetchedResult = {
        transactions: [
          {
            // this transaction is skipped because it is for a different chain
            transactionHash: 'hash1',
            chain: 2,
            recipient: 'lock 1',
            sender: 'account',
            for: 'account',
            data: null,
          },
          {
            transactionHash: 'hash2',
            chain: 1,
            recipient: 'lock 2',
            // verify that purchases on behalf of the account holder work too
            sender: 'another account',
            for: 'account',
            data: 'data 2',
          },
          {
            transactionHash: 'hash3',
            chain: 1,
            recipient: 'lock 3',
            sender: 'account',
            for: 'account',
            data: null,
          },
        ],
      }

      await locksmithTransactions({
        window: fakeWindow,
        locksmithHost: 'host',
        web3Service: fakeWeb3Service,
        walletService: fakeWalletService,
      })

      expect(fakeWeb3Service.getTransaction).toHaveBeenNthCalledWith(
        1,
        'hash2',
        expect.objectContaining({
          to: 'lock 2',
          from: 'another account',
          for: 'account',
          input: 'data 2',
          network: 1,
          hash: 'hash2',
        })
      )
      expect(fakeWeb3Service.getTransaction).toHaveBeenNthCalledWith(
        2,
        'hash3',
        undefined
      )
    })
  })
})
