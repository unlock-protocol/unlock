/**
 * Yields true if we should be optimistic for user and the locks
 * @param locks
 * @param user
 */
export const optimisticUnlocking = async (
  locksmithUri: string,
  locks: string[],
  user: string
) => {
  const userTransactions = await getTransactionsForUserAndLocks(
    locksmithUri,
    user,
    locks
  )
  const unlocked = await Promise.all(
    userTransactions.map((transaction: any) => {
      return willUnlock(
        user,
        transaction.recipient,
        transaction.transactionHash
      )
    })
  )

  const reducer = (accumulator: any, currentValue: any) =>
    currentValue || !!accumulator

  return unlocked.reduce(reducer, false)
}

/**
 * This method will query the backend to ensure that a transaction will succeed in generating a key for that user.
 * @param user
 * @param lock
 * @param transactionHash
 */
export const willUnlock = async (
  user: string,
  lock: string,
  transactionHash: string
) => {
  if (user && lock && transactionHash) {
    // TODO: implement!
    return true
  }
  return false
}

/**
 * Returns all transactions from a user to a lock
 * @param locksmithUri
 * @param user
 * @param locks
 */
export const getTransactionsForUserAndLocks = async (
  locksmithUri: string,
  user: string,
  locks: string[]
) => {
  const filterLocks = locks
    .map(
      (lockAddress: string) => `recipient[]=${encodeURIComponent(lockAddress)}`
    )
    .join('&')

  const url = `${locksmithUri}/transactions?for=${user}&${filterLocks}`
  const response = await fetch(url)
  const body = await response.json()
  return body.transactions
}

export default optimisticUnlocking
