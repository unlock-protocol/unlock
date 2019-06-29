import {
  isValidKey,
  getKeyStatus,
  linkTransactionsToKeys,
  linkTransactionsToKey,
} from '../../../data-iframe/blockchainHandler/keyStatus'
import { setAccount } from '../../../data-iframe/blockchainHandler/account'
import { MAX_UINT, TRANSACTION_TYPES } from '../../../constants'

describe('key status manipulation', () => {
  describe('isValidKey', () => {
    it('returns true when expiration is in the future', () => {
      expect.assertions(1)

      expect(
        isValidKey({ expiration: new Date().getTime() / 1000 + 100 })
      ).toBe(true)
    })

    it('returns false when expiration is in the past', () => {
      expect.assertions(1)

      expect(
        isValidKey({ expiration: new Date().getTime() / 1000 - 100 })
      ).toBe(false)
    })
  })

  describe('getKeyStatus', () => {
    describe('no transactions', () => {
      it('valid', () => {
        expect.assertions(1)

        expect(
          getKeyStatus({ expiration: new Date().getTime() / 1000 + 100 }, 1)
        ).toBe('valid')
      })

      it('none', () => {
        expect.assertions(1)

        expect(
          getKeyStatus({ expiration: new Date().getTime() / 1000 - 100 }, 1)
        ).toBe('none')
      })
    })

    it('none', () => {
      expect.assertions(1)

      expect(
        getKeyStatus(
          { expiration: new Date().getTime() / 1000 + 100, transactions: [{}] },
          1
        )
      ).toBe('none')
    })

    it('pending', () => {
      expect.assertions(1)

      expect(
        getKeyStatus(
          {
            expiration: new Date().getTime() / 1000 + 100,
            transactions: [{ status: 'pending' }],
          },
          1
        )
      ).toBe('pending')
    })

    it('submitted', () => {
      expect.assertions(1)

      expect(
        getKeyStatus(
          {
            expiration: new Date().getTime() / 1000 + 100,
            transactions: [{ status: 'submitted' }],
          },
          1
        )
      ).toBe('submitted')
    })

    it('confirming', () => {
      expect.assertions(1)

      expect(
        getKeyStatus(
          {
            expiration: new Date().getTime() / 1000 + 100,
            transactions: [{ status: 'mined', confirmations: 0 }],
          },
          1
        )
      ).toBe('confirming')
    })

    it('valid', () => {
      expect.assertions(1)

      expect(
        getKeyStatus(
          {
            expiration: new Date().getTime() / 1000 + 10000,
            transactions: [{ status: 'mined', confirmations: 1 }],
          },
          1
        )
      ).toBe('valid')
    })

    it('expired', () => {
      expect.assertions(1)

      expect(
        getKeyStatus(
          {
            transactions: [{ status: 'mined', confirmations: 1 }],
            expiration: 1,
          },
          1
        )
      ).toBe('expired')
    })
  })

  describe('linkTransactionToKey', () => {
    it('uses the newest transaction', () => {
      expect.assertions(1)
      setAccount('account')
      const key = {
        id: 'lock-account',
        lock: 'lock',
        owner: 'account',
        expiration: new Date().getTime() / 1000 + 1000,
      }
      const transactions = {
        transaction3: {
          hash: 'transaction3',
          lock: 'lock',
          from: 'account',
          for: 'account',
          to: 'lock',
          key: 'lock-account',
          confirmations: 120,
          status: 'mined',
          blockNumber: 2,
        },
        transaction: {
          hash: 'transaction',
          lock: 'lock',
          from: 'account',
          for: 'account',
          to: 'lock',
          key: 'lock-account',
          confirmations: 123,
          status: 'mined',
          blockNumber: 1,
        },
        transaction2: {
          hash: 'transaction2',
          lock: 'lock',
          from: 'another account',
          for: 'account',
          to: 'lock',
          key: 'lock-account',
          confirmations: 0,
          status: 'mined',
          blockNumber: 12,
        },
      }

      expect(
        linkTransactionsToKey({
          key,
          transactions,
          requiredConfirmations: 1,
        })
      ).toEqual({
        ...key,
        confirmations: 0,
        transactions: [
          transactions.transaction2,
          transactions.transaction3,
          transactions.transaction,
        ],
        status: 'confirming',
      })
    })

    it('none', () => {
      expect.assertions(1)

      const key = {
        id: 'lock-account',
        lock: 'lock',
        owner: 'account',
        expiration: 0,
      }
      const transactions = {
        notme: {
          hash: 'notme',
          from: 'another account',
          to: 'lock',
          type: TRANSACTION_TYPES.KEY_PURCHASE,
          blockNumber: 123,
          confirmations: 12345,
          status: 'mined',
        },
      }

      expect(
        linkTransactionsToKey({
          key,
          transactions,
          requiredConfirmations: 1,
        })
      ).toEqual({
        ...key,
        confirmations: 0,
        status: 'none',
        transactions: [],
      })
    })

    it('submitted', () => {
      expect.assertions(1)

      const key = {
        id: 'lock-account',
        lock: 'lock',
        owner: 'account',
        expiration: new Date().getTime() / 1000 + 100,
      }
      const transactions = {
        submitted: {
          hash: null,
          from: 'account',
          for: 'account',
          to: 'lock',
          type: TRANSACTION_TYPES.KEY_PURCHASE,
          blockNumber: MAX_UINT,
          confirmations: 0,
          status: 'submitted',
        },
        old: {
          hash: 'old',
          from: 'account',
          for: 'account',
          to: 'lock',
          type: TRANSACTION_TYPES.KEY_PURCHASE,
          blockNumber: 123,
          confirmations: 12345,
          status: 'mined',
        },
      }

      expect(
        linkTransactionsToKey({
          key,
          transactions,
          requiredConfirmations: 1,
        })
      ).toEqual({
        ...key,
        transactions: [transactions.submitted, transactions.old],
        status: 'submitted',
        confirmations: 0,
      })
    })

    it('pending', () => {
      expect.assertions(1)

      const key = {
        id: 'lock-account',
        lock: 'lock',
        owner: 'account',
        expiration: new Date().getTime() / 1000 + 100,
      }
      const transactions = {
        new: {
          hash: 'new',
          from: 'account',
          for: 'account',
          to: 'lock',
          type: TRANSACTION_TYPES.KEY_PURCHASE,
          blockNumber: MAX_UINT,
          confirmations: 0,
          status: 'pending',
        },
        old: {
          hash: 'old',
          from: 'account',
          for: 'account',
          to: 'lock',
          type: TRANSACTION_TYPES.KEY_PURCHASE,
          blockNumber: 123,
          confirmations: 12345,
          status: 'mined',
        },
      }

      expect(
        linkTransactionsToKey({
          key,
          transactions,
          requiredConfirmations: 1,
        })
      ).toEqual({
        ...key,
        transactions: [transactions.new, transactions.old],
        status: 'pending',
        confirmations: 0,
      })
    })

    it('confirming', () => {
      expect.assertions(1)

      const key = {
        id: 'lock-account',
        lock: 'lock',
        owner: 'account',
        expiration: new Date().getTime() / 1000 + 10000,
      }
      const transactions = {
        confirming: {
          hash: 'confirming',
          from: 'account',
          for: 'account',
          to: 'lock',
          type: TRANSACTION_TYPES.KEY_PURCHASE,
          blockNumber: 234,
          confirmations: 2,
          status: 'mined',
        },
        old: {
          hash: 'old',
          from: 'account',
          for: 'account',
          to: 'lock',
          type: TRANSACTION_TYPES.KEY_PURCHASE,
          blockNumber: 123,
          confirmations: 12345,
          status: 'mined',
        },
      }

      expect(
        linkTransactionsToKey({
          key,
          transactions,
          requiredConfirmations: 5,
        })
      ).toEqual({
        ...key,
        transactions: [transactions.confirming, transactions.old],
        status: 'confirming',
        confirmations: 2,
      })
    })

    it('valid', () => {
      expect.assertions(1)

      const key = {
        id: 'lock-account',
        lock: 'lock',
        owner: 'account',
        expiration: new Date().getTime() / 1000 + 10000,
      }
      const transactions = {
        confirming: {
          hash: 'confirming',
          from: 'account',
          for: 'account',
          to: 'lock',
          type: TRANSACTION_TYPES.KEY_PURCHASE,
          blockNumber: 234,
          confirmations: 6,
          status: 'mined',
        },
        old: {
          hash: 'old',
          from: 'account',
          for: 'account',
          to: 'lock',
          type: TRANSACTION_TYPES.KEY_PURCHASE,
          blockNumber: 123,
          confirmations: 12345,
          status: 'mined',
        },
      }

      expect(
        linkTransactionsToKey({
          key,
          transactions,
          requiredConfirmations: 5,
        })
      ).toEqual({
        ...key,
        transactions: [transactions.confirming, transactions.old],
        status: 'valid',
        confirmations: 6,
      })
    })

    it('expired', () => {
      expect.assertions(1)

      const key = {
        id: 'lock-account',
        lock: 'lock',
        owner: 'account',
        expiration: new Date().getTime() / 1000 - 10000,
      }
      const transactions = {
        confirming: {
          hash: 'confirming',
          from: 'account',
          for: 'account',
          to: 'lock',
          type: TRANSACTION_TYPES.KEY_PURCHASE,
          blockNumber: 234,
          confirmations: 6,
          status: 'mined',
        },
        old: {
          hash: 'old',
          from: 'account',
          for: 'account',
          to: 'lock',
          type: TRANSACTION_TYPES.KEY_PURCHASE,
          blockNumber: 123,
          confirmations: 12345,
          status: 'mined',
        },
      }

      expect(
        linkTransactionsToKey({
          key,
          transactions,
          requiredConfirmations: 5,
        })
      ).toEqual({
        ...key,
        transactions: [transactions.confirming, transactions.old],
        status: 'expired',
        confirmations: 6,
      })
    })

    it('expired while confirming', () => {
      expect.assertions(1)

      const key = {
        id: 'lock-account',
        lock: 'lock',
        owner: 'account',
        expiration: new Date().getTime() / 1000 - 10000,
      }
      const transactions = {
        confirming: {
          hash: 'confirming',
          from: 'account',
          for: 'account',
          to: 'lock',
          type: TRANSACTION_TYPES.KEY_PURCHASE,
          blockNumber: 234,
          confirmations: 4,
          status: 'mined',
        },
        old: {
          hash: 'old',
          from: 'account',
          for: 'account',
          to: 'lock',
          type: TRANSACTION_TYPES.KEY_PURCHASE,
          blockNumber: 123,
          confirmations: 12345,
          status: 'mined',
        },
      }

      expect(
        linkTransactionsToKey({
          key,
          transactions,
          requiredConfirmations: 5,
        })
      ).toEqual({
        ...key,
        transactions: [transactions.confirming, transactions.old],
        status: 'expired',
        confirmations: 4,
      })
    })
  })

  describe('linkTransactionsToKeys', () => {
    it('uses the newest transaction', () => {
      expect.assertions(1)
      setAccount('account')
      const keys = {
        'lock-account': {
          id: 'lock-account',
          lock: 'lock',
          owner: 'account',
          expiration: new Date().getTime() / 1000 + 1000,
        },
        'lock 2-account': {
          id: 'lock 2-account',
          lock: 'lock 2',
          owner: 'account',
          expiration: new Date().getTime() / 1000 + 1000,
        },
      }
      const transactions = {
        transaction3: {
          hash: 'transaction3',
          lock: 'lock',
          from: 'account',
          for: 'account',
          to: 'lock',
          key: 'lock-account',
          confirmations: 120,
          status: 'mined',
          blockNumber: 2,
        },
        transaction: {
          hash: 'transaction',
          lock: 'lock',
          from: 'account',
          for: 'account',
          to: 'lock',
          key: 'lock-account',
          confirmations: 123,
          status: 'mined',
          blockNumber: 1,
        },
        transaction2: {
          hash: 'transaction2',
          lock: 'lock',
          from: 'account',
          for: 'account',
          to: 'lock',
          key: 'lock-account',
          confirmations: 0,
          status: 'mined',
          blockNumber: 12,
        },
      }
      const locks = ['lock', 'lock2']

      expect(
        linkTransactionsToKeys({
          keys,
          transactions,
          locks,
          requiredConfirmations: 1,
        })
      ).toEqual({
        ...keys,
        'lock 2-account': {
          ...keys['lock 2-account'],
          status: 'valid',
          confirmations: 0,
          transactions: [],
        },
        'lock-account': {
          ...keys['lock-account'],
          confirmations: 0,
          transactions: [
            transactions.transaction2,
            transactions.transaction3,
            transactions.transaction,
          ],
          status: 'confirming',
        },
      })
    })

    it('none', () => {
      expect.assertions(1)

      const keys = {
        'lock-account': {
          id: 'lock-account',
          lock: 'lock',
          owner: 'account',
          expiration: 0,
          confirmations: 0,
          transactions: [],
          status: 'none',
        },
      }
      const transactions = {
        notme: {
          hash: 'notme',
          from: 'account',
          for: 'another account',
          to: 'lock',
          type: TRANSACTION_TYPES.KEY_PURCHASE,
          blockNumber: 123,
          confirmations: 12345,
          status: 'mined',
        },
      }

      expect(
        linkTransactionsToKeys({
          keys,
          transactions,
          locks: ['lock'],
          requiredConfirmations: 1,
        })
      ).toEqual(keys)
    })

    it('submitted', () => {
      expect.assertions(1)

      const keys = {
        'lock-account': {
          id: 'lock-account',
          lock: 'lock',
          owner: 'account',
          expiration: new Date().getTime() / 1000 + 100,
          transaction: [],
          status: 'none',
        },
      }
      const transactions = {
        submitted: {
          hash: null,
          from: 'account',
          for: 'account',
          to: 'lock',
          type: TRANSACTION_TYPES.KEY_PURCHASE,
          blockNumber: MAX_UINT,
          confirmations: 0,
          status: 'submitted',
        },
        old: {
          hash: 'old',
          from: 'account',
          for: 'account',
          to: 'lock',
          type: TRANSACTION_TYPES.KEY_PURCHASE,
          blockNumber: 123,
          confirmations: 12345,
          status: 'mined',
        },
      }

      expect(
        linkTransactionsToKeys({
          keys,
          transactions,
          locks: ['lock'],
          requiredConfirmations: 1,
        })
      ).toEqual({
        'lock-account': {
          ...keys['lock-account'],
          transactions: [transactions.submitted, transactions.old],
          status: 'submitted',
          confirmations: 0,
        },
      })
    })

    it('pending', () => {
      expect.assertions(1)

      const keys = {
        'lock-account': {
          id: 'lock-account',
          lock: 'lock',
          owner: 'account',
          expiration: new Date().getTime() / 1000 + 100,
          transaction: [],
          status: 'none',
        },
      }
      const transactions = {
        new: {
          hash: 'new',
          from: 'account',
          for: 'account',
          to: 'lock',
          type: TRANSACTION_TYPES.KEY_PURCHASE,
          blockNumber: MAX_UINT,
          confirmations: 0,
          status: 'pending',
        },
        old: {
          hash: 'old',
          from: 'account',
          for: 'account',
          to: 'lock',
          type: TRANSACTION_TYPES.KEY_PURCHASE,
          blockNumber: 123,
          confirmations: 12345,
          status: 'mined',
        },
      }

      expect(
        linkTransactionsToKeys({
          keys,
          transactions,
          locks: ['lock'],
          requiredConfirmations: 1,
        })
      ).toEqual({
        'lock-account': {
          ...keys['lock-account'],
          transactions: [transactions.new, transactions.old],
          status: 'pending',
          confirmations: 0,
        },
      })
    })

    it('confirming', () => {
      expect.assertions(1)

      const keys = {
        'lock-account': {
          id: 'lock-account',
          lock: 'lock',
          owner: 'account',
          expiration: new Date().getTime() / 1000 + 10000,
          transaction: [],
          status: 'none',
        },
      }
      const transactions = {
        confirming: {
          hash: 'confirming',
          from: 'account',
          for: 'account',
          to: 'lock',
          type: TRANSACTION_TYPES.KEY_PURCHASE,
          blockNumber: 234,
          confirmations: 2,
          status: 'mined',
        },
        old: {
          hash: 'old',
          from: 'account',
          for: 'account',
          to: 'lock',
          type: TRANSACTION_TYPES.KEY_PURCHASE,
          blockNumber: 123,
          confirmations: 12345,
          status: 'mined',
        },
      }

      expect(
        linkTransactionsToKeys({
          keys,
          transactions,
          locks: ['lock'],
          requiredConfirmations: 5,
        })
      ).toEqual({
        'lock-account': {
          ...keys['lock-account'],
          transactions: [transactions.confirming, transactions.old],
          status: 'confirming',
          confirmations: 2,
        },
      })
    })

    it('valid', () => {
      expect.assertions(1)

      const keys = {
        'lock-account': {
          id: 'lock-account',
          lock: 'lock',
          owner: 'account',
          expiration: new Date().getTime() / 1000 + 10000,
          transaction: [],
          status: 'none',
        },
      }
      const transactions = {
        confirming: {
          hash: 'confirming',
          from: 'account',
          for: 'account',
          to: 'lock',
          type: TRANSACTION_TYPES.KEY_PURCHASE,
          blockNumber: 234,
          confirmations: 6,
          status: 'mined',
        },
        old: {
          hash: 'old',
          from: 'account',
          for: 'account',
          to: 'lock',
          type: TRANSACTION_TYPES.KEY_PURCHASE,
          blockNumber: 123,
          confirmations: 12345,
          status: 'mined',
        },
      }

      expect(
        linkTransactionsToKeys({
          keys,
          transactions,
          locks: ['lock'],
          requiredConfirmations: 5,
        })
      ).toEqual({
        'lock-account': {
          ...keys['lock-account'],
          transactions: [transactions.confirming, transactions.old],
          status: 'valid',
          confirmations: 6,
        },
      })
    })

    it('expired', () => {
      expect.assertions(1)

      const keys = {
        'lock-account': {
          id: 'lock-account',
          lock: 'lock',
          owner: 'account',
          expiration: new Date().getTime() / 1000 - 10000,
          transaction: [],
          status: 'none',
        },
      }
      const transactions = {
        confirming: {
          hash: 'confirming',
          from: 'account',
          for: 'account',
          to: 'lock',
          type: TRANSACTION_TYPES.KEY_PURCHASE,
          blockNumber: 234,
          confirmations: 6,
          status: 'mined',
        },
        old: {
          hash: 'old',
          from: 'account',
          for: 'account',
          to: 'lock',
          type: TRANSACTION_TYPES.KEY_PURCHASE,
          blockNumber: 123,
          confirmations: 12345,
          status: 'mined',
        },
      }

      expect(
        linkTransactionsToKeys({
          keys,
          transactions,
          locks: ['lock'],
          requiredConfirmations: 5,
        })
      ).toEqual({
        'lock-account': {
          ...keys['lock-account'],
          transactions: [transactions.confirming, transactions.old],
          status: 'expired',
          confirmations: 6,
        },
      })
    })

    it('expired while confirming', () => {
      expect.assertions(1)

      const keys = {
        'lock-account': {
          id: 'lock-account',
          lock: 'lock',
          owner: 'account',
          expiration: new Date().getTime() / 1000 - 10000,
          transaction: [],
          status: 'none',
        },
      }
      const transactions = {
        confirming: {
          hash: 'confirming',
          from: 'account',
          for: 'account',
          to: 'lock',
          type: TRANSACTION_TYPES.KEY_PURCHASE,
          blockNumber: 234,
          confirmations: 4,
          status: 'mined',
        },
        old: {
          hash: 'old',
          from: 'account',
          for: 'account',
          to: 'lock',
          type: TRANSACTION_TYPES.KEY_PURCHASE,
          blockNumber: 123,
          confirmations: 12345,
          status: 'mined',
        },
      }

      expect(
        linkTransactionsToKeys({
          keys,
          transactions,
          locks: ['lock'],
          requiredConfirmations: 5,
        })
      ).toEqual({
        'lock-account': {
          ...keys['lock-account'],
          transactions: [transactions.confirming, transactions.old],
          status: 'expired',
          confirmations: 4,
        },
      })
    })
  })
})
