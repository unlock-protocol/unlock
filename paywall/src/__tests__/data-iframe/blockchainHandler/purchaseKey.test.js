import ensureWalletReady from '../../../data-iframe/blockchainHandler/ensureWalletReady'
import { setAccount } from '../../../data-iframe/blockchainHandler/account'
import {
  purchaseKey,
  processKeyPurchaseTransactions,
} from '../../../data-iframe/blockchainHandler/purchaseKey'
import { TRANSACTION_TYPES } from '../../../constants'
import { setNetwork } from '../../../data-iframe/blockchainHandler/network'

jest.mock('../../../data-iframe/blockchainHandler/ensureWalletReady', () =>
  jest.fn().mockResolvedValue()
)

describe('blockchainHandler purchaseKey', () => {
  let fakeWalletService
  describe('purchaseKey', () => {
    beforeEach(() => {
      fakeWalletService = {
        purchaseKey: jest.fn(),
      }
    })

    it('ensures wallet is ready first', async () => {
      expect.assertions(1)

      setAccount('account')
      await purchaseKey({
        walletService: fakeWalletService,
        window,
        lockAddress: 'lock',
        amountToSend: '1000',
      })
      expect(ensureWalletReady).toHaveBeenCalled()
    })

    it('calls purchaseKey with the lock, account, and the amount of eth to send', async () => {
      expect.assertions(1)

      setAccount('account')
      await purchaseKey({
        walletService: fakeWalletService,
        window,
        lockAddress: 'lock',
        amountToSend: '1000',
      })
      expect(fakeWalletService.purchaseKey).toHaveBeenCalledWith(
        'lock',
        'account',
        '1000'
      )
    })
  })

  describe('processKeyPurchaseTransaction', () => {
    let fakeWalletService
    let fakeWeb3Service

    function assertOnUpdates(expected, done) {
      let expectedIndex = 0
      return (newTransactions, newKeys) => {
        const [expectedTransactions, expectedKeys, desc] = expected[
          expectedIndex
        ]
        try {
          expect(newTransactions).toEqual(expectedTransactions)
          expect(newKeys).toEqual(expectedKeys)
        } catch (e) {
          // eslint-disable-next-line
          console.log(`failure on ${desc}`)
          throw e
        }
        if (++expectedIndex > expected.length - 1) done()
      }
    }

    beforeEach(() => {
      fakeWalletService = {
        handlers: {},
        addListener: (type, cb) => (fakeWalletService.handlers[type] = cb),
        removeListener: type => {
          delete fakeWalletService.handlers[type]
        },
        once: (type, cb) => (fakeWalletService.handlers[type] = cb),
      }
      fakeWeb3Service = {
        handlers: {},
        addListener: (type, cb) => (fakeWeb3Service.handlers[type] = cb),
        removeListener: type => {
          delete fakeWeb3Service.handlers[type]
        },
        once: (type, cb) => (fakeWeb3Service.handlers[type] = cb),
      }
    })

    it('calls submit handler', async done => {
      expect.assertions(2)

      setNetwork(1)
      setAccount('account')
      const transactions = {}
      const keys = {
        'lock-account': {
          id: 'lock-account',
          lock: 'lock',
          owner: 'account',
          expiration: 0,
          transactions: [],
          status: 'none',
          confirmations: 0,
        },
      }
      // expected values to be sent to the updater
      const submittedTransaction = {
        blockNumber: Number.MAX_SAFE_INTEGER,
        confirmations: 0,
        from: 'account',
        hash: 'hash',
        input: 'input',
        key: 'lock-account',
        lock: 'lock',
        network: 1,
        status: 'submitted',
        to: 'lock',
        type: TRANSACTION_TYPES.KEY_PURCHASE,
      }
      const expected = [
        [
          {
            hash: submittedTransaction,
          },
          {
            'lock-account': {
              confirmations: 0,
              expiration: 0,
              id: 'lock-account',
              lock: 'lock',
              owner: 'account',
              status: 'submitted',
              transactions: [submittedTransaction],
            },
          },
        ],
      ]
      const update = assertOnUpdates(expected, done)

      processKeyPurchaseTransactions({
        walletService: fakeWalletService,
        web3Service: fakeWeb3Service,
        startingTransactions: transactions,
        startingKeys: keys,
        lockAddress: 'lock',
        requiredConfirmations: 3,
        update,
      })

      // wait for the transaction.once handler to be called before we call it
      await new Promise(resolve => {
        const interval = setInterval(() => {
          if (fakeWalletService.handlers['transaction.new']) {
            resolve()
            clearInterval(interval)
          }
        })
      })

      fakeWalletService.handlers['transaction.new'](
        'hash' /* transaction hash */,
        'account' /* from */,
        'lock' /* to */,
        'input' /* input */,
        TRANSACTION_TYPES.KEY_PURCHASE /* type */,
        'submitted' /* status */
      )
    })

    it('continues to updates after submitted', async done => {
      expect.assertions(4)

      setNetwork(1)
      setAccount('account')
      const transactions = {}
      const keys = {
        'lock-account': {
          id: 'lock-account',
          lock: 'lock',
          owner: 'account',
          expiration: 0,
          transactions: [],
          status: 'none',
          confirmations: 0,
        },
      }
      // expected values to be sent to the updater
      const submittedTransaction = {
        blockNumber: Number.MAX_SAFE_INTEGER,
        confirmations: 0,
        from: 'account',
        hash: 'hash',
        input: 'input',
        key: 'lock-account',
        lock: 'lock',
        network: 1,
        status: 'submitted',
        to: 'lock',
        type: TRANSACTION_TYPES.KEY_PURCHASE,
      }
      const submittedKey = {
        confirmations: 0,
        expiration: 0,
        id: 'lock-account',
        lock: 'lock',
        owner: 'account',
        status: 'submitted',
        transactions: [submittedTransaction],
      }
      const pendingTransaction = {
        ...submittedTransaction,
        status: 'pending',
        blockNumber: 123,
      }
      const pendingKey = {
        ...submittedKey,
        transactions: [pendingTransaction],
        status: 'pending',
      }
      const expected = [
        [
          // submitted transaction
          {
            hash: submittedTransaction,
          },
          {
            'lock-account': submittedKey,
          },
          'submitted transaction',
        ],
        [
          // update
          {
            hash: pendingTransaction,
          },
          {
            'lock-account': pendingKey,
          },
          'pending transaction',
        ],
      ]
      const update = assertOnUpdates(expected, done)

      processKeyPurchaseTransactions({
        walletService: fakeWalletService,
        web3Service: fakeWeb3Service,
        startingTransactions: transactions,
        startingKeys: keys,
        lockAddress: 'lock',
        requiredConfirmations: 3,
        update,
      })

      // wait for the transaction.once handler to be called before we call it
      await new Promise(resolve => {
        const interval = setInterval(() => {
          if (fakeWalletService.handlers['transaction.new']) {
            resolve()
            clearInterval(interval)
          }
        })
      })

      fakeWalletService.handlers['transaction.new'](
        'hash' /* transaction hash */,
        'account' /* from */,
        'lock' /* to */,
        'input' /* input */,
        TRANSACTION_TYPES.KEY_PURCHASE /* type */,
        'submitted' /* status */
      )

      // wait for the transaction.once handler to be called before we call it
      await new Promise(resolve => {
        const interval = setInterval(() => {
          if (fakeWeb3Service.handlers['transaction.updated']) {
            resolve()
            clearInterval(interval)
          }
        })
      })

      fakeWeb3Service.handlers['transaction.updated']('hash', {
        status: 'pending',
        blockNumber: 123,
      })
    })

    it('skips submitted, goes straight to updates if transaction exists', async done => {
      expect.assertions(2)

      setNetwork(1)
      setAccount('account')
      const submittedTransaction = {
        blockNumber: Number.MAX_SAFE_INTEGER,
        confirmations: 0,
        from: 'account',
        hash: 'hash',
        input: 'input',
        key: 'lock-account',
        lock: 'lock',
        network: 1,
        status: 'submitted',
        to: 'lock',
        type: TRANSACTION_TYPES.KEY_PURCHASE,
      }
      const transactions = {
        hash: submittedTransaction,
      }
      const keys = {
        'lock-account': {
          id: 'lock-account',
          lock: 'lock',
          owner: 'account',
          expiration: 0,
          transactions: [],
          status: 'none',
          confirmations: 0,
        },
      }
      // expected values to be sent to the updater
      const submittedKey = {
        confirmations: 0,
        expiration: 0,
        id: 'lock-account',
        lock: 'lock',
        owner: 'account',
        status: 'submitted',
        transactions: [submittedTransaction],
      }
      const pendingTransaction = {
        ...submittedTransaction,
        status: 'pending',
        blockNumber: 123,
      }
      const pendingKey = {
        ...submittedKey,
        transactions: [pendingTransaction],
        status: 'pending',
      }
      const expected = [
        [
          // update
          {
            hash: pendingTransaction,
          },
          {
            'lock-account': pendingKey,
          },
          'pending transaction',
        ],
      ]
      const update = assertOnUpdates(expected, done)

      processKeyPurchaseTransactions({
        walletService: fakeWalletService,
        web3Service: fakeWeb3Service,
        startingTransactions: transactions,
        startingKeys: keys,
        lockAddress: 'lock',
        requiredConfirmations: 3,
        update,
      })

      // wait for the transaction.once handler to be called before we call it
      await new Promise(resolve => {
        const interval = setInterval(() => {
          if (fakeWeb3Service.handlers['transaction.updated']) {
            resolve()
            clearInterval(interval)
          }
        })
      })

      fakeWeb3Service.handlers['transaction.updated']('hash', {
        status: 'pending',
        blockNumber: 123,
      })
    })

    it('works with confirming transaction', async done => {
      expect.assertions(2)

      setNetwork(1)
      setAccount('account')
      const submittedTransaction = {
        blockNumber: Number.MAX_SAFE_INTEGER,
        confirmations: 0,
        from: 'account',
        hash: 'hash',
        input: 'input',
        key: 'lock-account',
        lock: 'lock',
        network: 1,
        status: 'submitted',
        to: 'lock',
        type: TRANSACTION_TYPES.KEY_PURCHASE,
      }
      const submittedKey = {
        confirmations: 0,
        expiration: new Date().getTime() / 1000 + 1000,
        id: 'lock-account',
        lock: 'lock',
        owner: 'account',
        status: 'submitted',
        transactions: [submittedTransaction],
      }
      const transactions = {
        hash: submittedTransaction,
      }
      const keys = {
        'lock-account': submittedKey,
      }
      // expected values to be sent to the updater
      const confirmingTransaction = {
        ...submittedTransaction,
        status: 'mined',
        confirmations: 1,
        blockNumber: 123,
      }
      const confirmingKey = {
        ...submittedKey,
        transactions: [confirmingTransaction],
        confirmations: 1,
        status: 'confirming',
      }
      const expected = [
        [
          // update
          {
            hash: confirmingTransaction,
          },
          {
            'lock-account': confirmingKey,
          },
          'confirming transaction',
        ],
      ]
      const update = assertOnUpdates(expected, done)

      processKeyPurchaseTransactions({
        walletService: fakeWalletService,
        web3Service: fakeWeb3Service,
        startingTransactions: transactions,
        startingKeys: keys,
        lockAddress: 'lock',
        requiredConfirmations: 3,
        update,
      })

      // wait for the transaction.once handler to be called before we call it
      await new Promise(resolve => {
        const interval = setInterval(() => {
          if (fakeWeb3Service.handlers['transaction.updated']) {
            resolve()
            clearInterval(interval)
          }
        })
      })

      fakeWeb3Service.handlers['transaction.updated']('hash', {
        status: 'mined',
        confirmations: 1,
        blockNumber: 123,
      })
    })

    it('works with confirmed transaction', async () => {
      expect.assertions(1)

      setNetwork(1)
      setAccount('account')
      const confirmedTransaction = {
        blockNumber: 123,
        confirmations: 500,
        from: 'account',
        hash: 'hash',
        input: 'input',
        key: 'lock-account',
        lock: 'lock',
        network: 1,
        status: 'mined',
        to: 'lock',
        type: TRANSACTION_TYPES.KEY_PURCHASE,
      }
      const startingKey = {
        confirmations: 500,
        expiration: new Date().getTime() / 1000 + 1000,
        id: 'lock-account',
        lock: 'lock',
        owner: 'account',
        status: 'submitted',
        transactions: [confirmedTransaction],
      }
      const transactions = {
        hash: confirmedTransaction,
      }
      const keys = {
        'lock-account': startingKey,
      }
      const update = jest.fn()

      await processKeyPurchaseTransactions({
        walletService: fakeWalletService,
        web3Service: fakeWeb3Service,
        startingTransactions: transactions,
        startingKeys: keys,
        lockAddress: 'lock',
        requiredConfirmations: 3,
        update,
      })

      expect(update).not.toHaveBeenCalled()
    })

    it('if key is expired, listens for newly submitted transaction', async done => {
      expect.assertions(2)

      setNetwork(1)
      setAccount('account')
      const expiredTransaction = {
        blockNumber: 123,
        confirmations: 500,
        from: 'account',
        hash: 'hash',
        input: 'input',
        key: 'lock-account',
        lock: 'lock',
        network: 1,
        status: 'mined',
        to: 'lock',
        type: TRANSACTION_TYPES.KEY_PURCHASE,
      }
      const expiredKey = {
        confirmations: 0,
        expiration: new Date().getTime() / 1000 - 1000,
        id: 'lock-account',
        lock: 'lock',
        owner: 'account',
        status: 'valid',
        transactions: [expiredTransaction],
      }
      const transactions = {
        hash: expiredTransaction,
      }
      const keys = {
        'lock-account': expiredKey,
      }
      // expected values to be sent to the updater
      const submittedTransaction = {
        blockNumber: Number.MAX_SAFE_INTEGER,
        confirmations: 0,
        from: 'account',
        hash: 'hash',
        input: 'input',
        key: 'lock-account',
        lock: 'lock',
        network: 1,
        status: 'submitted',
        to: 'lock',
        type: TRANSACTION_TYPES.KEY_PURCHASE,
      }
      const submittedKey = {
        ...expiredKey,
        transactions: [submittedTransaction],
        status: 'submitted',
      }
      const expected = [
        [
          {
            hash: submittedTransaction,
          },
          {
            'lock-account': submittedKey,
          },
          'submitted transaction after expire',
        ],
      ]
      const update = assertOnUpdates(expected, done)

      processKeyPurchaseTransactions({
        walletService: fakeWalletService,
        web3Service: fakeWeb3Service,
        startingTransactions: transactions,
        startingKeys: keys,
        lockAddress: 'lock',
        requiredConfirmations: 3,
        update,
      })

      // wait for the transaction.once handler to be called before we call it
      await new Promise(resolve => {
        const interval = setInterval(() => {
          if (fakeWalletService.handlers['transaction.new']) {
            resolve()
            clearInterval(interval)
          }
        })
      })

      fakeWalletService.handlers['transaction.new'](
        'hash' /* transaction hash */,
        'account' /* from */,
        'lock' /* to */,
        'input' /* input */,
        TRANSACTION_TYPES.KEY_PURCHASE /* type */,
        'submitted' /* status */
      )
    })
  })
})
