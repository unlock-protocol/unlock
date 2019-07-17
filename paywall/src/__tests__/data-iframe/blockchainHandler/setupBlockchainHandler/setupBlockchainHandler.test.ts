import {
  WalletServiceType,
  Web3ServiceType,
  BlockchainValues,
  ConstantsType,
  FetchWindow,
  SetTimeoutWindow,
  LocksmithTransactionsResult,
} from '../../../../data-iframe/blockchainHandler/blockChainTypes'
import setupBlockchainHandler from '../../../../data-iframe/blockchainHandler/setupBlockchainHandler'
import {
  getWalletService,
  getWeb3Service,
} from '../../../test-helpers/setupBlockchainHelpers'
import { PaywallConfig } from '../../../../unlockTypes'
import { POLLING_INTERVAL } from '../../../../constants'

describe('setupBlockchainHandler - initial setup', () => {
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

  function getAccountPollingFunction() {
    const mock: any = fakeWindow.setTimeout
    return mock.mock.calls[0][0]
  }

  beforeEach(() => {
    setupDefaults()
    return callSetupBlockchainHandler()
  })

  it('should set up initial default values', () => {
    expect.assertions(1)

    expect(values).toEqual({
      config: {
        locks: {
          // addresses are now normalized
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
      keys: {
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
      }, // default keys for each lock are created
      locks: {},
      transactions: {},
      network: 1984, // default network is used for network
    })
  })

  it('should set up event listeners', () => {
    expect.assertions(1)

    expect(Object.keys(listeners)).toEqual([
      'account.changed',
      'network.changed',
      'account.updated',
      'key.updated',
      'transaction.updated',
      'lock.updated',
      'transaction.new',
      'error',
    ])
  })

  describe('return value', () => {
    beforeEach(() => {
      setupDefaults()
    })

    it('should return a function that can be used to retrieve current keys/transactions', async () => {
      expect.assertions(1)

      const getNewData = await callSetupBlockchainHandler()

      expect(getNewData).toBeInstanceOf(Function)
    })

    // note: the guts of this returned function are testing in getNewData.test.ts
  })

  describe('account polling', () => {
    beforeEach(() => {
      setupDefaults()
    })

    it('should retrieve the current account if walletService is ready', async () => {
      expect.assertions(1)

      walletService.ready = true
      await callSetupBlockchainHandler()

      expect(walletService.getAccount).toHaveBeenCalled()
    })

    it('should not retrieve the current account if walletService is not ready', async () => {
      expect.assertions(1)

      walletService.ready = false
      await callSetupBlockchainHandler()

      expect(walletService.getAccount).not.toHaveBeenCalled()
    })

    it('should poll for account changes', async () => {
      expect.assertions(1)

      await callSetupBlockchainHandler()

      expect(fakeWindow.setTimeout).toHaveBeenCalledWith(
        expect.any(Function),
        POLLING_INTERVAL
      )
    })

    describe('account polling function', () => {
      beforeEach(() => {
        setupDefaults()
      })

      it('should retrieve current account if walletService is ready', async () => {
        expect.assertions(1)

        walletService.ready = true
        await callSetupBlockchainHandler()

        const pollForAccounts = getAccountPollingFunction()
        pollForAccounts()

        expect(walletService.getAccount).toHaveBeenCalled()
      })

      it('should not retrieve current account if walletService is not ready', async () => {
        expect.assertions(1)

        walletService.ready = false
        await callSetupBlockchainHandler()

        const pollForAccounts = getAccountPollingFunction()
        pollForAccounts()

        expect(walletService.getAccount).not.toHaveBeenCalled()
      })

      it('should poll for account changes', async () => {
        expect.assertions(1)

        await callSetupBlockchainHandler()

        const pollForAccounts = getAccountPollingFunction()
        pollForAccounts()

        expect(fakeWindow.setTimeout).toHaveBeenCalledWith(
          expect.any(Function),
          POLLING_INTERVAL
        )
      })
    })
  })
})
