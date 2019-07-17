import {
  WalletServiceType,
  Web3ServiceType,
  BlockchainValues,
} from '../../../../data-iframe/blockchainHandler/blockChainTypes'
import {
  setupListeners,
  makeDefaultKeys,
} from '../../../../data-iframe/blockchainHandler/setupBlockchainHandler'
import { TransactionStatus, TransactionType } from '../../../../unlockTypes'
import {
  getWalletService,
  getWeb3Service,
} from '../../../test-helpers/setupBlockchainHelpers'

describe('setupBlockchainHandlers - setupListeners', () => {
  let walletService: WalletServiceType
  let web3Service: Web3ServiceType
  let getNewData: () => void
  let propagateChanges: () => void
  let listeners: { [key: string]: Function }
  let values: BlockchainValues
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
    }
  ) {
    listeners = {}
    getNewData = jest.fn()
    propagateChanges = jest.fn()
    walletService = getWalletService(listeners)
    web3Service = getWeb3Service(listeners)
    values = {
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
      ...valuesOverride,
    }
    setupListeners({
      walletService,
      web3Service,
      getNewData,
      propagateChanges,
      lockAddresses,
      values,
    })
  }

  beforeEach(() => {
    setupDefaults()
  })

  describe('account.changed', () => {
    beforeEach(() => {
      setupDefaults()
    })

    it('should call getNewData on account.changed', () => {
      expect.assertions(4)

      walletService.emit('account.changed', addresses[1])

      expect(getNewData).toHaveBeenCalled()

      expect(values.transactions).toEqual({})
      expect(values.keys).toEqual(makeDefaultKeys(lockAddresses, addresses[1]))
      expect(values.account).toBe(addresses[1])
    })

    it('should not call getNewData on account.changed if account is the same', () => {
      expect.assertions(4)

      walletService.emit('account.changed', null)

      expect(getNewData).not.toHaveBeenCalled()

      expect(values.transactions).toEqual({})
      expect(values.keys).toEqual({})
      expect(values.account).toBeNull()
    })
  })

  describe('network.changed', () => {
    beforeEach(() => {
      setupDefaults()
    })

    it('should call getNewData on network.changed', () => {
      expect.assertions(4)

      walletService.emit('network.changed', 1984)

      expect(getNewData).toHaveBeenCalled()

      expect(values.transactions).toEqual({})
      expect(values.keys).toEqual(
        makeDefaultKeys(lockAddresses, values.account)
      )
      expect(values.network).toBe(1984)
    })

    it('should not call getNewData on network.changed if network is the same', () => {
      expect.assertions(4)

      walletService.emit('network.changed', 1)

      expect(getNewData).not.toHaveBeenCalled()

      expect(values.transactions).toEqual({})
      expect(values.keys).toEqual({})
      expect(values.network).toBe(1)
    })
  })

  describe('account.updated', () => {
    beforeEach(() => {
      setupDefaults()
    })

    it('should call propagateChanges on account.updated', () => {
      expect.assertions(2)

      walletService.emit('account.updated', null, { balance: '123' })

      expect(propagateChanges).toHaveBeenCalled()
      expect(values.balance).toBe('123')
    })

    it('should not call propagateChanges on account.updated if account is not the user account', () => {
      expect.assertions(2)

      walletService.emit('account.updated', 'not user account', {
        balance: '0',
      })

      expect(propagateChanges).not.toHaveBeenCalled()
      expect(values.balance).toBe('0')
    })
  })

  describe('key.updated', () => {
    beforeEach(() => {
      setupDefaults({
        account: addresses[1],
      })
    })

    it('should set up the normalized key and call propagateChanges', () => {
      expect.assertions(2)

      walletService.emit('key.updated', 'id', {
        lock: addresses[0], // non-normalized on purpose
        owner: values.account,
        expiration: 5,
      })

      expect(propagateChanges).toHaveBeenCalled()
      expect(values.keys).toEqual({
        // normalized lock values
        [lockAddresses[0]]: {
          lock: lockAddresses[0],
          owner: values.account,
          expiration: 5,
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

    it('should call propagateChanges', () => {
      expect.assertions(1)

      walletService.emit('transaction.updated', 'hash', { thing: 1 })

      expect(propagateChanges).toHaveBeenCalled()
    })

    it('should use defaults if the transaction does not exist yet', () => {
      expect.assertions(1)

      walletService.emit('transaction.updated', 'hash', { thing: 1 })

      expect(values.transactions).toEqual({
        hash: {
          hash: 'hash',
          blockNumber: Number.MAX_SAFE_INTEGER,
          thing: 1,
        },
      })
    })

    it('should use the existing transaction if the transaction exists', () => {
      expect.assertions(1)

      values.transactions = {
        hash: {
          hash: 'hash',
          blockNumber: 5,
          status: TransactionStatus.MINED,
          confirmations: 1,
          type: TransactionType.KEY_PURCHASE,
        },
      }
      walletService.emit('transaction.updated', 'hash', { thing: 1 })

      expect(values.transactions).toEqual({
        hash: {
          hash: 'hash',
          blockNumber: 5,
          status: TransactionStatus.MINED,
          confirmations: 1,
          type: TransactionType.KEY_PURCHASE,
          thing: 1,
        },
      })
    })
  })

  describe('lock.updated', () => {
    beforeEach(() => {
      setupDefaults({
        account: addresses[1],
      })
    })

    it('should call propagateChanges', () => {
      expect.assertions(1)

      walletService.emit('lock.updated', addresses[0], { thing: 1 })

      expect(propagateChanges).toHaveBeenCalled()
    })

    it('should use defaults if the lock does not exist yet', () => {
      expect.assertions(1)

      walletService.emit('lock.updated', addresses[0], { thing: 1 })

      expect(values.locks).toEqual({
        // verify lock addresses are normalized
        [lockAddresses[0]]: {
          address: lockAddresses[0],
          thing: 1,
        },
      })
    })

    it('should use the existing transaction if the transaction exists', () => {
      expect.assertions(1)

      values.locks = {
        [lockAddresses[0]]: {
          address: lockAddresses[0],
          name: 'hi',
          keyPrice: '1',
          expirationDuration: 1,
          currencyContractAddress: null,
        },
      }
      walletService.emit('lock.updated', addresses[0], { thing: 1 })

      expect(values.locks).toEqual({
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
})
