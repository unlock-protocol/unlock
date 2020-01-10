import {
  LocksmithTransactionsResult,
  TransactionDefaults,
} from '../blockchainHandler/blockChainTypes'

declare let __ENVIRONMENT_VARIABLES__: any

export const makeLockFilter = (lockAddresses: string[]) => {
  return lockAddresses
    .map(lockAddress => `recipient[]=${encodeURIComponent(lockAddress)}`)
    .join('&')
}

// Transactions stored in Locksmith have a somewhat different format
// than what we expect in the frontend code. This function takes a
// given transaction from Locksmith and turns it into what we want,
// providing some default values for data that isn't stored in
// Locksmith.
export const transformLocksmithTransaction = (
  t: LocksmithTransactionsResult
): TransactionDefaults => {
  return {
    createdAt: new Date(t.createdAt),
    to: t.recipient,
    for: t.for,
    from: t.sender,
    hash: t.transactionHash,
    input: t.data,
  }
}

export const getTransactionsFor = async (
  accountAddress: string,
  lockAddresses: string[]
): Promise<TransactionDefaults[]> => {
  const { locksmithUri } = __ENVIRONMENT_VARIABLES__
  const lockFilter = makeLockFilter(lockAddresses)

  const url = `${locksmithUri}/transactions?for=${accountAddress}&${lockFilter}`

  // TODO: check response.ok and fail early before awaiting JSON?
  const response = await window.fetch(url)
  const result: {
    transactions?: LocksmithTransactionsResult[]
  } = await response.json()

  if (result.transactions) {
    return result.transactions.map(transformLocksmithTransaction)
  }

  return []
}
