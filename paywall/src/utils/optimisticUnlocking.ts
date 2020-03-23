interface StoredTransaction {
  transactionHash: string
  sender: string
  recipient: string
  chain: number
  for: string
  data: string
  createdAt: string
  updatedAt: string
}

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

  const recentTransactions = userTransactions.filter(tx =>
    withinLast24Hours(tx.createdAt)
  )

  const unlocked = await Promise.all(
    recentTransactions.map(transaction => {
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
): Promise<StoredTransaction[]> => {
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

export const withinLast24Hours = (dateString: string) => {
  const oneDay = 86400000 // 24 * 60 * 60 * 1000
  const yesterday = Date.now() - oneDay
  const date = new Date(dateString).getTime()

  return date > yesterday
}

export default optimisticUnlocking
