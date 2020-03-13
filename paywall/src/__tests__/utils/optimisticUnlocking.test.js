import * as OptimisticUnlocking from '../../utils/optimisticUnlocking'

const user = '0xuser'
const lock = '0xlock'
const locks = [lock, '0xanother']
const transaction = '0xtransaction'
const locksmithUri = 'https://locksmith.unlock-protocol.com'

const savedTransactions = [
  {
    recipient: lock,
    transactionHash: '0xtransactionHash',
  },
  {
    recipient: lock,
    transactionHash: '0xtransactionHash2',
  },
]

describe('optimisticUnlocking', () => {
  it('should yield true if any transaction is optimistic', async () => {
    expect.assertions(5)
    jest
      .spyOn(OptimisticUnlocking, 'getTransactionsForUserAndLocks')
      .mockImplementationOnce(() => {
        return savedTransactions
      })

    jest.spyOn(OptimisticUnlocking, 'willUnlock').mockImplementationOnce(() => {
      return true
    })

    const optimistic = await OptimisticUnlocking.optimisticUnlocking(
      locksmithUri,
      locks,
      user
    )
    expect(optimistic).toBe(true)
    expect(
      OptimisticUnlocking.getTransactionsForUserAndLocks
    ).toHaveBeenCalledWith(locksmithUri, user, locks)
    expect(OptimisticUnlocking.willUnlock).toHaveBeenCalledTimes(
      savedTransactions.length
    )
    expect(OptimisticUnlocking.willUnlock).toHaveBeenNthCalledWith(
      1,
      user,
      lock,
      '0xtransactionHash'
    )
    expect(OptimisticUnlocking.willUnlock).toHaveBeenNthCalledWith(
      2,
      user,
      lock,
      '0xtransactionHash2'
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
    const transactions = await OptimisticUnlocking.getTransactionsForUserAndLocks(
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
  it('should return true', async () => {
    expect.assertions(1)
    expect(await OptimisticUnlocking.willUnlock(user, lock, transaction)).toBe(
      true
    )
  })
})
