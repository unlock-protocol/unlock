import {
  Web3ServiceType,
  BlockchainValues,
  FetchWindow,
  ConstantsType,
  LocksmithTransactionsResult,
  TransactionDefaults,
} from '../../../../data-iframe/blockchainHandler/blockChainTypes'
import { getWeb3Service } from '../../../test-helpers/setupBlockchainHelpers'
import {
  retrieveTransactions,
  RetrieveTransactionsParams,
} from '../../../../data-iframe/blockchainHandler/setupBlockchainHandler'

describe('setupBlockchainHandler - retrieveTransactions', () => {
  let web3Service: Web3ServiceType
  let fakeWindow: FetchWindow
  let listeners: { [key: string]: Function }
  let emitError: (error: Error) => void
  let values: BlockchainValues
  const constants: ConstantsType = {
    requiredConfirmations: 12,
    locksmithHost: 'http://fun.times',
    unlockAddress: '0x123',
    blockTime: 5000,
    readOnlyProvider: 'http://readonly',
    defaultNetwork: 1,
  }
  const addresses = [
    '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
    '0x15B87bdC4B3ecb783F56f735653332EAD3BCa5F8',
    '0xBF7F1bdB3a2D6c318603FFc8f39974e597b6af5e',
  ]
  const lockAddresses = addresses.map(address => address.toLowerCase())

  type optionalBlockchainValues = Partial<BlockchainValues>

  function setupDefaults(
    valuesOverride: optionalBlockchainValues = {
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
    }
    listeners = {}
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
    emitError = jest.fn()
  }

  function callRetrieveTransactions(
    params: Partial<RetrieveTransactionsParams> = {}
  ) {
    return retrieveTransactions({
      lockAddresses,
      constants,
      web3Service,
      window: fakeWindow,
      values,
      emitError,
      ...params,
    })
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
            chain: 1,
            recipient: addresses[0],
            data: 'hi',
            sender: addresses[1],
            for: addresses[2],
          },
          {
            transactionHash: 'hash2',
            chain: 1,
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
          network: 1,
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
