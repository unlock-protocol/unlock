import {
  validKey,
  getKeyStatus,
  linkTransactionsToKeys,
} from '../../../data-iframe/blockchainHandler/keyStatus'
import { setAccount } from '../../../data-iframe/blockchainHandler/account'

describe('key status manipulation', () => {
  describe('validKey', () => {
    it('returns true when expiration is in the future', () => {
      expect.assertions(1)

      expect(validKey({ expiration: new Date().getTime() / 1000 + 100 })).toBe(
        true
      )
    })

    it('returns false when expiration is in the past', () => {
      expect.assertions(1)

      expect(validKey({ expiration: new Date().getTime() / 1000 - 100 })).toBe(
        false
      )
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

      expect(getKeyStatus({ transactions: [{}] }, 1)).toBe('none')
    })

    it('pending', () => {
      expect.assertions(1)

      expect(getKeyStatus({ transactions: [{ status: 'pending' }] }, 1)).toBe(
        'pending'
      )
    })

    it('submitted', () => {
      expect.assertions(1)

      expect(getKeyStatus({ transactions: [{ status: 'submitted' }] }, 1)).toBe(
        'submitted'
      )
    })

    it('confirming', () => {
      expect.assertions(1)

      expect(
        getKeyStatus(
          { transactions: [{ status: 'mined', confirmations: 0 }] },
          1
        )
      ).toBe('confirming')
    })

    it('valid', () => {
      expect.assertions(1)

      expect(
        getKeyStatus(
          {
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
          transactions: {},
        },
        'lock 2-account': {
          id: 'lock 2-account',
          lock: 'lock 2',
          owner: 'account',
          expiration: new Date().getTime() / 1000 + 1000,
          transactions: {},
        },
      }
      const transactions = {
        transaction3: {
          hash: 'transaction3',
          lock: 'lock',
          from: 'account',
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
    it.todo('submitted')
    it.todo('confirming')
    it.todo('valid')
    it.todo('expired')
  })
})
