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
  lockAddresses,
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
  }

  function callRetrieveTransactions() {
    return handler.retrieveTransactions()
  }

  it('should not fetch transactions if there is no user account', async () => {
    expect.assertions(1)

    setupDefaults()

    await callRetrieveTransactions()

    expect(fakeWindow.fetch).not.toHaveBeenCalled()
  })

  describe('has user account', () => {
    beforeEach(() => {
      setupDefaults({ account: addresses[2] })
    })

    it('should call fetch with the correct url', async () => {
      expect.assertions(1)

      await callRetrieveTransactions()

      expect(fakeWindow.fetch).toHaveBeenCalledWith(
        `http://fun.times/transactions?for=${addresses[2]}&recipient[]=${lockAddresses[0]}&recipient[]=${lockAddresses[1]}&recipient[]=${lockAddresses[2]}`
      )
    })

    it('should not call getTransaction if no results are returned', async () => {
      expect.assertions(1)

      await callRetrieveTransactions()

      expect(web3Service.getTransaction).not.toHaveBeenCalled()
    })

    describe('individual transactions', () => {
      let returnedTransactions: {
        transactions?: LocksmithTransactionsResult[]
      } = {
        transactions: [
          {
            transactionHash: 'hash1',
            chain: 1984,
            recipient: addresses[0],
            data: 'hi',
            sender: addresses[1],
            for: addresses[2],
          },
          {
            transactionHash: 'hash2',
            chain: 1984,
            recipient: addresses[1],
            data: null,
            sender: addresses[2],
            for: addresses[2],
          },
        ],
      }
      beforeEach(() => {
        setupDefaults({ account: addresses[2] }, returnedTransactions)
      })

      it('should call getTransaction for each transaction', async () => {
        expect.assertions(1)

        await callRetrieveTransactions()

        expect(web3Service.getTransaction).toHaveBeenCalledTimes(2)
      })

      it('should pass the transaction as defaults if input is present', async () => {
        expect.assertions(2)

        await callRetrieveTransactions()

        const transaction1 = (returnedTransactions.transactions &&
          returnedTransactions.transactions[0]) as LocksmithTransactionsResult
        const defaults: TransactionDefaults = {
          to: transaction1.recipient,
          from: transaction1.sender,
          for: transaction1.for,
          input: transaction1.data,
          hash: 'hash1',
          network: 1984,
        }

        expect(web3Service.getTransaction).toHaveBeenNthCalledWith(
          1,
          'hash1',
          defaults
        )
        expect(web3Service.getTransaction).toHaveBeenNthCalledWith(
          2,
          'hash2',
          undefined
        )
      })

      it('should pass on errors to emitError', async () => {
        expect.assertions(1)

        const error = new Error('fail')

        const mock: any = web3Service.getTransaction as any

        mock.mockImplementationOnce(() => Promise.reject(error))

        await callRetrieveTransactions()

        expect(emitError).toHaveBeenCalledWith(error)
      })
    })
  })
})
