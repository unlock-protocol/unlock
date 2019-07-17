import {
  WalletServiceType,
  Web3ServiceType,
  BlockchainValues,
  ConstantsType,
  FetchWindow,
  SetTimeoutWindow,
  LocksmithTransactionsResult,
  KeyResult,
} from '../../../../data-iframe/blockchainHandler/blockChainTypes'
import setupBlockchainHandler from '../../../../data-iframe/blockchainHandler/setupBlockchainHandler'
import {
  getWalletService,
  getWeb3Service,
} from '../../../test-helpers/setupBlockchainHelpers'
import {
  PaywallConfig,
  Transaction,
  TransactionStatus,
  TransactionType,
  Locks,
} from '../../../../unlockTypes'
import { waitFor } from '../../../../utils/promises'

describe('setupBlockchainHandler - getNewData', () => {
  let walletService: WalletServiceType
  let web3Service: Web3ServiceType
  let emitError: (error: Error) => void
  let emitChanges: () => void
  let listeners: { [key: string]: Function }
  let values: BlockchainValues
  let constants: ConstantsType
  let configuration: PaywallConfig
  let fakeWindow: FetchWindow & SetTimeoutWindow
  const addresses = [
    '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
    '0x15B87bdC4B3ecb783F56f735653332EAD3BCa5F8',
    '0xBF7F1bdB3a2D6c318603FFc8f39974e597b6af5e',
  ]
  const lockAddresses = addresses.map(address => address.toLowerCase())

  type OptionalBlockchainValues = Partial<BlockchainValues>

  function setupDefaults(
    valuesOverride: OptionalBlockchainValues = {
      config: {
        locks: {
          // addresses are normalized by the time they reach the listeners
          [lockAddresses[0]]: { name: '1' },
          [lockAddresses[1]]: { name: '2' },
          [lockAddresses[2]]: { name: '3' },
        },
        callToAction: {
          default: '',
          expired: '',
          pending: '',
          confirmed: '',
        },
      },
      account: null,
      balance: '0',
      keys: {},
      locks: {},
      transactions: {},
      network: 1,
    },
    jsonToFetch: { transactions?: LocksmithTransactionsResult[] } = {}
  ) {
    fakeWindow = {
      fetch: jest.fn((_: string) => {
        return Promise.resolve({
          json: () => Promise.resolve(jsonToFetch),
        })
      }),
      setTimeout: jest.fn(),
    }
    listeners = {}
    constants = {
      requiredConfirmations: 12,
      locksmithHost: 'http://fun.times',
      unlockAddress: '0x123',
      blockTime: 5000,
      readOnlyProvider: 'http://readonly',
      defaultNetwork: 1984,
    }
    emitChanges = jest.fn()
    emitError = jest.fn()
    walletService = getWalletService(listeners)
    web3Service = getWeb3Service(listeners)
    values = {
      config: {
        locks: {
          // addresses are not normalized yet
          [addresses[0]]: { name: '1' },
          [addresses[1]]: { name: '2' },
          [addresses[2]]: { name: '3' },
        },
        callToAction: {
          default: '',
          expired: '',
          pending: '',
          confirmed: '',
        },
      },
      account: null,
      balance: '0',
      keys: {},
      locks: {},
      transactions: {},
      network: 1,
      ...valuesOverride,
    }
    configuration = values.config
    const mock: any = web3Service.getLock
    mock.mockImplementation((address: string) => {
      web3Service.emit('lock.updated', address, {
        address,
        name: '',
        keyPrice: '0',
        expirationDuration: 1,
        currencyContractAddress: null,
      })
      return Promise.resolve()
    })
  }

  async function callSetupBlockchainHandler() {
    return setupBlockchainHandler({
      walletService,
      web3Service,
      constants,
      configuration,
      emitChanges,
      emitError,
      window: fakeWindow,
      values,
    })
  }

  type KeyExpirationOverrides = {
    [key: string]: number
  }
  function getDefaultFullLocks(
    values: BlockchainValues,
    keyExpirations: KeyExpirationOverrides = {}
  ): Locks {
    return {
      [lockAddresses[0]]: {
        address: lockAddresses[0],
        key: {
          confirmations: 0,
          expiration: keyExpirations[lockAddresses[0]] || 0,
          lock: lockAddresses[0],
          owner: values.account,
          status: 'none',
          transactions: [],
        },
        name: '',
        keyPrice: '0',
        expirationDuration: 1,
        currencyContractAddress: null,
      },
      [lockAddresses[1]]: {
        address: lockAddresses[1],
        key: {
          confirmations: 0,
          expiration: keyExpirations[lockAddresses[1]] || 0,
          lock: lockAddresses[1],
          owner: values.account,
          status: 'none',
          transactions: [],
        },
        name: '',
        keyPrice: '0',
        expirationDuration: 1,
        currencyContractAddress: null,
      },
      [lockAddresses[2]]: {
        address: lockAddresses[2],
        key: {
          confirmations: 0,
          expiration: keyExpirations[lockAddresses[2]] || 0,
          lock: lockAddresses[2],
          owner: values.account,
          status: 'none',
          transactions: [],
        },
        name: '',
        keyPrice: '0',
        expirationDuration: 1,
        currencyContractAddress: null,
      },
    }
  }

  describe('user is not logged in', () => {
    beforeEach(() => {
      setupDefaults({ account: null })
    })

    it('should clear transactions, set up default keys, and set balance to "0"', async () => {
      expect.assertions(3)

      const getNewData = await callSetupBlockchainHandler()

      await getNewData()

      expect(values.transactions).toEqual({})
      expect(values.keys).toEqual({
        [lockAddresses[0]]: {
          lock: lockAddresses[0],
          owner: null,
          expiration: 0,
        },
        [lockAddresses[1]]: {
          lock: lockAddresses[1],
          owner: null,
          expiration: 0,
        },
        [lockAddresses[2]]: {
          lock: lockAddresses[2],
          owner: null,
          expiration: 0,
        },
      })
      expect(values.balance).toBe('0')
    })

    it('should call emitChanges with the default values', async () => {
      expect.assertions(1)

      const getNewData = await callSetupBlockchainHandler()

      await getNewData()

      // locks get populated when web3Service.getLock emits 'lock.updated'
      // see the setupListeners function for implementation
      // the end of "setupDefaults" mocks the emit in this test file
      expect(emitChanges).toHaveBeenCalledWith({
        locks: getDefaultFullLocks(values),
        account: null,
        balance: '0',
        network: 1984,
      })
    })
  })

  describe('user is logged in', () => {
    beforeEach(() => {
      setupDefaults({ account: addresses[2] })
    })

    it('should call emitChanges with the right values', async () => {
      expect.assertions(1)

      const getNewData = await callSetupBlockchainHandler()

      await getNewData()

      // locks get populated when web3Service.getLock emits 'lock.updated'
      // see the setupListeners function for implementation
      // the end of "setupDefaults" mocks the emit in this test file
      expect(emitChanges).toHaveBeenCalledWith({
        locks: getDefaultFullLocks(values),
        account: addresses[2],
        balance: '0',
        network: 1984,
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

      const getNewData = await callSetupBlockchainHandler()

      await getNewData()

      // locks get populated when web3Service.getLock emits 'lock.updated'
      // see the setupListeners function for implementation
      // the end of "setupDefaults" mocks the emit in this test file
      expect(emitChanges).toHaveBeenCalledWith({
        locks: getDefaultFullLocks(values, {
          [lockAddresses[0]]: 12345, // override key expiration for key on lock 0
        }),
        account: addresses[2],
        balance: '0',
        network: 1984,
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
                sender: values.account as string,
                for: values.account as string,
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
            for: values.account as string,
          }
          web3Service.emit('transaction.updated', hash, transaction)
          return Promise.resolve()
        })
      })

      it('should retrieve transactions', async () => {
        expect.assertions(2)

        const getNewData = await callSetupBlockchainHandler()
        const locks: Locks = getDefaultFullLocks(values)
        locks[lockAddresses[1]].key.status = 'pending'
        locks[lockAddresses[1]].key.transactions = [
          {
            blockNumber: Number.MAX_SAFE_INTEGER,
            confirmations: 0,
            for: values.account as string,
            hash: 'hash',
            lock: lockAddresses[1], // normalized lock value
            status: TransactionStatus.PENDING,
            to: lockAddresses[1], // normalized lock value
            type: TransactionType.KEY_PURCHASE,
          },
        ]

        await getNewData()

        await waitFor(() => Object.keys(values.transactions).length)

        // locks get populated when web3Service.getLock emits 'lock.updated'
        // see the setupListeners function for implementation
        // the end of "setupDefaults" mocks the emit in this test file
        expect(emitChanges).toHaveBeenCalledWith({
          locks,
          account: addresses[2],
          balance: '0',
          network: 1984,
        })
        // once for each lock (3), once for the transaction
        expect(emitChanges).toHaveBeenCalledTimes(4)
      })
    })
  })
})
