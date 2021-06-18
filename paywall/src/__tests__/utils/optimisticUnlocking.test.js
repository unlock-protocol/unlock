/* eslint-disable no-import-assign */
import * as OptimisticUnlocking from '../../utils/optimisticUnlocking'
import * as TransactionUtil from '../../utils/getTransaction'
import * as Keys from '../../utils/keyExpirationTimestampFor'

const user = '0xuser'
const lock = '0xlock'
const locks = [lock, '0xanother']
const transaction = '0xtransaction'
const locksmithUri = 'https://locksmith.unlock-protocol.com'

const { readOnlyProvider } = __ENVIRONMENT_VARIABLES__ /* eslint no-undef: 0 */

const savedTransactions = [
  {
    recipient: lock,
    transactionHash: '0xtransactionHash',
    createdAt: new Date().toDateString(),
  },
  {
    recipient: lock,
    transactionHash: '0xtransactionHash2',
  },
]

describe('optimisticUnlocking', () => {
  it('should yield true if any transaction is optimistic', async () => {
    expect.assertions(4)
    jest
      .spyOn(OptimisticUnlocking, 'getTransactionsForUserAndLocks')
      .mockImplementationOnce(() => {
        return savedTransactions
      })

    jest.spyOn(OptimisticUnlocking, 'willUnlock').mockImplementationOnce(() => {
      return true
    })

    const optimistic = await OptimisticUnlocking.optimisticUnlocking(
      readOnlyProvider,
      locksmithUri,
      locks,
      user
    )
    expect(optimistic).toBe(true)
    expect(
      OptimisticUnlocking.getTransactionsForUserAndLocks
    ).toHaveBeenCalledWith(locksmithUri, user, locks)
    expect(OptimisticUnlocking.willUnlock).toHaveBeenCalledTimes(1)
    expect(OptimisticUnlocking.willUnlock).toHaveBeenNthCalledWith(
      1,
      readOnlyProvider,
      user,
      lock,
      '0xtransactionHash',
      false
    )
  })
})

describe('getTransactionsForUserAndLocks', () => {
  it('should yield the relevant transactions for that user', async () => {
    expect.assertions(3)
    fetch.mockResponseOnce(
      JSON.stringify({
        transactions: savedTransactions,
      })
    )
    const transactions =
      await OptimisticUnlocking.getTransactionsForUserAndLocks(
        locksmithUri,
        user,
        locks
      )
    expect(transactions).toEqual(savedTransactions)
    expect(fetch.mock.calls.length).toEqual(1)
    expect(fetch.mock.calls[0][0]).toEqual(
      `${locksmithUri}/transactions?for=0xuser&recipient[]=0xlock&recipient[]=0xanother`
    )
  })
})

describe('willUnlock', () => {
  describe('when the transaction does not exist', () => {
    beforeEach(() => {
      TransactionUtil.getTransaction = jest.fn(() => {
        return Promise.resolve(null)
      })
    })
    it('should return true if optimistcIfMissing is true', async () => {
      expect.assertions(1)
      const willUnlock = await OptimisticUnlocking.willUnlock(
        readOnlyProvider,
        user,
        lock,
        transaction,
        true
      )
      expect(willUnlock).toBe(true)
    })
    it('should return false if optimistcIfMissing is false', async () => {
      expect.assertions(1)
      const willUnlock = await OptimisticUnlocking.willUnlock(
        readOnlyProvider,
        user,
        lock,
        transaction,
        false
      )
      expect(willUnlock).toBe(false)
    })
  })
  describe('when the transaction exists', () => {
    it('should return true if the transaction has not been mined', async () => {
      expect.assertions(1)
      TransactionUtil.getTransaction = jest.fn(() => {
        return Promise.resolve({
          blockNumber: null,
        })
      })

      expect(
        await OptimisticUnlocking.willUnlock(
          readOnlyProvider,
          user,
          lock,
          transaction,
          true
        )
      ).toBe(true)
    })

    describe('if the transaction has been mined', () => {
      it('should return false if the transaction has been mined and no key was created', async () => {
        expect.assertions(1)

        Keys.keyExpirationTimestampFor = jest.fn(() => Promise.resolve(0))

        TransactionUtil.getTransaction = jest.fn(() => {
          return Promise.resolve({
            blockNumber: 1337,
          })
        })

        expect(
          await OptimisticUnlocking.willUnlock(
            readOnlyProvider,
            user,
            lock,
            transaction,
            true
          )
        ).toBe(false)
      })

      it('should return true if the transaction has been mined and a key was created', async () => {
        expect.assertions(1)

        Keys.keyExpirationTimestampFor = jest.fn(() =>
          Promise.resolve(new Date().getTime() / 1000 + 60)
        )

        TransactionUtil.getTransaction = jest.fn(() => {
          return Promise.resolve({
            blockNumber: 1337,
          })
        })

        expect(
          await OptimisticUnlocking.willUnlock(
            readOnlyProvider,
            user,
            lock,
            transaction,
            true
          )
        ).toBe(true)
      })
    })
  })
})
