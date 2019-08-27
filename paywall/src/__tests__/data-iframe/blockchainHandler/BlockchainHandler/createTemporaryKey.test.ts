import {
  Web3ServiceType,
  PaywallState,
  FetchWindow,
  ConstantsType,
  LocksmithTransactionsResult,
  WalletServiceType,
  SetTimeoutWindow,
} from '../../../../data-iframe/blockchainHandler/blockChainTypes'
import {
  BlockchainTestDefaults,
  defaultValuesOverride,
  setupTestDefaults,
  lockAddresses,
  firstLockLocked,
} from '../../../test-helpers/setupBlockchainHelpers'
import BlockchainHandler from '../../../../data-iframe/blockchainHandler/BlockchainHandler'
import { PaywallConfig } from '../../../../unlockTypes'

describe('BlockchainHandler - createTemporaryKey', () => {
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

  const lock = firstLockLocked

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
  }

  beforeEach(() => {
    setupDefaults()
  })

  // The times tested here should only ever be off by a fraction of a second
  const approximatelyEquals = (a: number, b: number, tolerance: number = 1) => {
    return b - tolerance < a && a < b + tolerance
  }

  it("should create a temporary key based on the lock's expiration", () => {
    expect.assertions(3)
    ;(handler as any).store.locks = {
      [lock.address]: lock,
    }

    // Probably not the best way to test this!
    const currentTimeInSeconds = new Date().getTime() / 1000
    const expectedExpiration = currentTimeInSeconds + lock.expirationDuration

    const tx = {
      hash: 'hash',
      to: lockAddresses[0],
      from: '0xC0FFEE',
      input: '',
    }

    const temporaryKey = handler.createTemporaryKey(tx)
    expect(temporaryKey.lock).toBe(lockAddresses[0])
    expect(temporaryKey.owner).toBe('0xC0FFEE')
    expect(
      approximatelyEquals(temporaryKey.expiration, expectedExpiration)
    ).toBeTruthy()
  })

  it('should create a temporary key based on the default value', () => {
    expect.assertions(3)

    // Probably not the best way to test this!
    const currentTimeInSeconds = new Date().getTime() / 1000
    const secondsInADay = 60 * 60 * 24
    const expectedExpiration = currentTimeInSeconds + secondsInADay

    const tx = {
      hash: 'hash',
      to: lockAddresses[1],
      from: '0xDECADE',
      input: '',
    }

    const temporaryKey = handler.createTemporaryKey(tx)
    expect(temporaryKey.lock).toBe(lockAddresses[1])
    expect(temporaryKey.owner).toBe('0xDECADE')
    expect(
      approximatelyEquals(temporaryKey.expiration, expectedExpiration)
    ).toBeTruthy()
  })
})
