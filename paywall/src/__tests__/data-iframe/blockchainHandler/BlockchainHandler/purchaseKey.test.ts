import {
  WalletServiceType,
  Web3ServiceType,
  PaywallState,
  SetTimeoutWindow,
  FetchWindow,
  LocksmithTransactionsResult,
  ConstantsType,
} from '../../../../data-iframe/blockchainHandler/blockChainTypes'
import BlockchainHandler from '../../../../data-iframe/blockchainHandler/BlockchainHandler'
import { PaywallConfig } from '../../../../unlockTypes'
import {
  defaultValuesOverride,
  BlockchainTestDefaults,
  setupTestDefaults,
  lockAddresses,
  addresses,
} from '../../../test-helpers/setupBlockchainHelpers'

describe('BlockchainHandler - purchaseKey', () => {
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
    handler.init()
    walletService.purchaseKey = jest.fn()
  }

  describe('no account yet', () => {
    beforeEach(() => {
      setupDefaults()
    })

    it('should not attempt purchase', async () => {
      expect.assertions(1)

      await handler.purchaseKey({
        lockAddress: lockAddresses[0],
        amountToSend: '123',
        erc20Address: lockAddresses[2], // verify we pass this in too
      })

      expect(walletService.purchaseKey).not.toHaveBeenCalled()
    })
  })

  describe('account is available', () => {
    beforeEach(() => {
      setupDefaults({ account: addresses[1] })
    })

    it('should attempt a key purchase', async () => {
      expect.assertions(1)

      await handler.purchaseKey({
        lockAddress: lockAddresses[0],
        amountToSend: '123',
        erc20Address: addresses[2], // verify we pass this in too
      })

      expect(walletService.purchaseKey).toHaveBeenCalledWith(
        lockAddresses[0],
        addresses[1],
        '123',
        null,
        null,
        addresses[2]
      )
    })
  })
})
