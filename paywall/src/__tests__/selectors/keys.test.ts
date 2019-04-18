import keyStatus from '../../selectors/keys'
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from '../../unlockTypes'

describe('keys selectors', () => {
  describe('keyStatus', () => {
    let transactions: { [key: string]: Transaction }

    beforeEach(() => {
      transactions = {
        one: {
          hash: 'one',
          status: TransactionStatus.MINED,
          type: TransactionType.KEY_PURCHASE,
          confirmations: 2,
          blockNumber: 1,
        },
      }
    })

    it('returns "none" if the key does not exist', () => {
      expect.assertions(1)

      expect(keyStatus('', {}, 12)).toBe('none')
    })

    it('returns "none" if the key does not exist in keys', () => {
      expect.assertions(1)

      expect(keyStatus('hi', {}, 12)).toBe('none')
    })

    it('returns "none" if the transaction status is falsy', () => {
      expect.assertions(1)

      transactions.one.status = TransactionStatus.NONE
      expect(
        keyStatus(
          'hi',
          {
            hi: {
              expiration: new Date().getTime() / 1000 + 10000,
              transactions,
            },
          },
          12
        )
      ).toBe('none')
    })

    it('returns transactoin status if the transaction status is not "mined"', () => {
      expect.assertions(2)

      transactions.one.status = TransactionStatus.PENDING
      expect(
        keyStatus(
          'hi',
          {
            hi: {
              expiration: new Date().getTime() / 1000 + 10000,
              transactions,
            },
          },
          12
        )
      ).toBe('pending')

      transactions.one.status = TransactionStatus.SUBMITTED
      expect(
        keyStatus(
          'hi',
          {
            hi: {
              expiration: new Date().getTime() / 1000 + 10000,
              transactions,
            },
          },
          12
        )
      ).toBe('submitted')
    })

    describe('mined transactions', () => {
      it('returns "confirming" if the transaction has fewer than the required confirmations', () => {
        expect.assertions(1)

        transactions.one.status = TransactionStatus.MINED
        expect(
          keyStatus(
            'hi',
            {
              hi: {
                expiration: new Date().getTime() / 1000 + 10000,
                transactions,
              },
            },
            12
          )
        ).toBe('confirming')
      })

      it('returns "valid" if the transaction has more than the required confirmations', () => {
        expect.assertions(1)

        transactions.one.status = TransactionStatus.MINED
        transactions.one.confirmations = 12345
        expect(
          keyStatus(
            'hi',
            {
              hi: {
                expiration: new Date().getTime() / 1000 + 10000,
                transactions,
              },
            },
            12
          )
        ).toBe('valid')
      })

      it('returns "expired" if the transaction is confirmed and key is old', () => {
        expect.assertions(1)

        transactions.one.status = TransactionStatus.MINED
        transactions.one.confirmations = 12345
        expect(
          keyStatus(
            'hi',
            {
              hi: {
                expiration: new Date().getTime() / 1000 - 10000,
                transactions,
              },
            },
            12
          )
        ).toBe('expired')
      })
    })
  })
})
