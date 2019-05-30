import { WalletService, Web3Service } from '@unlock-protocol/unlock-js'
import {
  setupWalletService,
  setupWeb3Service,
  listenForAccountNetworkChanges,
  retrieveChainData,
  getSetConfigCallback,
} from '../../../data-iframe/blockchainHandler'
import {
  pollForAccountChange,
  setAccount,
  getAccount,
  setAccountBalance,
} from '../../../data-iframe/blockchainHandler/account'
import {
  getNetwork,
  setNetwork,
} from '../../../data-iframe/blockchainHandler/network'
import ensureWalletReady from '../../../data-iframe/blockchainHandler/ensureWalletReady'
import { TRANSACTION_TYPES } from '../../../constants'
import { processKeyPurchaseTransactions } from '../../../data-iframe/blockchainHandler/purchaseKey'

jest.mock('../../../data-iframe/blockchainHandler/ensureWalletReady')
jest.mock('../../../data-iframe/blockchainHandler/account')
jest.mock('../../../data-iframe/blockchainHandler/purchaseKey')

describe('blockchain handler index', () => {
  describe('setupWalletService', () => {
    it('connects to the provider and returns a walletService', done => {
      expect.assertions(1)

      const fakeProvider = {
        send() {
          // this implicitly tests that our provider is
          // passed to walletService.connect()
          done()
        },
      }

      const walletService = setupWalletService({
        unlockAddress: '0x1234567890123456789012345678901234567890',
        provider: fakeProvider,
      })

      expect(walletService).toBeInstanceOf(WalletService)
    })

    it('should retrieve account after connecting', done => {
      expect.assertions(1)

      const fakeProvider = {
        send({ method }, callback) {
          if (method === 'net_version') return callback(null, 1)
          // this proves we retrieve the account
          expect(method).toBe('eth_accounts')
          done()
        },
      }

      setupWalletService({
        unlockAddress: '0x1234567890123456789012345678901234567890',
        provider: fakeProvider,
      })
    })
  })

  describe('setupWeb3Service', () => {
    it('creates a web3Service', () => {
      expect.assertions(1)

      const web3Service = setupWeb3Service({
        unlockAddress: '0x1234567890123456789012345678901234567890',
        readOnlyProvider: 'http://localhost:8545',
        blockTime: 123,
        requiredConfirmations: 1,
      })

      expect(web3Service).toBeInstanceOf(Web3Service)
    })
  })
  describe('retrieveChainData', () => {
    let fakeWalletService
    let fakeWeb3Service
    let onChange
    let fakeWindow
    let fakeTransactions
    let fakeTransactionResults

    beforeEach(() => {
      onChange = jest.fn()
      fakeTransactions = {}
      fakeTransactionResults = {}
      getAccount.mockImplementation(() => 'account')
      fakeWalletService = {
        ready: true,
        handlers: {},
        addListener: (type, cb) => (fakeWalletService.handlers[type] = cb),
        removeListener: type => delete fakeWalletService.handlers[type],
        on: (type, cb) => (fakeWalletService.handlers[type] = cb),
        once: (type, cb) => (fakeWalletService.handlers[type] = cb),
        off: type => delete fakeWalletService.handlers[type],
      }
      fakeWeb3Service = {
        getLock: jest.fn(address => ({ address })),
        getKeyByLockForOwner: jest.fn((lock, owner) => ({
          id: `${lock}-${owner}`,
          lock,
          owner,
          expiration: new Date().getTime() / 1000 + 1000,
        })),
        getTransaction: jest.fn(hash => fakeTransactionResults[hash]),
      }
      fakeWindow = {
        fetch: jest.fn(() => ({
          json: () => fakeTransactions,
        })),
      }
      pollForAccountChange.mockReset()
    })

    // this calls retrieveChainData, so we will test it
    // as a sub-category to take advantage of the mocking
    describe('getSetConfigCallback', () => {
      it('returns a callback', async () => {
        expect.assertions(1)

        expect(
          getSetConfigCallback({
            web3Service: fakeWeb3Service,
            walletService: fakeWalletService,
            window: fakeWindow,
            locksmithHost: 'http://locksmith',
            onChange,
            requiredConfirmations: 1,
          })
        ).toBeInstanceOf(Function)
      })

      it('callback retrieves chain data', async () => {
        expect.assertions(3)

        await getSetConfigCallback({
          web3Service: fakeWeb3Service,
          walletService: fakeWalletService,
          window: fakeWindow,
          locksmithHost: 'http://locksmith',
          onChange,
          requiredConfirmations: 1,
        })({
          locks: {
            '0x123': { name: 'hi' },
            '0x456': { name: 'bye' },
          },
        })

        expect(fakeWeb3Service.getLock).toHaveBeenCalledTimes(2)
        expect(fakeWeb3Service.getLock).toHaveBeenNthCalledWith(1, '0x123')
        expect(fakeWeb3Service.getLock).toHaveBeenNthCalledWith(2, '0x456')
      })
    })

    it('calls getLocks', async () => {
      expect.assertions(3)

      await retrieveChainData({
        locksToRetrieve: ['0x123', '0x456'],
        web3Service: fakeWeb3Service,
        walletService: fakeWalletService,
        window: fakeWindow,
        locksmithHost: 'http://locksmith',
        onChange,
        requiredConfirmations: 1,
      })

      expect(fakeWeb3Service.getLock).toHaveBeenCalledTimes(2)
      expect(fakeWeb3Service.getLock).toHaveBeenNthCalledWith(1, '0x123')
      expect(fakeWeb3Service.getLock).toHaveBeenNthCalledWith(2, '0x456')
    })

    it('should ensure the wallet is ready after sending locks', async () => {
      expect.assertions(2)

      await retrieveChainData({
        locksToRetrieve: ['0x123', '0x456'],
        web3Service: fakeWeb3Service,
        walletService: fakeWalletService,
        window: fakeWindow,
        locksmithHost: 'http://locksmith',
        onChange,
        requiredConfirmations: 1,
      })

      expect(onChange).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          locks: {
            '0x123': { address: '0x123' },
            '0x456': { address: '0x456' },
          },
        })
      )
      expect(ensureWalletReady).toHaveBeenCalled()
    })

    it('calls getKeys', async () => {
      expect.assertions(3)

      await retrieveChainData({
        locksToRetrieve: ['0x123', '0x456'],
        web3Service: fakeWeb3Service,
        walletService: fakeWalletService,
        window: fakeWindow,
        locksmithHost: 'http://locksmith',
        onChange,
        requiredConfirmations: 1,
      })

      expect(fakeWeb3Service.getKeyByLockForOwner).toHaveBeenCalledTimes(2)
      expect(fakeWeb3Service.getKeyByLockForOwner).toHaveBeenNthCalledWith(
        1,
        '0x123',
        'account'
      )
      expect(fakeWeb3Service.getKeyByLockForOwner).toHaveBeenNthCalledWith(
        2,
        '0x456',
        'account'
      )
    })

    it('calls getTransactions', async () => {
      expect.assertions(1)

      await retrieveChainData({
        locksToRetrieve: ['0x123', '0x456'],
        web3Service: fakeWeb3Service,
        walletService: fakeWalletService,
        window: fakeWindow,
        locksmithHost: 'http://locksmith',
        onChange,
        requiredConfirmations: 1,
      })

      expect(fakeWindow.fetch).toHaveBeenCalledWith(
        'http://locksmith/transactions?sender=account'
      )
    })

    it('processes key purchase transactions and ignores others', async () => {
      expect.assertions(1)

      const purchase = require.requireActual(
        '../../../data-iframe/blockchainHandler/purchaseKey'
      )
      processKeyPurchaseTransactions.mockImplementationOnce(
        purchase.processKeyPurchaseTransactions
      )
      setNetwork(2)
      fakeTransactions = {
        data: {
          transactions: [
            {
              transactionHash: 'hash',
              chain: 2,
              recipient: 'not a key purchase',
              sender: 'account',
            },
            {
              transactionHash: 'hash2',
              chain: 2,
              recipient: '0x123',
              sender: 'account',
            },
          ],
        },
      }

      fakeTransactionResults = {
        hash2: {
          hash: 'hash',
          type: TRANSACTION_TYPES.LOCK_CREATION,
        },
        hash: {
          hash: 'hash2',
          type: TRANSACTION_TYPES.KEY_PURCHASE,
          key: '0x123-account',
          lock: '0x123',
          status: 'mined',
          confirmations: 1235,
        },
      }

      fakeWalletService.addListener = jest.fn()
      fakeWalletService.removeListener = jest.fn()

      await retrieveChainData({
        locksToRetrieve: ['0x123', '0x456'],
        web3Service: fakeWeb3Service,
        walletService: fakeWalletService,
        window: fakeWindow,
        locksmithHost: 'http://locksmith',
        onChange,
        requiredConfirmations: 1,
      })

      expect(processKeyPurchaseTransactions).toHaveBeenCalledTimes(1)
    })

    it('processes key purchase transactions successfully', async done => {
      expect.assertions(1)
      const purchase = require.requireActual(
        '../../../data-iframe/blockchainHandler/purchaseKey'
      )
      processKeyPurchaseTransactions.mockImplementationOnce(
        purchase.processKeyPurchaseTransactions
      )

      setNetwork(2)
      fakeTransactions = {
        data: {
          transactions: [
            {
              transactionHash: 'hash',
              chain: 2,
              recipient: 'not a key purchase',
              sender: 'account',
            },
            {
              transactionHash: 'hash2',
              chain: 2,
              recipient: '0x123',
              sender: 'account',
            },
          ],
        },
      }

      fakeTransactionResults = {
        hash: {
          hash: 'hash',
          type: TRANSACTION_TYPES.LOCK_CREATION,
        },
        hash2: {
          hash: 'hash2',
          type: TRANSACTION_TYPES.KEY_PURCHASE,
          key: '0x123-account',
          lock: '0x123',
          status: 'pending',
          confirmations: 0,
        },
      }

      fakeWalletService.addListener = jest.fn()
      fakeWalletService.removeListener = type => {
        // this is the last line of the key processor. if we call it
        // properly, this will pass
        expect(type).toBe('transaction.pending')
        done()
      }

      await retrieveChainData({
        locksToRetrieve: ['0x123', '0x456'],
        web3Service: fakeWeb3Service,
        walletService: fakeWalletService,
        window: fakeWindow,
        locksmithHost: 'http://locksmith',
        onChange,
        requiredConfirmations: 1,
      })
    })

    it('passes walletModal to onChange', async done => {
      expect.assertions(1)
      const purchase = require.requireActual(
        '../../../data-iframe/blockchainHandler/purchaseKey'
      )
      processKeyPurchaseTransactions.mockImplementationOnce(
        purchase.processKeyPurchaseTransactions
      )

      setNetwork(2)
      fakeTransactions = {
        data: {
          transactions: [
            {
              transactionHash: 'hash',
              chain: 2,
              recipient: '0x123',
              sender: 'account',
            },
          ],
        },
      }

      fakeTransactionResults = {
        hash: {
          hash: 'hash',
          to: 'lock',
          from: 'key',
          type: TRANSACTION_TYPES.KEY_PURCHASE,
          key: '0x123-account',
          lock: '0x123',
          status: 'mined',
          confirmations: 1563472,
        },
      }

      fakeWeb3Service.getKeyByLockForOwner = jest.fn((lock, owner) => ({
        id: `${lock}-${owner}`,
        lock,
        owner,
        expiration: 0,
      }))

      // the first call is locks
      // second is walletModal
      onChange = info => {
        if (info.locks) return
        expect(info).toEqual({ walletModal: true })
        done()
      }

      await retrieveChainData({
        locksToRetrieve: ['0x123'],
        web3Service: fakeWeb3Service,
        walletService: fakeWalletService,
        window: fakeWindow,
        locksmithHost: 'http://locksmith',
        onChange,
        requiredConfirmations: 1,
      })

      await new Promise(resolve => {
        setInterval(() => {
          if (fakeWalletService.handlers['transaction.pending']) resolve()
        })
      })
      // this will trigger the async onChange handler
      fakeWalletService.handlers['transaction.pending'](
        TRANSACTION_TYPES.KEY_PURCHASE
      )
    })

    it('passes transaction updates to onChange', async done => {
      expect.assertions(1)
      const purchase = require.requireActual(
        '../../../data-iframe/blockchainHandler/purchaseKey'
      )
      processKeyPurchaseTransactions.mockImplementationOnce(
        purchase.processKeyPurchaseTransactions
      )

      setNetwork(2)
      fakeTransactions = {
        data: {
          transactions: [
            {
              transactionHash: 'hash',
              chain: 2,
              recipient: '0x123',
              sender: 'account',
            },
          ],
        },
      }

      fakeTransactionResults = {
        hash: {
          hash: 'hash',
          to: '0x123',
          from: 'key',
          type: TRANSACTION_TYPES.KEY_PURCHASE,
          key: '0x123-account',
          lock: '0x123',
          status: 'mined',
          confirmations: 1563472,
        },
      }

      fakeWeb3Service.getKeyByLockForOwner = jest.fn((lock, owner) => ({
        id: `${lock}-${owner}`,
        lock,
        owner,
        expiration: 0,
      }))

      onChange = info => {
        // the first call is to send locks from getLocks
        if (info.locks) return
        expect(info).toEqual({
          transaction: {
            hash: 'hash2',
            blockNumber: Number.MAX_SAFE_INTEGER,
            confirmations: 0,
            from: 'account',
            to: 'lock',
            input: 'input',
            key: 'lock-account',
            lock: 'lock',
            network: 2,
            status: 'submitted',
            type: TRANSACTION_TYPES.KEY_PURCHASE,
          },
          key: {
            id: '0x123-account',
            lock: '0x123',
            owner: 'account',
            expiration: 0,
          },
        })
        done()
      }

      await retrieveChainData({
        locksToRetrieve: ['0x123'],
        web3Service: fakeWeb3Service,
        walletService: fakeWalletService,
        window: fakeWindow,
        locksmithHost: 'http://locksmith',
        onChange,
        requiredConfirmations: 1,
      })

      await new Promise(resolve => {
        setInterval(() => {
          if (fakeWalletService.handlers['transaction.new']) resolve()
        })
      })

      // this will trigger the async onChange handler
      fakeWalletService.handlers['transaction.new'](
        'hash2' /* transaction hash */,
        'account' /* from */,
        'lock' /* to */,
        'input' /* input */,
        TRANSACTION_TYPES.KEY_PURCHASE /* type */,
        'submitted' /* status */
      )
    })

    it('passes errors to onChange', async done => {
      expect.assertions(1)
      const purchase = require.requireActual(
        '../../../data-iframe/blockchainHandler/purchaseKey'
      )
      processKeyPurchaseTransactions.mockImplementationOnce(
        purchase.processKeyPurchaseTransactions
      )

      setNetwork(2)
      fakeTransactions = {
        data: {
          transactions: [
            {
              transactionHash: 'hash',
              chain: 2,
              recipient: '0x123',
              sender: 'account',
            },
          ],
        },
      }

      fakeTransactionResults = {
        hash: {
          hash: 'hash',
          to: 'lock',
          from: 'key',
          type: TRANSACTION_TYPES.KEY_PURCHASE,
          key: '0x123-account',
          lock: '0x123',
          status: 'mined',
          confirmations: 1563472,
        },
      }

      fakeWeb3Service.getKeyByLockForOwner = jest.fn((lock, owner) => ({
        id: `${lock}-${owner}`,
        lock,
        owner,
        expiration: 0,
      }))

      fakeWalletService.addListener = jest.fn()
      fakeWalletService.removeListener = jest.fn()
      const error = new Error('fail')
      onChange = info => {
        // the first call is to pass the locks
        if (info.locks) return
        expect(info).toEqual({ error })
        done()
      }

      await retrieveChainData({
        locksToRetrieve: ['0x123'],
        web3Service: fakeWeb3Service,
        walletService: fakeWalletService,
        window: fakeWindow,
        locksmithHost: 'http://locksmith',
        onChange,
        requiredConfirmations: 1,
      })

      await new Promise(resolve => {
        setInterval(() => {
          if (fakeWalletService.handlers.error) resolve()
        })
      })
      // this will trigger the async onChange handler
      fakeWalletService.handlers.error(error)
    })
  })

  describe('listenForAccountNetworkChanges', () => {
    let fakeWalletService
    let fakeWeb3Service

    beforeEach(() => {
      fakeWalletService = {
        on: jest.fn(),
        ready: true,
        getAccount: jest.fn(() => 'account'),
      }
      fakeWeb3Service = {
        on: jest.fn(),
        getAddressBalance: jest.fn(() => '123'),
      }
      pollForAccountChange.mockReset()
    })

    it('listens for network.changed', async () => {
      expect.assertions(1)

      fakeWalletService.on = type => {
        if (type !== 'network.changed') return
        expect(type).toBe('network.changed')
      }

      await listenForAccountNetworkChanges({
        walletService: fakeWalletService,
        web3Service: fakeWeb3Service,
        onChange: () => {},
      })
    })

    it('listens for account.changed', async () => {
      expect.assertions(1)

      fakeWalletService.on = type => {
        if (type !== 'account.changed') return
        expect(type).toBe('account.changed')
      }

      await listenForAccountNetworkChanges({
        walletService: fakeWalletService,
        web3Service: fakeWeb3Service,
        onChange: () => {},
      })
    })

    it('calls onChange if network changes, and sets the local network cache', async () => {
      expect.assertions(2)

      let changeNetworkCallback
      const onChange = jest.fn()
      fakeWalletService.on = (_, changeNetwork) => {
        changeNetworkCallback = changeNetwork
      }

      await listenForAccountNetworkChanges({
        walletService: fakeWalletService,
        web3Service: fakeWeb3Service,
        onChange,
      })

      changeNetworkCallback(321)
      expect(getNetwork()).toBe(321)
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ network: 321 })
      )
    })

    it('ensures walletService is ready', async () => {
      expect.assertions(1)
      fakeWalletService.getAccount = () => {
        expect(ensureWalletReady).toHaveBeenCalled()
      }

      await listenForAccountNetworkChanges({
        walletService: fakeWalletService,
        web3Service: fakeWeb3Service,
        onChange: () => {},
      })
    })

    it('retrieves and saves user account', async () => {
      expect.assertions(2)
      const onChange = jest.fn()

      await listenForAccountNetworkChanges({
        walletService: fakeWalletService,
        web3Service: fakeWeb3Service,
        onChange,
      })

      expect(onChange).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ account: 'account' })
      )
      expect(setAccount).toHaveBeenCalledWith('account')
    })

    it('retrieves and saves user account balance', async () => {
      expect.assertions(2)
      const onChange = jest.fn()

      await listenForAccountNetworkChanges({
        walletService: fakeWalletService,
        web3Service: fakeWeb3Service,
        onChange,
      })

      expect(onChange).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ balance: '123' })
      )
      expect(setAccountBalance).toHaveBeenCalledWith('123')
    })

    it('polls for changes to user account and balance', async () => {
      expect.assertions(5)
      const onChange = jest.fn()

      await listenForAccountNetworkChanges({
        walletService: fakeWalletService,
        web3Service: fakeWeb3Service,
        onChange,
      })

      expect(pollForAccountChange).toHaveBeenCalledWith(
        fakeWalletService,
        fakeWeb3Service,
        expect.any(Function)
      )
      const accountChanged = pollForAccountChange.mock.calls[0][2]

      onChange.mockReset()
      setAccount.mockReset()
      setAccountBalance.mockReset()

      accountChanged('hi', '1')

      expect(setAccount).toHaveBeenCalledWith('hi')
      expect(setAccountBalance).toHaveBeenCalledWith('1')
      expect(onChange).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ account: 'hi' })
      )
      expect(onChange).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ balance: '1' })
      )
    })
  })
})
