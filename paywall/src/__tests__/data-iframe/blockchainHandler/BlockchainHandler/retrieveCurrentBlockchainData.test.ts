import {
  WalletServiceType,
  Web3ServiceType,
  PaywallState,
  SetTimeoutWindow,
  FetchWindow,
  LocksmithTransactionsResult,
  ConstantsType,
  KeyResult,
} from '../../../../data-iframe/blockchainHandler/blockChainTypes'
import BlockchainHandler, {
  makeDefaultKeys,
} from '../../../../data-iframe/blockchainHandler/BlockchainHandler'
import {
  TransactionStatus,
  TransactionType,
  PaywallConfig,
  Transaction,
  Locks,
} from '../../../../unlockTypes'
import {
  defaultValuesOverride,
  BlockchainTestDefaults,
  addresses,
  setupTestDefaults,
  lockAddresses,
  getDefaultFullLocks,
} from '../../../test-helpers/setupBlockchainHelpers'
import { waitFor } from '../../../../utils/promises'

describe('BlockchainHandler - retrieveCurrentBlockchainData', () => {
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
    const mock: any = web3Service.getLock
    // emit a unique name for each lock
    const lockNames = {
      [lockAddresses[0]]: 'one',
      [lockAddresses[1]]: 'two',
      [lockAddresses[2]]: 'three',
    }
    mock.mockImplementation((address: string) => {
      web3Service.emit('lock.updated', address, {
        address,
        name: lockNames[address],
        keyPrice: '0',
        expirationDuration: 1,
        currencyContractAddress: null,
      })
      return Promise.resolve()
    })
    handler.init()
  }

  describe('lock names', () => {
    beforeEach(() => {
      setupDefaults({ account: null })
    })

    it('should use configuration names if present', async () => {
      expect.assertions(1)

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

      // locks get populated when web3Service.getLock emits 'lock.updated'
      // see the setupListeners function for implementation
      // the end of "setupDefaults" mocks the emit in this test file
      expect(emitChanges).toHaveBeenCalledWith({
        locks: getDefaultFullLocks(store, configuration),
        account: null,
        balance: '0',
        network: 1984,
        keys: makeDefaultKeys(lockAddresses, null),
        transactions: {},
      })
    })

    it('should use lock names if configuration names are not present', async () => {
      expect.assertions(1)

      configuration.locks[lockAddresses[0]].name = ''
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

      await handler.retrieveCurrentBlockchainData()

      // locks get populated when web3Service.getLock emits 'lock.updated'
      // see the setupListeners function for implementation
      // the end of "setupDefaults" mocks the emit in this test file
      expect(emitChanges).toHaveBeenCalledWith({
        locks: getDefaultFullLocks(store, configuration),
        account: null,
        balance: '0',
        network: 1984,
        keys: makeDefaultKeys(lockAddresses, null),
        transactions: {},
      })
    })
  })

  describe('user is not logged in', () => {
    beforeEach(() => {
      setupDefaults({ account: null })
    })

    it('should clear transactions, set up default keys, and set balance to "0"', async () => {
      expect.assertions(3)

      await handler.retrieveCurrentBlockchainData()

      expect(store.transactions).toEqual({})
      expect(store.keys).toEqual(makeDefaultKeys(lockAddresses, null))
      expect(store.balance).toBe('0')
    })

    it('should call emitChanges with the default store', async () => {
      expect.assertions(1)

      await handler.retrieveCurrentBlockchainData()

      // locks get populated when web3Service.getLock emits 'lock.updated'
      // see the setupListeners function for implementation
      // the end of "setupDefaults" mocks the emit in this test file
      expect(emitChanges).toHaveBeenCalledWith({
        locks: getDefaultFullLocks(store, configuration),
        account: null,
        balance: '0',
        network: 1984,
        keys: makeDefaultKeys(lockAddresses, null),
        transactions: {},
      })
    })
  })

  describe('user is logged in', () => {
    beforeEach(() => {
      setupDefaults({ account: addresses[2] })
    })

    it('should call emitChanges with the right store', async () => {
      expect.assertions(1)

      await handler.retrieveCurrentBlockchainData()

      // locks get populated when web3Service.getLock emits 'lock.updated'
      // see the setupListeners function for implementation
      // the end of "setupDefaults" mocks the emit in this test file
      expect(emitChanges).toHaveBeenCalledWith({
        locks: getDefaultFullLocks(store, configuration),
        account: addresses[2],
        balance: '0',
        network: 1984,
        keys: makeDefaultKeys(lockAddresses, addresses[2]),
        transactions: {},
      })
    })

    it('should retrieve keys', async () => {
      expect.assertions(1)

      const mock: any = web3Service.getKeyByLockForOwner
      mock.mockImplementationOnce((lock: string, owner: string) => {
        const key: KeyResult = {
          lock,
          owner,
          expiration: 12345,
        }
        web3Service.emit('key.updated', 'id', key)
        return Promise.resolve(key)
      })

      await handler.retrieveCurrentBlockchainData()

      // locks get populated when web3Service.getLock emits 'lock.updated'
      // see the setupListeners function for implementation
      // the end of "setupDefaults" mocks the emit in this test file
      expect(emitChanges).toHaveBeenCalledWith({
        locks: getDefaultFullLocks(store, configuration, {
          [lockAddresses[0]]: 12345, // override key expiration for key on lock 0
        }),
        account: addresses[2],
        balance: '0',
        network: 1984,
        keys: expect.objectContaining({
          '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2': {
            expiration: 12345,
            lock: '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
            owner: '0xBF7F1bdB3a2D6c318603FFc8f39974e597b6af5e',
          },
        }),
        transactions: {},
      })
    })

    it('should pass any errors in key retrieval to emitError', async () => {
      expect.assertions(1)

      const error = new Error('fail')
      const mock: any = web3Service.getKeyByLockForOwner
      mock.mockImplementationOnce(() => {
        return Promise.reject(error)
      })

      await handler.retrieveCurrentBlockchainData()

      expect(emitError).toHaveBeenCalledWith(error)
    })

    describe('default keys', () => {
      beforeEach(() => {
        setupDefaults({
          account: addresses[2],
          keys: {
            [lockAddresses[0]]: {
              lock: lockAddresses[0],
              owner: addresses[2],
              expiration: 3,
            },
          },
        })
      })

      it('should fill in the missing keys with defaults', async () => {
        expect.assertions(1)

        // remove some keys manually

        delete store.keys[lockAddresses[1]]
        delete store.keys[lockAddresses[2]]
        await handler.retrieveCurrentBlockchainData()

        // this proves that 3 keys still exist
        expect(emitChanges).toHaveBeenCalledWith({
          locks: getDefaultFullLocks(store, configuration, {}),
          account: addresses[2],
          balance: '0',
          network: 1984,
          keys: makeDefaultKeys(lockAddresses, addresses[2]),
          transactions: {},
        })
      })
    })

    describe('transactions', () => {
      beforeEach(() => {
        setupDefaults(
          { account: addresses[2] },
          {
            transactions: [
              {
                transactionHash: 'hash',
                chain: constants.defaultNetwork,
                recipient: addresses[1], // locksmith returns checksummed addresses
                sender: store.account as string,
                for: store.account as string,
                data: 'data',
              },
            ],
          }
        )

        // return a fake transaction
        const mock: any = web3Service.getTransaction
        mock.mockImplementationOnce((hash: string) => {
          const transaction: Transaction = {
            hash,
            status: TransactionStatus.PENDING,
            confirmations: 0,
            type: TransactionType.KEY_PURCHASE,
            blockNumber: Number.MAX_SAFE_INTEGER,
            lock: addresses[1], // chain returns checksummed addresses
            to: addresses[1], // chain returns checksummed addresses
            for: store.account as string,
          }
          web3Service.emit('transaction.updated', hash, transaction)
          return Promise.resolve()
        })
      })

      it('should retrieve transactions', async () => {
        expect.assertions(2)

        const locks: Locks = getDefaultFullLocks(store, configuration)
        locks[lockAddresses[1]].key.status = 'pending'
        locks[lockAddresses[1]].key.transactions = [
          {
            blockNumber: Number.MAX_SAFE_INTEGER,
            confirmations: 0,
            for: store.account as string,
            hash: 'hash',
            lock: lockAddresses[1], // normalized lock value
            status: TransactionStatus.PENDING,
            to: lockAddresses[1], // normalized lock value
            type: TransactionType.KEY_PURCHASE,
          },
        ]

        await handler.retrieveCurrentBlockchainData()

        await waitFor(() => Object.keys(store.transactions).length)

        // locks get populated when web3Service.getLock emits 'lock.updated'
        // see the setupListeners function for implementation
        // the end of "setupDefaults" mocks the emit in this test file
        expect(emitChanges).toHaveBeenCalledWith({
          locks,
          account: addresses[2],
          balance: '0',
          network: 1984,
          keys: makeDefaultKeys(lockAddresses, addresses[2]),
          transactions: {
            hash: {
              blockNumber: 9007199254740991,
              confirmations: 0,
              for: '0xBF7F1bdB3a2D6c318603FFc8f39974e597b6af5e',
              hash: 'hash',
              lock: '0x15b87bdc4b3ecb783f56f735653332ead3bca5f8',
              status: 'pending',
              to: '0x15b87bdc4b3ecb783f56f735653332ead3bca5f8',
              type: 'KEY_PURCHASE',
            },
          },
        })
        // once for each lock (3), once for the transaction
        expect(emitChanges).toHaveBeenCalledTimes(4)
      })
    })
  })
})
