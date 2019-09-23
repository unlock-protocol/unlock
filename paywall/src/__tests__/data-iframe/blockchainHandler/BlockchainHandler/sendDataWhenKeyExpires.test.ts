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

    handler.dispatchChangesToPostOffice = jest.fn()
    fakeWindow.setTimeout = jest.fn()
  }

  beforeEach(() => {
    setupDefaults()
  })

  it('should not set a timeout if there is no key for the lock yet', () => {
    expect.assertions(1)

    handler.sendDataWhenKeyExpires(0)

    expect(fakeWindow.setTimeout).not.toHaveBeenCalled()
  })

  it('should not set a timeout if the key is already expired', () => {
    expect.assertions(1)

    const expiredTimestamp = new Date().getTime() / 1000 - 100
    handler.sendDataWhenKeyExpires(expiredTimestamp)

    expect(fakeWindow.setTimeout).not.toHaveBeenCalled()
  })

  it('should set a timeout if the key valid', () => {
    expect.assertions(3)

    const validTimestamp = new Date().getTime() + 100 * 1000
    const validTimestampInSeconds = validTimestamp / 1000
    handler.sendDataWhenKeyExpires(validTimestampInSeconds)

    const rightNow = new Date().getTime()
    expect(fakeWindow.setTimeout).toHaveBeenCalled()
    const call = (fakeWindow.setTimeout as any).mock.calls[0]
    expect(call[0]).toBeInstanceOf(Function) // Function
    expect(call[1] / 1000).toBeCloseTo(
      (validTimestamp - rightNow + 1000) / 1000
    )
  })

  it('should pass a callback that when triggered dispatches current data to the post office', () => {
    expect.assertions(1)

    const validTimestamp = new Date().getTime() + 100 * 1000
    const validTimestampInSeconds = validTimestamp / 1000
    handler.sendDataWhenKeyExpires(validTimestampInSeconds)

    const dispatch = (fakeWindow.setTimeout as any).mock.calls[0][0]

    dispatch()

    expect(handler.dispatchChangesToPostOffice).toHaveBeenCalled()
  })
})
