import {
  WalletServiceType,
  PaywallState,
  LocksmithTransactionsResult,
} from '../../../../data-iframe/blockchainHandler/blockChainTypes'
import BlockchainHandler from '../../../../data-iframe/blockchainHandler/BlockchainHandler'
import {
  defaultValuesOverride,
  setupTestDefaults,
  addresses,
} from '../../../test-helpers/setupBlockchainHelpers'

describe('BlockchainHandler - setUserMetadata', () => {
  let walletService: WalletServiceType
  let handler: BlockchainHandler

  type OptionalBlockchainValues = Partial<PaywallState>

  function setupDefaults(
    valuesOverride: OptionalBlockchainValues = defaultValuesOverride,
    jsonToFetch: { transactions?: LocksmithTransactionsResult[] } = {}
  ) {
    const defaults = setupTestDefaults(valuesOverride, jsonToFetch)
    walletService = defaults.walletService
    const web3Service = defaults.web3Service
    const emitError = defaults.emitError
    const emitChanges = defaults.emitChanges
    const store = defaults.store
    const constants = defaults.constants
    const configuration = defaults.configuration
    const fakeWindow = defaults.fakeWindow
    handler = new BlockchainHandler({
      walletService,
      web3Service,
      constants,
      emitChanges,
      emitError,
      window: fakeWindow,
    })

    handler.init(configuration, store)
  }

  describe('no account yet', () => {
    beforeEach(() => {
      setupDefaults()
    })

    it('should throw when attempting to set metadata', async () => {
      expect.assertions(1)

      await expect(
        handler.setUserMetadata('0xlockaddress', {})
      ).rejects.toEqual(
        '[BlockchainHandler] store.account is null, cannot set metadata'
      )
    })
  })

  describe('account is available', () => {
    beforeEach(() => {
      setupDefaults({ account: addresses[1] })
    })

    it('should resolve with a value on success', async () => {
      expect.assertions(1)

      walletService.setUserMetadata = jest.fn((_: any, callback) => {
        callback(undefined, 'success')
      })

      await expect(
        handler.setUserMetadata('0xlockaddress', {})
      ).resolves.toEqual('success')
    })

    it('should reject with an error on failure', async () => {
      expect.assertions(1)

      walletService.setUserMetadata = jest.fn((_: any, callback) => {
        callback(new Error('fail'), undefined)
      })

      await expect(
        handler.setUserMetadata('0xlockaddress', {})
      ).rejects.toEqual(new Error('fail'))
    })
  })
})
