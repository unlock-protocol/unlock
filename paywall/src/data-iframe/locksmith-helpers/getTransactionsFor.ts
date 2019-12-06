import { TransactionStatus, TransactionType } from '../../unlockTypes'
import {
  LocksmithTransactionsResult,
  TransactionDefaults,
} from '../blockchainHandler/blockChainTypes'

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
    // All of these properties with literal values will be updated by
    // Web3Service when the transaction polling starts.
    status: TransactionStatus.SUBMITTED,
    confirmations: 0,
    type: TransactionType.KEY_PURCHASE,
    blockNumber: Number.MAX_SAFE_INTEGER,
  }
}

export const getTransactionsFor = async (
  accountAddress: string,
  lockAddresses: string[],
  locksmithUri: string
): Promise<TransactionDefaults[]> => {
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
