import ensureWalletReady from '../../../data-iframe/blockchainHandler/ensureWalletReady'
import { setAccount } from '../../../data-iframe/blockchainHandler/account'
import {
  purchaseKey,
  processKeyPurchaseTransaction,
  pollForKeyPurchaseTransaction,
} from '../../../data-iframe/blockchainHandler/purchaseKey'
import { setNetwork } from '../../../data-iframe/blockchainHandler/network'
import { TRANSACTION_TYPES } from '../../../constants'
import pollForChanges from '../../../data-iframe/blockchainHandler/pollForChanges'

jest.mock('../../../data-iframe/blockchainHandler/ensureWalletReady', () =>
  jest.fn().mockResolvedValue()
)
jest.mock('../../../data-iframe/blockchainHandler/pollForChanges')

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
      await purchaseKey(fakeWalletService, window, 'lock')
      expect(ensureWalletReady).toHaveBeenCalled()
    })

    it('calls purchaseKey with the lock, account, and the amount of eth to send', async () => {
      expect.assertions(1)

      setAccount('account')
      await purchaseKey(fakeWalletService, window, 'lock', '1000')
      expect(fakeWalletService.purchaseKey).toHaveBeenCalledWith(
        'lock',
        'account',
        '1000'
      )
    })
  })

  describe('processKeyPurchaseTransaction', () => {
    const transactions = {
      hash: 'hi',
    }
    const keys = {
      key: 'hi',
    }
    let fakeWalletService
    beforeEach(() => {
      fakeWalletService = {
        handlers: {},
        once: (type, cb) => (fakeWalletService.handlers[type] = cb),
      }
      setAccount('account')
      setNetwork(1)
    })

    it('sends update on transaction.pending', async done => {
      expect.assertions(3)
      const onTransactionUpdate = (t, k, status) => {
        expect(t).toEqual(transactions)
        expect(k).toEqual({
          ...keys,
          'lock-account': {
            id: 'lock-account',
            lock: 'lock',
            owner: 'account',
            expiration: 0,
            status: 'pending',
            transactions: {
              pending: {
                status: 'pending',
                type: TRANSACTION_TYPES.KEY_PURCHASE,
                lock: 'lock',
                key: 'lock-account',
                confirmations: 0,
              },
            },
          },
        })
        expect(status).toBe('pending')
        done()
      }
      processKeyPurchaseTransaction({
        walletService: fakeWalletService,
        lock: 'lock',
        existingTransactions: transactions,
        existingKeys: keys,
        onTransactionUpdate,
      })

      fakeWalletService.handlers['transaction.pending'](
        'new',
        TRANSACTION_TYPES.KEY_PURCHASE
      )
    })

    it('ignores pending transactions for other transaction types', async done => {
      expect.assertions(3)
      const onTransactionUpdate = (t, k, status) => {
        expect(t).toEqual(transactions)
        expect(k).toEqual({
          ...keys,
          'lock-account': {
            id: 'lock-account',
            lock: 'lock',
            owner: 'account',
            expiration: 0,
            status: 'pending',
            transactions: {
              pending: {
                status: 'pending',
                type: TRANSACTION_TYPES.KEY_PURCHASE,
                lock: 'lock',
                key: 'lock-account',
                confirmations: 0,
              },
            },
          },
        })
        expect(status).toBe('pending')
        done()
      }
      processKeyPurchaseTransaction({
        walletService: fakeWalletService,
        lock: 'lock',
        existingTransactions: transactions,
        existingKeys: keys,
        onTransactionUpdate,
      })

      fakeWalletService.handlers['transaction.pending'](
        'new',
        TRANSACTION_TYPES.WITHDRAWAL
      )
      await Promise.resolve()

      fakeWalletService.handlers['transaction.pending'](
        'new',
        TRANSACTION_TYPES.KEY_PURCHASE
      )
    })

    it('sends update on transaction.new', async () => {
      expect.assertions(4)
      const onTransactionUpdate = jest.fn()

      processKeyPurchaseTransaction({
        walletService: fakeWalletService,
        lock: 'lock',
        existingTransactions: transactions,
        existingKeys: keys,
        onTransactionUpdate,
      })

      fakeWalletService.handlers['transaction.pending'](
        'new',
        TRANSACTION_TYPES.KEY_PURCHASE
      )

      await Promise.resolve()
      fakeWalletService.handlers['transaction.new'](
        'hash',
        'from',
        'to',
        'input',
        'type',
        'submitted'
      )
      await Promise.resolve()

      expect(onTransactionUpdate).toHaveBeenCalledTimes(2)
      const call2 = onTransactionUpdate.mock.calls[1]
      const [newTransactions, newKeys, newStatus] = call2
      expect(newTransactions).toEqual({
        ...transactions,
        hash: {
          hash: 'hash',
          lock: 'lock',
          key: 'lock-account',
          confirmations: 0,
          from: 'from',
          to: 'to',
          input: 'input',
          type: 'type',
          status: 'submitted',
          network: 1,
        },
      })
      expect(newKeys).toEqual({
        ...keys,
        'lock-account': {
          id: 'lock-account',
          lock: 'lock',
          owner: 'account',
          expiration: 0,
          status: 'submitted',
          transactions: {
            hash: newTransactions.hash,
          },
        },
      })
      expect(newStatus).toBe('submitted')
    })

    it('returns the transactions and keys with the new transaction', async done => {
      expect.assertions(3)
      const onTransactionUpdate = jest.fn()
      const newTransaction = {
        hash: 'hash',
        lock: 'lock',
        key: 'lock-account',
        confirmations: 0,
        from: 'from',
        to: 'to',
        input: 'input',
        type: 'type',
        status: 'submitted',
        network: 1,
      }

      processKeyPurchaseTransaction({
        walletService: fakeWalletService,
        lock: 'lock',
        existingTransactions: transactions,
        existingKeys: keys,
        onTransactionUpdate,
      }).then(info => {
        expect(info.transactions).toEqual({
          ...transactions,
          hash: newTransaction,
        })
        expect(info.keys).toEqual({
          ...keys,
          'lock-account': {
            id: 'lock-account',
            lock: 'lock',
            owner: 'account',
            expiration: 0,
            status: 'submitted',
            transactions: {
              hash: newTransaction,
            },
          },
        })
        expect(info.status).toBe('submitted')
        done()
      })

      fakeWalletService.handlers['transaction.pending'](
        'new',
        TRANSACTION_TYPES.KEY_PURCHASE
      )

      await Promise.resolve()
      fakeWalletService.handlers['transaction.new'](
        'hash',
        'from',
        'to',
        'input',
        'type',
        'submitted'
      )
      await Promise.resolve()
    })
  })

  describe('pollForKeyPurchaseTransaction', () => {
    const hash = 'hash'
    const startingTransaction = {
      hash: 'hash',
      lock: 'lock',
      key: 'lock-account',
      confirmations: 0,
      from: 'from',
      to: 'to',
      input: 'input',
      type: 'type',
      status: 'submitted',
      network: 1,
    }
    const existingTransactions = {
      hash: startingTransaction,
    }
    const existingKeys = {
      'lock-account': {
        id: 'lock-account',
        lock: 'lock',
        owner: 'account',
        expiration: 0,
        status: 'submitted',
        transactions: {
          hash: startingTransaction,
        },
      },
    }
    const requiredConfirmations = 3
    const lock = 'lock'
    const onTransactionUpdate = () => {}
    beforeEach(() => {
      pollForChanges.mockReset()
    })

    it('calls getTransaction to start the polling', async () => {
      expect.assertions(1)
      const web3Service = {
        handlers: {},
        getTransaction: jest.fn(),
        once: (type, cb) => (web3Service.handlers[type] = cb),
      }

      await pollForKeyPurchaseTransaction({
        web3Service,
        hash,
        existingTransactions,
        existingKeys,
        requiredConfirmations,
        lock,
        onTransactionUpdate,
      })
      expect(web3Service.getTransaction).toHaveBeenCalledWith('hash')
    })

    it('getCurrentValue resolves on transaction.updated', async done => {
      expect.assertions(1)
      const web3Service = {
        handlers: {},
        getTransaction: jest.fn(),
        once: (type, cb) => (web3Service.handlers[type] = cb),
      }

      await pollForKeyPurchaseTransaction({
        web3Service,
        hash,
        existingTransactions,
        existingKeys,
        requiredConfirmations,
        lock,
        onTransactionUpdate,
      })

      const getCurrentValue = pollForChanges.mock.calls[0][0]

      getCurrentValue().then(values => {
        expect(values).toEqual(existingTransactions.hash)
        done()
      })

      web3Service.handlers['transaction.updated']('hi', {})
    })

    it('hasValueChanged checks for transaction value changes', async () => {
      expect.assertions(3)
      const web3Service = {
        handlers: {},
        getTransaction: jest.fn(),
        once: (type, cb) => (web3Service.handlers[type] = cb),
      }

      await pollForKeyPurchaseTransaction({
        web3Service,
        hash,
        existingTransactions,
        existingKeys,
        requiredConfirmations,
        lock,
        onTransactionUpdate,
      })

      const hasValueChanged = pollForChanges.mock.calls[0][1]

      expect(hasValueChanged({ one: 'two' }, { one: 'two' })).toBeFalsy()
      expect(hasValueChanged({ one: 'two' }, { one: 'three' })).toBeTruthy()
      expect(
        hasValueChanged({ one: 'two' }, { one: 'two', two: 'three' })
      ).toBeTruthy()
    })

    it('continuePolling responds to confirmations', async () => {
      expect.assertions(3)
      const web3Service = {
        handlers: {},
        getTransaction: jest.fn(),
        once: (type, cb) => (web3Service.handlers[type] = cb),
      }

      await pollForKeyPurchaseTransaction({
        web3Service,
        hash,
        existingTransactions,
        existingKeys,
        requiredConfirmations,
        lock,
        onTransactionUpdate,
      })

      const continuePolling = pollForChanges.mock.calls[0][2]

      expect(continuePolling({ confirmations: 1 })).toBeTruthy()
      expect(continuePolling({ confirmations: 2 })).toBeTruthy()
      expect(continuePolling({ confirmations: 3 })).toBeFalsy()
    })

    it('changeListener updates the transactions, keys and returns status', async done => {
      expect.assertions(3)
      const web3Service = {
        handlers: {},
        getTransaction: jest.fn(),
        once: (type, cb) => (web3Service.handlers[type] = cb),
      }
      const onTransactionUpdate = (t, k, s) => {
        expect(t).toEqual({
          ...existingTransactions,
          hash: {
            hi: 'there',
            status: 'confirmed',
          },
        })
        expect(k).toEqual({
          ...existingKeys,
          'lock-account': {
            ...existingKeys['lock-account'],
            status: 'confirmed',
            transactions: {
              hash: { hi: 'there', status: 'confirmed' },
            },
          },
        })
        expect(s).toBe('confirmed')
        done()
      }

      await pollForKeyPurchaseTransaction({
        web3Service,
        hash,
        existingTransactions,
        existingKeys,
        requiredConfirmations,
        lock,
        onTransactionUpdate,
      })

      const changeListener = pollForChanges.mock.calls[0][3]

      changeListener({ hi: 'there', status: 'confirmed' })
    })

    it('returns the transactions and keys with the new transaction', async () => {
      expect.assertions(2)
      const web3Service = {
        handlers: {},
        getTransaction: jest.fn(),
        once: (type, cb) => (web3Service.handlers[type] = cb),
      }

      const ret = await pollForKeyPurchaseTransaction({
        web3Service,
        hash,
        existingTransactions,
        existingKeys,
        requiredConfirmations,
        lock,
        onTransactionUpdate,
      })
      expect(ret.transactions).toEqual(existingTransactions)
      expect(ret.keys).toEqual(existingKeys)
    })
  })
})
