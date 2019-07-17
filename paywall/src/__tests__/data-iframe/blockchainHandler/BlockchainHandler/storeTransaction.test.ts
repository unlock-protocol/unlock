import {
  Web3ServiceType,
  PaywallState,
  FetchWindow,
  ConstantsType,
  LocksmithTransactionsResult,
  TransactionDefaults,
  WalletServiceType,
  SetTimeoutWindow,
} from '../../../../data-iframe/blockchainHandler/blockChainTypes'
import {
  BlockchainTestDefaults,
  defaultValuesOverride,
  setupTestDefaults,
  addresses,
} from '../../../test-helpers/setupBlockchainHelpers'
import BlockchainHandler from '../../../../data-iframe/blockchainHandler/BlockchainHandler'
import { PaywallConfig } from '../../../../unlockTypes'

describe('setupBlockchainHandler - retrieveTransactions', () => {
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
  let defaultTransaction: TransactionDefaults

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

    defaultTransaction = {
      to: addresses[1],
      from: addresses[2],
      for: addresses[2],
      input: 'input',
      hash: 'hash',
      lock: addresses[1],
    }
  }

  function callStoreTransaction(
    transaction: TransactionDefaults = defaultTransaction
  ) {
    return handler.storeTransaction(transaction)
  }

  it('should not store transactions if there is no user account', async () => {
    expect.assertions(1)

    setupDefaults()

    await callStoreTransaction()

    expect(fakeWindow.fetch).not.toHaveBeenCalled()
  })

  describe('has user account', () => {
    beforeEach(() => {
      setupDefaults({ account: addresses[2] })
    })

    it('should call fetch with the correct url', async () => {
      expect.assertions(1)

      await callStoreTransaction()

      expect(fakeWindow.fetch).toHaveBeenCalledWith(
        `http://fun.times/transaction`,
        {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transactionHash: 'hash',
            sender: addresses[2],
            // when purchasing directly, who we purchase the key "for" is
            // also the "sender" whose wallet the funds came from
            for: addresses[2],
            recipient: addresses[1],
            data: 'input',
            chain: 1984,
          }),
        }
      )
    })
  })
})
