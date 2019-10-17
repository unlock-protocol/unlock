import {
  WalletServiceType,
  Web3ServiceType,
  PaywallState,
  ConstantsType,
  FetchWindow,
  SetTimeoutWindow,
  LocksmithTransactionsResult,
} from '../../../../data-iframe/blockchainHandler/blockChainTypes'
import BlockchainHandler, {
  makeDefaultKeys,
} from '../../../../data-iframe/blockchainHandler/BlockchainHandler'
import {
  defaultValuesOverride,
  BlockchainTestDefaults,
  lockAddresses,
  setupTestDefaults,
  addresses,
} from '../../../test-helpers/setupBlockchainHelpers'
import { PaywallConfig } from '../../../../unlockTypes'
import { POLLING_INTERVAL } from '../../../../constants'

describe('BlockchainHandler class setup', () => {
  let walletService: WalletServiceType
  let web3Service: Web3ServiceType
  let emitError: (error: Error) => void
  let emitChanges: () => void
  let listeners: { [key: string]: Function }
  let store: PaywallState
  let constants: ConstantsType
  let configuration: PaywallConfig
  let fakeWindow: FetchWindow & SetTimeoutWindow
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
    listeners = defaults.listeners
    store = defaults.store
    constants = defaults.constants
    configuration = defaults.configuration
    fakeWindow = defaults.fakeWindow
  }

  async function callSetupBlockchainHandler() {
    const handler = new BlockchainHandler({
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
    return handler
  }

  function getAccountPollingFunction() {
    const mock: any = fakeWindow.setTimeout
    return mock.mock.calls[0][0]
  }

  beforeEach(() => {
    setupDefaults()
    return callSetupBlockchainHandler()
  })

  it('should set up initial default store', () => {
    expect.assertions(1)

    expect(store).toEqual({
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
      balance: {},
      keys: makeDefaultKeys(lockAddresses, null),
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

  describe('_onLockUpdated', () => {
    beforeEach(() => {
      setupDefaults({ account: addresses[1] })
    })

    it('should load the current user balance if the lock is an ERC20 lock', async () => {
      expect.assertions(2)
      const handler = await callSetupBlockchainHandler()
      const erc20Balance = '1337'

      defaults.web3Service.getTokenBalance = jest.fn(() =>
        Promise.resolve(erc20Balance)
      )
      const update = {
        currencyContractAddress: '0xErc20Token',
      }
      await handler._onLockUpdated(lockAddresses[0], update)
      expect(defaults.web3Service.getTokenBalance).toHaveBeenCalledWith(
        update.currencyContractAddress,
        defaults.store.account
      )
      expect(defaults.store.balance[update.currencyContractAddress]).toEqual(
        erc20Balance
      )
    })
  })

  describe('_reset', () => {
    let handler: BlockchainHandler
    beforeEach(async () => {
      handler = await callSetupBlockchainHandler()
    })

    it('resets the keys to default keys', () => {
      expect.assertions(1)
      ;(handler as any).store.keys = {}
      handler._reset()
      expect((handler as any).store.keys).toEqual(
        makeDefaultKeys(lockAddresses, null)
      )
    })

    it('fetches token balances for erc20 locks if there is an account set', () => {
      expect.assertions(1)
      ;(handler as any).store.locks = {
        '0x123abc': {
          currencyContractAddress: '205 Hudson Street',
        },
      }
      ;(handler as any).store.account = '0xdeadb33f'
      const mock = jest.fn()
      ;(handler as any).getTokenBalance = mock
      handler._reset()
      expect(mock).toHaveBeenCalledWith('205 Hudson Street')
    })
  })

  describe('account polling', () => {
    beforeEach(() => {
      setupDefaults()
    })

    it('should retrieve the current account if walletService has a provider', async () => {
      expect.assertions(1)

      // for the purposes of this test, we only need the provider to exist
      walletService.provider = true
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

        // for the purposes of this test, we only need the provider to exist
        walletService.provider = true
        await callSetupBlockchainHandler()

        const pollForAccounts = getAccountPollingFunction()
        pollForAccounts()

        expect(walletService.getAccount).toHaveBeenCalled()
      })

      it('should not retrieve current account if walletService is not ready', async () => {
        expect.assertions(1)

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
