import {
  WalletServiceType,
  Web3ServiceType,
  PaywallState,
  SetTimeoutWindow,
  FetchWindow,
  LocksmithTransactionsResult,
  ConstantsType,
  TransactionDefaults,
} from '../../../../data-iframe/blockchainHandler/blockChainTypes'
import BlockchainHandler, {
  makeDefaultKeys,
} from '../../../../data-iframe/blockchainHandler/BlockchainHandler'
import {
  TransactionStatus,
  TransactionType,
  PaywallConfig,
} from '../../../../unlockTypes'
import {
  defaultValuesOverride,
  BlockchainTestDefaults,
  addresses,
  setupTestDefaults,
  lockAddresses,
} from '../../../test-helpers/setupBlockchainHelpers'

describe('BlockchainHandler - setupListeners', () => {
  let walletService: WalletServiceType
  let web3Service: Web3ServiceType
  let emitError: (error: Error) => void
  let emitChanges: () => void
  let store: PaywallState
  let constants: ConstantsType
  let configuration: PaywallConfig
  let fakeWindow: FetchWindow & SetTimeoutWindow
  let handler: BlockchainHandler
  let defaults: BlockchainTestDefaults

  type OptionalBlockchainValues = Partial<PaywallState>

  function setupDefaults(
    valuesOverride: OptionalBlockchainValues = defaultValuesOverride,
    jsonToFetch: { transactions?: LocksmithTransactionsResult[] } = {}
  ) {
    defaults = setupTestDefaults(valuesOverride, jsonToFetch)
    walletService = defaults.walletService
    web3Service = defaults.web3Service
    emitError = defaults.emitError
    emitChanges = defaults.emitChanges
    store = defaults.store
    constants = defaults.constants
    configuration = defaults.configuration
    fakeWindow = defaults.fakeWindow
    handler = new BlockchainHandler({
      walletService,
      web3Service,
      constants,
      configuration,
      emitChanges,
      emitError,
      window: fakeWindow,
      store,
    })
    handler.init()
    handler.setupListeners()

    handler.retrieveCurrentBlockchainData = jest.fn()
    handler.dispatchChangesToPostOffice = jest.fn()
  }

  beforeEach(() => {
    setupDefaults()
  })

  describe('account.changed', () => {
    beforeEach(() => {
      setupDefaults()
    })

    it('should call retrieveCurrentBlockchainData on account.changed', () => {
      expect.assertions(4)

      walletService.emit('account.changed', addresses[1])

      expect(handler.retrieveCurrentBlockchainData).toHaveBeenCalled()

      expect(store.transactions).toEqual({})
      expect(store.keys).toEqual(makeDefaultKeys(lockAddresses, addresses[1]))
      expect(store.account).toBe(addresses[1])
    })

    it('should not call retrieveCurrentBlockchainData on account.changed if account is the same', () => {
      expect.assertions(4)

      walletService.emit('account.changed', null)

      expect(handler.retrieveCurrentBlockchainData).not.toHaveBeenCalled()

      expect(store.transactions).toEqual({})
      expect(store.keys).toEqual(makeDefaultKeys(lockAddresses, null))
      expect(store.account).toBeNull()
    })
  })

  describe('network.changed', () => {
    beforeEach(() => {
      setupDefaults()
    })

    it('should call retrieveCurrentBlockchainData on network.changed', () => {
      expect.assertions(4)

      walletService.emit('network.changed', 1)

      expect(handler.retrieveCurrentBlockchainData).toHaveBeenCalled()

      expect(store.transactions).toEqual({})
      expect(store.keys).toEqual(makeDefaultKeys(lockAddresses, store.account))
      expect(store.network).toBe(1)
    })

    it('should not call retrieveCurrentBlockchainData on network.changed if network is the same', () => {
      expect.assertions(4)

      walletService.emit('network.changed', 1984)

      expect(handler.retrieveCurrentBlockchainData).not.toHaveBeenCalled()

      expect(store.transactions).toEqual({})
      expect(store.keys).toEqual(makeDefaultKeys(lockAddresses, null))
      expect(store.network).toBe(1984)
    })
  })

  describe('account.updated', () => {
    beforeEach(() => {
      setupDefaults()
    })

    it('should call dispatchChangesToPostOffice on account.updated for our account', () => {
      expect.assertions(2)

      walletService.emit(
        'account.updated',
        { address: store.account },
        { balance: '123' }
      )

      expect(handler.dispatchChangesToPostOffice).toHaveBeenCalled()
      expect(store.balance).toBe('123')
    })

    it('should not call dispatchChangesToPostOffice on account.updated for another account', () => {
      expect.assertions(2)

      walletService.emit(
        'account.updated',
        { address: 'oops' },
        { balance: '123' }
      )

      expect(handler.dispatchChangesToPostOffice).not.toHaveBeenCalled()
      expect(store.balance).toBe('0')
    })

    it('should not call dispatchChangesToPostOffice on account.updated if account is not the user account', () => {
      expect.assertions(2)

      walletService.emit('account.updated', 'not user account', {
        balance: '0',
      })

      expect(handler.dispatchChangesToPostOffice).not.toHaveBeenCalled()
      expect(store.balance).toBe('0')
    })
  })

  describe('key.updated', () => {
    beforeEach(() => {
      setupDefaults({
        account: addresses[1],
      })
    })

    it('should set up the normalized key and call dispatchChangesToPostOffice', () => {
      expect.assertions(2)

      walletService.emit('key.updated', 'id', {
        lock: addresses[0], // non-normalized on purpose
        owner: store.account,
        expiration: 5,
      })

      expect(handler.dispatchChangesToPostOffice).toHaveBeenCalled()
      expect(store.keys).toEqual({
        // normalized lock values
        [lockAddresses[0]]: {
          lock: lockAddresses[0],
          owner: store.account,
          expiration: 5,
        },
        [lockAddresses[1]]: {
          lock: lockAddresses[1],
          owner: store.account,
          expiration: 0,
        },
        [lockAddresses[2]]: {
          lock: lockAddresses[2],
          owner: store.account,
          expiration: 0,
        },
      })
    })
  })

  describe('transaction.updated', () => {
    beforeEach(() => {
      setupDefaults({
        account: addresses[1],
      })
    })

    it('should call dispatchChangesToPostOffice', () => {
      expect.assertions(1)

      walletService.emit('transaction.updated', 'hash', { thing: 1 })

      expect(handler.dispatchChangesToPostOffice).toHaveBeenCalled()
    })

    it('should use defaults if the transaction does not exist yet', () => {
      expect.assertions(1)

      walletService.emit('transaction.updated', 'hash', { thing: 1 })

      expect(store.transactions).toEqual({
        hash: {
          hash: 'hash',
          blockNumber: Number.MAX_SAFE_INTEGER,
          thing: 1,
          status: 'submitted',
        },
      })
    })

    it('should use the existing transaction if the transaction exists', () => {
      expect.assertions(1)

      store.transactions = {
        hash: {
          hash: 'hash',
          blockNumber: 5,
          status: TransactionStatus.MINED,
          confirmations: 1,
          type: TransactionType.KEY_PURCHASE,
        },
      }
      walletService.emit('transaction.updated', 'hash', {
        thing: 1,
        lock: addresses[0],
        to: addresses[1],
      })

      expect(store.transactions).toEqual({
        hash: {
          hash: 'hash',
          blockNumber: 5,
          status: TransactionStatus.MINED,
          confirmations: 1,
          type: TransactionType.KEY_PURCHASE,
          lock: lockAddresses[0], // verify normalized lock address is used
          to: lockAddresses[1], // verify normalized lock address is used
          thing: 1,
        },
      })
    })

    describe('retrieving key', () => {
      beforeEach(() => {
        setupDefaults({
          account: addresses[1],
        })
      })

      it('should not retrieve a key for a non-key purchase transaction', () => {
        expect.assertions(1)

        store.transactions = {
          hash: {
            hash: 'hash',
            blockNumber: 5,
            status: TransactionStatus.MINED,
            confirmations: 1,
            type: TransactionType.LOCK_CREATION,
          },
        }
        walletService.emit('transaction.updated', 'hash', {
          thing: 1,
          lock: addresses[0],
          to: addresses[1],
        })

        expect(web3Service.getKeyByLockForOwner).not.toHaveBeenCalled()
      })

      it('should retrieve the key expiry for a key purchase transaction defined by the stored transaction', () => {
        expect.assertions(1)

        store.transactions = {
          hash: {
            hash: 'hash',
            blockNumber: 5,
            status: TransactionStatus.MINED,
            confirmations: 1,
            lock: lockAddresses[0], // this address has already been normalized
            type: TransactionType.KEY_PURCHASE,
          },
        }
        walletService.emit('transaction.updated', 'hash', {
          thing: 1,
          to: addresses[1],
        })

        expect(web3Service.getKeyByLockForOwner).toHaveBeenCalledWith(
          lockAddresses[0],
          addresses[1]
        )
      })

      it('should retrieve the key expiry for a key purchase transaction defined by the update', () => {
        expect.assertions(1)

        store.transactions = {
          hash: {
            hash: 'hash',
            blockNumber: 5,
            status: TransactionStatus.MINED,
            confirmations: 1,
            type: TransactionType.KEY_PURCHASE,
          },
        }
        walletService.emit('transaction.updated', 'hash', {
          thing: 1,
          lock: addresses[0], // this address is normalized in the listener
          to: addresses[1],
        })

        expect(web3Service.getKeyByLockForOwner).toHaveBeenCalledWith(
          lockAddresses[0],
          addresses[1]
        )
      })

      it('should retrieve the key expiry and use transaction.lock if present', () => {
        expect.assertions(1)

        store.transactions = {
          hash: {
            hash: 'hash',
            blockNumber: 5,
            status: TransactionStatus.MINED,
            confirmations: 1,
            lock: lockAddresses[0], // this address has already been normalized
            type: TransactionType.KEY_PURCHASE,
          },
        }
        walletService.emit('transaction.updated', 'hash', {
          thing: 1,
        })

        expect(web3Service.getKeyByLockForOwner).toHaveBeenCalledWith(
          lockAddresses[0],
          addresses[1]
        )
      })

      it('should retrieve the key expiry and use transaction.to if lock is not present', () => {
        expect.assertions(1)

        store.transactions = {
          hash: {
            hash: 'hash',
            blockNumber: 5,
            status: TransactionStatus.MINED,
            confirmations: 1,
            to: lockAddresses[0], // this address has already been normalized
            type: TransactionType.KEY_PURCHASE,
          },
        }
        walletService.emit('transaction.updated', 'hash', {
          thing: 1,
        })

        expect(web3Service.getKeyByLockForOwner).toHaveBeenCalledWith(
          lockAddresses[0],
          addresses[1]
        )
      })

      it('should retrieve the key expiry and use transaction.lock from the update if present', () => {
        expect.assertions(1)

        store.transactions = {
          hash: {
            hash: 'hash',
            blockNumber: 5,
            status: TransactionStatus.MINED,
            confirmations: 1,
            type: TransactionType.KEY_PURCHASE,
          },
        }
        walletService.emit('transaction.updated', 'hash', {
          thing: 1,
          lock: addresses[0], // this address is normalized in the listener
        })

        expect(web3Service.getKeyByLockForOwner).toHaveBeenCalledWith(
          lockAddresses[0],
          addresses[1]
        )
      })

      it('should retrieve the key expiry and use transaction.to from the update if lock is not present', () => {
        expect.assertions(1)

        store.transactions = {
          hash: {
            hash: 'hash',
            blockNumber: 5,
            status: TransactionStatus.MINED,
            confirmations: 1,
            type: TransactionType.KEY_PURCHASE,
          },
        }
        walletService.emit('transaction.updated', 'hash', {
          thing: 1,
          to: addresses[0], // this address is normalized in the listener
        })

        expect(web3Service.getKeyByLockForOwner).toHaveBeenCalledWith(
          lockAddresses[0],
          addresses[1]
        )
      })
    })
  })

  describe('lock.updated', () => {
    beforeEach(() => {
      setupDefaults({
        account: addresses[1],
      })
    })

    it('should call dispatchChangesToPostOffice', () => {
      expect.assertions(1)

      walletService.emit('lock.updated', addresses[0], { thing: 1 })

      expect(handler.dispatchChangesToPostOffice).toHaveBeenCalled()
    })

    it('should use defaults if the lock does not exist yet', () => {
      expect.assertions(1)

      walletService.emit('lock.updated', addresses[0], { thing: 1 })

      expect(store.locks).toEqual({
        // verify lock addresses are normalized
        [lockAddresses[0]]: {
          address: lockAddresses[0],
          thing: 1,
        },
      })
    })

    it('should use the existing transaction if the transaction exists', () => {
      expect.assertions(1)

      store.locks = {
        [lockAddresses[0]]: {
          address: lockAddresses[0],
          name: 'hi',
          keyPrice: '1',
          expirationDuration: 1,
          currencyContractAddress: null,
        },
      }
      walletService.emit('lock.updated', addresses[0], { thing: 1 })

      expect(store.locks).toEqual({
        [lockAddresses[0]]: {
          address: lockAddresses[0],
          name: 'hi',
          keyPrice: '1',
          expirationDuration: 1,
          currencyContractAddress: null,
          thing: 1,
        },
      })
    })
  })

  describe('transaction.new', () => {
    beforeEach(() => {
      setupDefaults()
      handler.storeTransaction = jest.fn()
    })

    it('should call dispatchChangesToPostOffice', () => {
      expect.assertions(1)

      walletService.emit(
        'transaction.new',
        'hash',
        'from',
        addresses[0] /* to */,
        'input',
        'type',
        'status'
      )

      expect(handler.dispatchChangesToPostOffice).toHaveBeenCalled()
    })

    it('should add a new submitted transaction with values passed in', () => {
      expect.assertions(1)

      walletService.emit(
        'transaction.new',
        'hash',
        'from',
        addresses[0] /* to */,
        'input',
        TransactionType.KEY_PURCHASE,
        'submitted'
      )

      expect(store.transactions).toEqual({
        hash: {
          hash: 'hash',
          to: lockAddresses[0], // verify lock address is normalized
          from: 'from',
          for: 'from',
          input: 'input',
          type: TransactionType.KEY_PURCHASE,
          status: 'submitted',
          key: `${addresses[0]}-from`, // key is non-normalized
          lock: lockAddresses[0], // verify lock address is normalized
          confirmations: 0,
          network: store.network,
          blockNumber: Number.MAX_SAFE_INTEGER,
        },
      })
    })

    it('should store the transaction in locksmith', () => {
      expect.assertions(1)

      walletService.emit(
        'transaction.new',
        'hash',
        'from',
        addresses[0] /* to */,
        'input',
        TransactionType.KEY_PURCHASE,
        'submitted'
      )

      const newTransaction: TransactionDefaults = {
        hash: 'hash',
        for: 'from',
        from: 'from',
        to: lockAddresses[0], // lock address is normalized
        input: 'input',
        type: TransactionType.KEY_PURCHASE,
        status: TransactionStatus.SUBMITTED,
        blockNumber: Number.MAX_SAFE_INTEGER,
      }

      expect(handler.storeTransaction).toHaveBeenCalledWith(newTransaction)
    })
  })

  describe('error', () => {
    beforeEach(() => {
      setupDefaults()
    })

    it('should ignore errors that are not from key purchase', () => {
      expect.assertions(1)

      walletService.emit('error', new Error('this is ignored'))

      expect(emitError).not.toHaveBeenCalled()
    })

    it('should pass key purchase errors to emitError', () => {
      expect.assertions(1)

      const keyPurchaseError = new Error('FAILED_TO_PURCHASE_KEY')

      walletService.emit('error', keyPurchaseError)

      expect(emitError).toHaveBeenCalledWith(new Error('purchase failed'))
    })

    it('should fetch new data on key purchase failure', () => {
      expect.assertions(1)

      const keyPurchaseError = new Error('FAILED_TO_PURCHASE_KEY')

      walletService.emit('error', keyPurchaseError)

      expect(handler.retrieveCurrentBlockchainData).toHaveBeenCalled()
    })

    it('should remove submitted transactions from values on key purchase failure', () => {
      expect.assertions(1)

      const keyPurchaseError = new Error('FAILED_TO_PURCHASE_KEY')
      store.transactions = {
        hash: {
          hash: 'hash',
          status: TransactionStatus.SUBMITTED,
          confirmations: 0,
          type: TransactionType.KEY_PURCHASE,
          blockNumber: Number.MAX_SAFE_INTEGER,
        },
        hash1: {
          hash: 'hash1',
          status: TransactionStatus.MINED,
          confirmations: 2,
          type: TransactionType.KEY_PURCHASE,
          blockNumber: 5,
        },
      }

      walletService.emit('error', keyPurchaseError)

      expect(store.transactions).toEqual({
        hash1: {
          hash: 'hash1',
          status: TransactionStatus.MINED,
          confirmations: 2,
          type: TransactionType.KEY_PURCHASE,
          blockNumber: 5,
        },
      })
    })
  })
})
