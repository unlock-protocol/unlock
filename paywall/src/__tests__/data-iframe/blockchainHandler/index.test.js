import { WalletService, Web3Service } from '@unlock-protocol/unlock-js'
import {
  setupWalletService,
  setupWeb3Service,
  listenForAccountNetworkChanges,
  retrieveChainData,
} from '../../../data-iframe/blockchainHandler'
import {
  pollForAccountChange,
  setAccount,
  getAccount,
  setAccountBalance,
} from '../../../data-iframe/blockchainHandler/account'
import { getNetwork } from '../../../data-iframe/blockchainHandler/network'
import ensureWalletReady from '../../../data-iframe/blockchainHandler/ensureWalletReady'
import web3ServiceHub from '../../../data-iframe/blockchainHandler/web3ServiceHub'
import { setPaywallConfig } from '../../../data-iframe/paywallConfig'

jest.mock('../../../data-iframe/blockchainHandler/ensureWalletReady')
jest.mock('../../../data-iframe/blockchainHandler/account')
jest.mock('../../../data-iframe/blockchainHandler/web3ServiceHub')

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

    it('should reset account if provider is not present or connection fails', done => {
      expect.assertions(2)

      const error = new Error('fail')
      const onChange = params => {
        expect(params).toEqual({
          error,
          account: null,
        })
        done()
      }

      const fakeProvider = {
        send(_, callback) {
          callback(error)
        },
      }

      const walletService = setupWalletService({
        unlockAddress: '0x1234567890123456789012345678901234567890',
        provider: fakeProvider,
        onChange,
      })

      expect(walletService).toBeInstanceOf(WalletService)
    })
  })

  describe('setupWeb3Service', () => {
    beforeEach(() => {
      web3ServiceHub.mockReset()
    })

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

    it('should call web3ServiceHub', () => {
      expect.assertions(1)

      const onChange = jest.fn()
      const web3Service = setupWeb3Service({
        unlockAddress: '0x1234567890123456789012345678901234567890',
        readOnlyProvider: 'http://localhost:8545',
        blockTime: 123,
        requiredConfirmations: 1,
        window: 'window',
        locksmithHost: 'http://example.com',
        onChange,
      })

      expect(web3ServiceHub).toHaveBeenCalledWith(
        expect.objectContaining({
          window: 'window',
          web3Service,
          onChange,
        })
      )
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
      setPaywallConfig({
        locks: {
          '0x123': { name: 'hi' },
        },
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
        'http://locksmith/transactions?sender=account&recipient[]=0x123'
      )
    })
  })

  describe('listenForAccountNetworkChanges', () => {
    let fakeWalletService
    let fakeWeb3Service
    let fakeWindow
    let fakeTransactions
    let fakeTransactionResults

    beforeEach(() => {
      getAccount.mockImplementation(() => 'account')
      fakeWeb3Service = {
        on: jest.fn(),
        getLock: jest.fn(address => ({ address })),
        getKeyByLockForOwner: jest.fn((lock, owner) => ({
          id: `${lock}-${owner}`,
          lock,
          owner,
          expiration: new Date().getTime() / 1000 + 1000,
        })),
        getAddressBalance: jest.fn(() => '123'),
        getTransaction: jest.fn(hash => fakeTransactionResults[hash]),
      }
      fakeWindow = {
        fetch: jest.fn(() => ({
          json: () => fakeTransactions,
        })),
      }
      fakeTransactions = {}
      fakeTransactionResults = {}
      fakeWalletService = {
        on: jest.fn(),
        ready: true,
        getAccount: jest.fn(() => 'account'),
      }
      pollForAccountChange.mockReset()
      setPaywallConfig({
        locks: {
          '0x123': { name: 'hi' },
        },
      })
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
        locksToRetrieve: ['0x123'],
        window: fakeWindow,
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
        locksToRetrieve: ['0x123'],
        window: fakeWindow,
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

    it('should retrieve keys and transactions for changed user account', async () => {
      expect.assertions(2)
      const onChange = jest.fn()

      const actualAccount = require.requireActual(
        '../../../data-iframe/blockchainHandler/account'
      )

      setAccount.mockImplementationOnce(actualAccount.setAccount)
      getAccount.mockImplementationOnce(actualAccount.getAccount)

      await listenForAccountNetworkChanges({
        walletService: fakeWalletService,
        web3Service: fakeWeb3Service,
        onChange,
        window: fakeWindow,
        locksToRetrieve: ['0x123'],
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

      await accountChanged('hi', '1')

      expect(onChange).toHaveBeenNthCalledWith(3, {
        keys: {
          '0x123': {
            expiration: expect.any(Number),
            id: '0x123-account',
            lock: '0x123',
            owner: 'account',
          },
        },
      })
    })

    it('should reset keys and transactions for user logout', async () => {
      expect.assertions(2)
      const onChange = jest.fn()

      const actualAccount = require.requireActual(
        '../../../data-iframe/blockchainHandler/account'
      )

      setAccount.mockImplementationOnce(actualAccount.setAccount)
      getAccount.mockImplementationOnce(actualAccount.getAccount)
      await listenForAccountNetworkChanges({
        walletService: fakeWalletService,
        web3Service: fakeWeb3Service,
        onChange,
        window: fakeWindow,
        locksToRetrieve: ['0x123'],
      })

      expect(pollForAccountChange).toHaveBeenCalledWith(
        fakeWalletService,
        fakeWeb3Service,
        expect.any(Function)
      )
      const accountChanged = pollForAccountChange.mock.calls[0][2]

      onChange.mockReset()

      await accountChanged(null, '0')

      expect(onChange).toHaveBeenNthCalledWith(3, {
        keys: {},
        transactions: {},
      })
    })
  })
})
