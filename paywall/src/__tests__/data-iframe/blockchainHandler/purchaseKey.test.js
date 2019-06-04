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
      expect(ensureWalletReady).toHaveBeenCalledWith(fakeWalletService)
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
    let newKeys
    let fakeWindow

    function assertOnUpdates(expected, done) {
      let expectedIndex = 0
      return ({ transaction: newTransaction, key: newKey }) => {
        const [expectedTransaction, expectedKey, desc] = expected[expectedIndex]
        try {
          expect(newTransaction).toEqual(expectedTransaction)
          expect(newKey).toEqual(expectedKey)
        } catch (e) {
          // eslint-disable-next-line
          console.log(`failure on ${desc}`)
          throw e
        }
        if (++expectedIndex > expected.length - 1) done()
      }
    }

    beforeEach(() => {
      newKeys = {}
      fakeWalletService = {
        handlers: {},
        on: (type, cb) => (fakeWalletService.handlers[type] = cb),
        addListener: (type, cb) => (fakeWalletService.handlers[type] = cb),
        off: type => delete fakeWalletService.handlers[type],
        removeListener: type => {
          delete fakeWalletService.handlers[type]
        },
        once: (type, cb) => (fakeWalletService.handlers[type] = cb),
      }
      fakeWeb3Service = {
        handlers: {},
        on: (type, cb) => (fakeWeb3Service.handlers[type] = cb),
        addListener: (type, cb) => (fakeWeb3Service.handlers[type] = cb),
        off: type => delete fakeWeb3Service.handlers[type],
        removeListener: type => {
          delete fakeWeb3Service.handlers[type]
        },
        getTransaction: jest.fn(),
        once: (type, cb) => (fakeWeb3Service.handlers[type] = cb),
        getKeyByLockForOwner: jest.fn(lock => newKeys[lock]),
      }
      fakeWindow = {
        storage: {},
        fetch: jest.fn(),
        localStorage: {
          getItem: jest.fn(key => fakeWindow.storage[key]),
          setItem: jest.fn((key, value) => {
            if (typeof value !== 'string') {
              throw new Error('localStorage only supports strings')
            }
            fakeWindow.storage[key] = value
          }),
          removeItem: jest.fn(key => {
            delete fakeWindow.storage[key]
          }),
        },
      }
    })

    it('calls submit handler', async done => {
      expect.assertions(2)

      setNetwork(1)
      setAccount('account')
      const transactions = {}
      const key = {
        id: 'lock-account',
        lock: 'lock',
        owner: 'account',
        expiration: 0,
      }
      newKeys.lock = key
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
          submittedTransaction,
          {
            expiration: 0,
            id: 'lock-account',
            lock: 'lock',
            owner: 'account',
          },
        ],
      ]
      const update = assertOnUpdates(expected, done)

      processKeyPurchaseTransactions({
        walletService: fakeWalletService,
        web3Service: fakeWeb3Service,
        startingTransactions: transactions,
        startingKey: key,
        lockAddress: 'lock',
        requiredConfirmations: 3,
        update,
        window: fakeWindow,
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

    it('throws on error in listening for submitted transaction', async done => {
      expect.assertions(1)

      setNetwork(1)
      setAccount('account')
      const transactions = {}
      const key = {
        id: 'lock-account',
        lock: 'lock',
        owner: 'account',
        expiration: 0,
      }
      const update = jest.fn()

      processKeyPurchaseTransactions({
        walletService: fakeWalletService,
        web3Service: fakeWeb3Service,
        startingTransactions: transactions,
        startingKey: key,
        lockAddress: 'lock',
        requiredConfirmations: 3,
        update,
        window: fakeWindow,
      }).catch(e => {
        expect(e).toBeInstanceOf(Error)
        done()
      })

      // wait for the transaction.once handler to be called before we call it
      await new Promise(resolve => {
        const interval = setInterval(() => {
          if (fakeWalletService.handlers.error) {
            resolve()
            clearInterval(interval)
          }
        })
      })

      fakeWalletService.handlers.error(new Error('fail'))
    })

    it('skips submitted, starts polling if transaction exists', async () => {
      expect.assertions(1)

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
      const key = {
        id: 'lock-account',
        lock: 'lock',
        owner: 'account',
        expiration: 0,
      }
      newKeys = {
        lock: key,
      }
      const update = () => {
        expect(false).toBe(true) // this should not be called
      }
      fakeWeb3Service.getTransaction = jest.fn()

      await processKeyPurchaseTransactions({
        walletService: fakeWalletService,
        web3Service: fakeWeb3Service,
        startingTransactions: transactions,
        startingKey: key,
        lockAddress: 'lock',
        requiredConfirmations: 3,
        update,
        window: fakeWindow,
      })

      expect(fakeWeb3Service.getTransaction).toHaveBeenCalledWith('hash')
    })

    it('works with confirming transaction', async () => {
      expect.assertions(1)

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
      const key = {
        expiration: new Date().getTime() / 1000 + 1000,
        id: 'lock-account',
        lock: 'lock',
        owner: 'account',
      }
      newKeys.lock = key
      const transactions = {
        hash: submittedTransaction,
      }
      const update = () => {
        expect(false).toBe(true) // this should not be called
      }
      fakeWeb3Service.getTransaction = jest.fn()

      await processKeyPurchaseTransactions({
        walletService: fakeWalletService,
        web3Service: fakeWeb3Service,
        startingTransactions: transactions,
        startingKey: key,
        lockAddress: 'lock',
        requiredConfirmations: 3,
        update,
        window: fakeWindow,
      })

      expect(fakeWeb3Service.getTransaction).toHaveBeenCalledWith('hash')
    })

    it('works with confirmed transaction', async () => {
      expect.assertions(2)

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
      const key = {
        expiration: new Date().getTime() / 1000 + 1000,
        id: 'lock-account',
        lock: 'lock',
        owner: 'account',
      }
      const transactions = {
        hash: confirmedTransaction,
      }
      newKeys.lock = key
      const update = jest.fn()

      fakeWalletService.removeListener = jest.fn(
        fakeWalletService.removeListener
      )
      await processKeyPurchaseTransactions({
        walletService: fakeWalletService,
        web3Service: fakeWeb3Service,
        startingTransactions: transactions,
        startingKey: key,
        lockAddress: 'lock',
        requiredConfirmations: 3,
        update,
        window: fakeWindow,
      })

      expect(update).not.toHaveBeenCalled()
      expect(fakeWalletService.removeListener).toHaveBeenCalled()
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
      const key = {
        expiration: new Date().getTime() / 1000 - 1000,
        id: 'lock-account',
        lock: 'lock',
        owner: 'account',
      }
      newKeys.lock = {
        ...key,
        expiration: 0,
      }
      const transactions = {
        hash: expiredTransaction,
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
          submittedTransaction,
          newKeys.lock,
          'submitted transaction after expire',
        ],
      ]
      const update = assertOnUpdates(expected, done)

      processKeyPurchaseTransactions({
        walletService: fakeWalletService,
        web3Service: fakeWeb3Service,
        startingTransactions: transactions,
        startingKey: key,
        lockAddress: 'lock',
        requiredConfirmations: 3,
        update,
        window: fakeWindow,
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
